# プロジェクト設計テンプレート（Claude Code 用）

このドキュメントは、新規プロジェクト開始時に Claude Code が参照するための最低限の情報をまとめたものです。

---

## 1. プロジェクト概要（必須）

```markdown
## 概要
[1-2文でプロジェクトの目的を記載]

## 技術スタック
- バックエンド:
- フロントエンド:
- データベース:
- デプロイ先:
```

---

## 2. アーキテクチャ方針（必須）

### レイヤー構成と依存方向

```
Presentation → Application → Domain ← Infrastructure
```

- **Domain層**: 他に依存しない。純粋なビジネスロジック
- **Application層**: Domain のみに依存。ユースケース実装
- **Infrastructure層**: Domain のインターフェースを実装
- **Presentation層**: Application を呼び出す

### Repository パターン（ORM使用時は必須）

| 層 | 責務 | やること | やらないこと |
|----|------|----------|-------------|
| Handler/UseCase | ロジック調整 | 存在チェック、DTO変換 | エンティティの直接操作 |
| Repository | 永続化 | CRUD、子要素の操作、SaveChanges | ChangeTracker操作 |

#### 子エンティティを持つ集約の更新

```csharp
// ❌ NG: Handler でエンティティを操作
var entity = await _repo.GetByIdAsync(id);
entity.Children.Clear();  // トラッキング問題発生
await _repo.UpdateAsync(entity);

// ✅ OK: Repository に必要なデータを渡す
await _repo.UpdateAsync(id, name, childrenData);

// Repository 内で完結
public async Task UpdateAsync(Guid id, string name, IEnumerable<ChildData> children)
{
    var entity = await _context.Entities.Include(e => e.Children).FirstAsync(e => e.Id == id);
    entity.Update(name);
    _context.Children.RemoveRange(entity.Children);
    // 新しい子要素を追加
    await _context.SaveChangesAsync();
}
```

---

## 3. コーディング規約（必須）

### TypeScript

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

- `any` 型禁止。必ず型を明示
- `as` によるキャスト最小限
- API レスポンスは必ず型定義

### C# / .NET

- nullable 参照型有効化
- 値オブジェクトは record 推奨
- 例外は Domain 層で定義

---

## 4. 設定・環境変数（必須）

### ポート番号

| サービス | ポート | 用途 |
|---------|--------|------|
| バックエンド | 5059 | API サーバー |
| フロントエンド（管理） | 5173 | 開発サーバー |
| フロントエンド（公開） | 5174 | 開発サーバー |

### 環境変数一覧

```bash
# .env.example として用意
DATABASE_URL=
API_URL=
CORS_ORIGINS=
```

### プロキシ設定

```typescript
// vite.config.ts
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:5059',  // バックエンドのポート
      changeOrigin: true,
    },
  },
}
```

---

## 5. よくある問題と対策

### EF Core トラッキング問題

**症状**: `The instance of entity type 'X' cannot be tracked because another instance with the same key value is already being tracked`

**原因**: 同一 DbContext 内で同じエンティティを複数回取得

**対策**: Repository 内で Include → 操作 → SaveChanges を完結させる

---

### TypeScript erasableSyntaxOnly エラー

**症状**: `This syntax is not allowed when 'erasableSyntaxOnly' is enabled`

**原因**: Node.js 23+ で TypeScript を直接実行時、enum や namespace が使えない

**対策**:
- `const enum` を使う
- または `tsconfig.json` で設定変更

---

### Cloudflare Pages API プロキシ

**症状**: API リクエストが 404 または CORS エラー

**対策**:
1. `_redirects` ファイルでプロキシ設定
2. または Worker/Functions で API 転送
3. `wrangler.toml` に `API_URL` を設定

---

### モバイルレイアウト崩れ

**対策**: 最初から以下を意識
- `min-width` より `max-width` + `width: 100%`
- Flexbox の `flex-wrap: wrap`
- タッチ操作のためのタップ領域確保（最低 44px）

---

### コミット漏れによるCIエラー

**症状**: ローカルでは動くが、CIでビルドエラー（`Cannot find module`、`does not exist in namespace`）

**原因**: 新規ファイルの依存先をコミットし忘れ

**対策**:

#### 1. コミット前に未追跡ファイルを確認
```bash
git status --short | grep "^??"  # 未追跡ファイルを表示
```
新しいファイルで `using`/`import` している先が `??` にあればコミット対象。

#### 2. 依存関係チェックリスト
| 追加ファイル | 確認すべき依存先 |
|-------------|-----------------|
| `Repository.cs` | `Exceptions/`, `AppDbContext.cs`, EF Configuration |
| `Handler.cs` | `Mappers/`, DTOs |
| `Page.tsx` | `components/`, `hooks/`, `api/` |
| `Controller.cs` | DI登録（`ServiceCollectionExtensions.cs`） |

#### 3. ステージング後にビルド確認
```bash
git stash --keep-index   # ステージされていないファイルを退避
dotnet build             # ステージされたファイルだけでビルド
npm run build            # フロントエンドも確認
git stash pop            # 退避を戻す
```

#### 4. 新機能のコミット時の必須ファイル
```bash
# 例: 新しい Conversation 機能
git add \
  src/Domain/Conversations/ \
  src/Application/Conversations/ \
  src/Application/Shared/Mappers/ConversationMapper.cs \
  src/Domain/Shared/Exceptions/ \
  src/Infrastructure/Persistence/Repositories/ConversationRepository.cs \
  src/Infrastructure/Persistence/Configurations/*Conversation*.cs \
  src/Infrastructure/Persistence/AppDbContext.cs \
  src/Infrastructure/DependencyInjection/ServiceCollectionExtensions.cs \
  src/Presentation/Controllers/ConversationsController.cs \
  frontend-public/src/api/conversations.ts \
  frontend-public/src/components/conversations/ \
  frontend-public/src/pages/Conversation*.tsx \
  tests/Application.Tests/Conversations/
```

---

## 6. チェックリスト

### PR 前の確認

- [ ] `git status` で未追跡ファイル（`??`）に必要なファイルがないか確認
- [ ] `npm run build` が通る
- [ ] `npm run lint` が通る
- [ ] `dotnet build` が通る
- [ ] `dotnet test` が通る
- [ ] モバイルでの動作確認

### 新機能追加時（TDD順序）

**Phase 1: Domain層（テスト先行）**
- [ ] 1-1. テストファイル作成（tests/Domain.Tests/[Context]/）
- [ ] 1-2. 品質テストを全て書く（RED状態で OK）
  - [ ] 不変条件テスト（ID、CreatedAt不変性）
  - [ ] 境界値テスト（最小/最大、特殊文字）
  - [ ] 異常系テスト（null/空文字、無効な引数）
  - [ ] ビジネスルール検証テスト
- [ ] 1-3. エンティティ/値オブジェクト実装（GREEN状態へ）
- [ ] 1-4. Repository インターフェース定義

**Phase 2: Application層（テスト先行）**
- [ ] 2-1. テストファイル作成（tests/Application.Tests/[Context]/）
- [ ] 2-2. Handler テストを書く（RED状態で OK）
  - [ ] フィルタリングテスト
  - [ ] DTOマッピングテスト
  - [ ] エッジケーステスト
- [ ] 2-3. Command/Query/Handler 実装（GREEN状態へ）

**Phase 3: Infrastructure/Presentation層**
- [ ] 3-1. Repository 実装
- [ ] 3-2. Controller 追加
- [ ] 3-3. 統合テスト（必要に応じて）

**Phase 4: フロントエンド**
- [ ] 4-1. 型定義追加
- [ ] 4-2. API クライアント追加
- [ ] 4-3. コンポーネント実装

---

## 7. 品質重視の単体テスト（必須）

### テストの目的

テストは「ビルドを通すため」ではなく「品質を担保するため」に書く。
以下のカテゴリを意識して、各エンティティ・ハンドラに対してテストを作成する。

### テスト駆動開発（TDD）フロー

新機能の実装は **必ずテストを先に書く** TDD方式で行う。

```
┌─────────────────────────────────────────────────────────────┐
│  1. RED: 品質テストを先に書く（失敗する）                    │
│     ↓                                                        │
│  2. GREEN: テストが通る最小限の実装を書く                    │
│     ↓                                                        │
│  3. REFACTOR: コードを整理（テストは通ったまま）             │
│     ↓                                                        │
│  4. 次のテストへ → 1に戻る                                   │
└─────────────────────────────────────────────────────────────┘
```

#### Step 1: テストファイルを先に作成

```bash
# 例: Product エンティティを追加する場合
# 実装ファイルより先にテストファイルを作成
tests/Domain.Tests/Products/ProductTests.cs  # ← 先に作成
src/Domain/Products/Entities/Product.cs       # ← 後で作成
```

#### Step 2: 品質テストを全て書く（RED状態）

```csharp
// ProductTests.cs - 実装前に全ての品質テストを書く
public class ProductTests
{
    #region 不変条件テスト

    [Fact]
    public void Create_ShouldGenerateUniqueIds()
    {
        var products = Enumerable.Range(0, 100)
            .Select(_ => Product.Create("Test", 100))
            .ToList();
        Assert.Equal(100, products.Select(p => p.Id).Distinct().Count());
    }

    [Fact]
    public void Update_CreatedAt_ShouldNotChange()
    {
        var product = Product.Create("Original", 100);
        var originalCreatedAt = product.CreatedAt;
        Thread.Sleep(10);
        product.Update("Updated", 200);
        Assert.Equal(originalCreatedAt, product.CreatedAt);
    }

    #endregion

    #region 境界値テスト

    [Theory]
    [InlineData(0)]    // 最小有効価格
    [InlineData(1)]
    public void Create_WithValidPrice_ShouldSucceed(decimal price)
    {
        var product = Product.Create("Test", price);
        Assert.Equal(price, product.Price);
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(-100)]
    public void Create_WithNegativePrice_ShouldThrow(decimal price)
    {
        Assert.Throws<ArgumentException>(() => Product.Create("Test", price));
    }

    #endregion

    #region 異常系テスト

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithInvalidName_ShouldThrow(string? name)
    {
        Assert.Throws<ArgumentException>(() => Product.Create(name!, 100));
    }

    [Fact]
    public void Update_WithInvalidData_ShouldNotModifyOriginal()
    {
        var product = Product.Create("Original", 100);
        var originalName = product.Name;
        try { product.Update("", 200); } catch { }
        Assert.Equal(originalName, product.Name);
    }

    #endregion

    #region ビジネスルール

    [Fact]
    public void Create_WithZeroPrice_ShouldBeAllowed()
    {
        // ビジネスルール: 無料商品（価格0）は許可
        var product = Product.Create("Free Sample", 0);
        Assert.Equal(0, product.Price);
    }

    #endregion
}
```

この時点でテストを実行すると **全て失敗する（RED）**。これが正しい状態。

```bash
dotnet test  # → 全てのテストが失敗することを確認
```

#### Step 3: テストが通る実装を書く（GREEN状態）

```csharp
// Product.cs - テストを通すための実装
public class Product : IEntity
{
    public Guid Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public decimal Price { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    private Product() { }

    public static Product Create(string name, decimal price)
    {
        // テストで要求された検証を実装
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name is required.", nameof(name));
        if (price < 0)
            throw new ArgumentException("Price cannot be negative.", nameof(price));

        var now = DateTime.UtcNow;
        return new Product
        {
            Id = Guid.NewGuid(),
            Name = name,
            Price = price,
            CreatedAt = now,
            UpdatedAt = now
        };
    }

    public void Update(string name, decimal price)
    {
        // 検証を先に行い、失敗したら何も変更しない
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name is required.", nameof(name));
        if (price < 0)
            throw new ArgumentException("Price cannot be negative.", nameof(price));

        Name = name;
        Price = price;
        UpdatedAt = DateTime.UtcNow;
        // CreatedAt は変更しない（テストで検証済み）
    }
}
```

```bash
dotnet test  # → 全てのテストが成功することを確認（GREEN）
```

#### Step 4: Application層も同様にTDDで実装

```csharp
// 1. 先にテストを書く
public class GetProductsHandlerTests
{
    [Fact]
    public async Task HandleAsync_WithPriceFilter_ShouldPassToRepository()
    {
        var minPrice = 100m;
        _mockRepository
            .Setup(r => r.GetAllAsync(minPrice, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Product>());

        var query = new GetProductsQuery(MinPrice: minPrice);
        await _handler.HandleAsync(query);

        _mockRepository.Verify(
            r => r.GetAllAsync(minPrice, It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task HandleAsync_ShouldMapAllProperties()
    {
        var product = Product.Create("Test", 100);
        _mockRepository.Setup(...).ReturnsAsync(new List<Product> { product });

        var result = (await _handler.HandleAsync(query)).Single();

        Assert.Equal(product.Id, result.Id);
        Assert.Equal("Test", result.Name);
        Assert.Equal(100, result.Price);
    }
}

// 2. テストが通るHandler実装を書く
```

### TDDの原則

| 原則 | 説明 |
|------|------|
| **テストを先に書く** | 実装コードを書く前にテストを完成させる |
| **1つずつ進める** | テストを1つ追加→実装→次のテスト、のサイクル |
| **最小限の実装** | テストを通す最小限のコードだけ書く |
| **リファクタリング** | GREEN になったらコードを整理（テストは壊さない） |
| **全てのテストを維持** | 新しい実装で既存テストが壊れたら修正 |

### TDDのメリット

1. **品質テストが漏れない** - 実装後にテストを書くと「通すためのテスト」になりがち
2. **設計が改善される** - テストしやすい = 疎結合な設計になる
3. **仕様が明確になる** - テストが仕様書の役割を果たす
4. **リグレッション防止** - 変更時に既存機能が壊れたらすぐ分かる

### テストカテゴリと必須項目

#### 1. 不変条件テスト（Invariant Tests）

エンティティが常に満たすべき条件を検証する。

```csharp
// ✅ 必須: IDのユニーク性
[Fact]
public void Create_ShouldGenerateUniqueIds()
{
    var entities = Enumerable.Range(0, 100)
        .Select(_ => Entity.Create("Test"))
        .ToList();

    var uniqueIds = entities.Select(e => e.Id).Distinct().Count();
    Assert.Equal(100, uniqueIds);
}

// ✅ 必須: CreatedAt は変更されない
[Fact]
public void Update_CreatedAt_ShouldNotChange()
{
    var entity = Entity.Create("Original");
    var originalCreatedAt = entity.CreatedAt;
    Thread.Sleep(10);

    entity.Update("Updated");

    Assert.Equal(originalCreatedAt, entity.CreatedAt);
}

// ✅ 必須: コレクションの不変性（IReadOnlyCollection）
[Fact]
public void Items_ShouldBeReadOnly()
{
    var parent = Parent.Create("Test");
    Assert.IsAssignableFrom<IReadOnlyCollection<Child>>(parent.Children);
}
```

#### 2. 境界値テスト（Boundary Tests）

入力値の限界を検証する。

```csharp
// ✅ 必須: 最小値・最大値
[Theory]
[InlineData(1)]           // 最小有効値
[InlineData(int.MaxValue)] // 最大値
public void Create_WithValidBoundary_ShouldSucceed(int value)
{
    var item = Item.Create(value);
    Assert.Equal(value, item.Value);
}

// ✅ 必須: 境界外
[Theory]
[InlineData(0)]
[InlineData(-1)]
public void Create_WithInvalidBoundary_ShouldThrow(int value)
{
    Assert.Throws<ArgumentException>(() => Item.Create(value));
}

// ✅ 推奨: 特殊文字・長い文字列
[Fact]
public void Create_WithSpecialCharacters_ShouldSucceed()
{
    var name = "山田☆太郎 (Jr.)【公式】";
    var entity = Entity.Create(name);
    Assert.Equal(name, entity.Name);
}
```

#### 3. 異常系テスト（Error Handling Tests）

エラー時の挙動を検証する。

```csharp
// ✅ 必須: 例外発生時に元データが変更されないこと
[Fact]
public void Update_WithInvalidData_ShouldNotModifyOriginal()
{
    var entity = Entity.Create("Original");
    var originalName = entity.Name;

    try { entity.Update(""); }  // 空文字で例外
    catch { }

    Assert.Equal(originalName, entity.Name);  // 元のまま
}

// ✅ 必須: null/空文字の検証
[Theory]
[InlineData(null)]
[InlineData("")]
[InlineData("   ")]
public void Create_WithInvalidName_ShouldThrow(string? name)
{
    Assert.Throws<ArgumentException>(() => Entity.Create(name!));
}
```

#### 4. ビジネスルール検証テスト（Business Rule Tests）

ドメインのビジネスルールを明示的にテストする。

```csharp
// ✅ 必須: 重複許可/禁止のルールを明確化
[Fact]
public void AddItem_SameMemberMultipleTimes_ShouldAllowDuplicates()
{
    // ビジネスルール: アンコールなど同一曲の複数回追加は許可
    var setlist = Setlist.Create("Live");
    var songId = Guid.NewGuid();

    setlist.AddItem(songId, 1);
    setlist.AddItem(songId, 10);  // アンコール

    Assert.Equal(2, setlist.Items.Count);
}

// ✅ 必須: 参加者の重複防止
[Fact]
public void AddParticipant_WithDuplicate_ShouldNotAddTwice()
{
    var item = SetlistItem.Create(Guid.NewGuid(), Guid.NewGuid(), 1);
    var memberId = Guid.NewGuid();

    item.AddParticipant(memberId);
    item.AddParticipant(memberId);  // 重複追加

    Assert.Single(item.Participants);  // 1件のまま
}
```

#### 5. 操作後の状態テスト（State Transition Tests）

操作後の状態が期待通りか検証する。

```csharp
// ✅ 必須: 操作がタイムスタンプを更新すること
[Fact]
public void AddItem_ShouldUpdateTimestamp()
{
    var parent = Parent.Create("Test");
    var originalUpdatedAt = parent.UpdatedAt;
    Thread.Sleep(10);

    parent.AddItem(Item.Create());

    Assert.True(parent.UpdatedAt > originalUpdatedAt);
}

// ✅ 必須: 無効な操作はタイムスタンプを更新しないこと
[Fact]
public void RemoveItem_WhenNotExists_ShouldNotUpdateTimestamp()
{
    var parent = Parent.Create("Test");
    var originalUpdatedAt = parent.UpdatedAt;

    parent.RemoveItem(Guid.NewGuid());  // 存在しないID

    Assert.Equal(originalUpdatedAt, parent.UpdatedAt);
}
```

### Application層テストの必須項目

```csharp
// ✅ 必須: フィルタパラメータがRepositoryに正しく渡されること
[Fact]
public async Task HandleAsync_WithFilters_ShouldPassToRepository()
{
    var groupId = Guid.NewGuid();
    _mockRepository
        .Setup(r => r.GetAllAsync(groupId, null, null, It.IsAny<CancellationToken>()))
        .ReturnsAsync(new List<Member>());

    var query = new GetMembersQuery(GroupId: groupId);
    await _handler.HandleAsync(query);

    _mockRepository.Verify(
        r => r.GetAllAsync(groupId, null, null, It.IsAny<CancellationToken>()),
        Times.Once);
}

// ✅ 必須: DTOマッピングが全プロパティを含むこと
[Fact]
public async Task HandleAsync_ShouldMapAllProperties()
{
    var member = Member.Create("Name", birthDate, "Tokyo", "Pink", "White", groupId, 3, true);
    _mockRepository.Setup(...).ReturnsAsync(new List<Member> { member });

    var result = (await _handler.HandleAsync(query)).Single();

    Assert.Equal(member.Id, result.Id);
    Assert.Equal("Name", result.Name);
    Assert.Equal("Tokyo", result.Birthplace);
    Assert.Equal("Pink", result.PenLightColor1);
    Assert.Equal(3, result.Generation);
    Assert.True(result.IsGraduated);
}
```

### アンチパターン（避けるべきテスト）

```csharp
// ❌ NG: 実装をなぞるだけのテスト（何も検証していない）
[Fact]
public void Create_ShouldWork()
{
    var entity = Entity.Create("Test");
    Assert.NotNull(entity);  // 当たり前すぎる
}

// ❌ NG: 複数の検証を1つのテストに詰め込む
[Fact]
public void Entity_AllBehaviors()  // 何をテストしているか不明
{
    var entity = Entity.Create("A");
    entity.Update("B");
    entity.AddChild(...);
    entity.RemoveChild(...);
    Assert.Equal("B", entity.Name);
}

// ❌ NG: タイミングに依存する脆いテスト
[Fact]
public void Create_Timestamps_ShouldBeExactlyEqual()
{
    var entity = Entity.Create("Test");
    Assert.Equal(entity.CreatedAt, entity.UpdatedAt);  // 微小な差で失敗する可能性
}

// ✅ OK: 許容範囲を設ける
[Fact]
public void Create_Timestamps_ShouldBeVeryClose()
{
    var entity = Entity.Create("Test");
    var diff = Math.Abs((entity.CreatedAt - entity.UpdatedAt).TotalMilliseconds);
    Assert.True(diff < 1, $"Diff was {diff}ms");
}
```

### テスト命名規則

```
[メソッド名]_[条件]_[期待結果]
```

例:
- `Create_WithValidData_ShouldCreateEntity`
- `Create_WithEmptyName_ShouldThrowArgumentException`
- `Update_CreatedAt_ShouldNotChange`
- `AddItem_WithDuplicateMember_ShouldNotAddTwice`

### 新機能追加時のテストチェックリスト

#### Domain層エンティティ
- [ ] 不変条件テスト（ID、CreatedAt不変性）
- [ ] 境界値テスト（最小/最大、特殊文字）
- [ ] 異常系テスト（null/空文字、無効な引数）
- [ ] ビジネスルール検証（重複、制約）
- [ ] コレクション操作テスト（追加/削除/クリア後の状態）
- [ ] タイムスタンプ更新テスト

#### Application層ハンドラ
- [ ] フィルタリングテスト（各パラメータがRepositoryに渡されるか）
- [ ] DTOマッピングテスト（全プロパティが正しく変換されるか）
- [ ] エッジケーステスト（空結果、CancellationToken）
- [ ] ページングテスト（TotalPages計算など）

---

## 8. ディレクトリ構成の雛形

```
project-root/
├── CLAUDE.md              # このプロジェクト固有の情報
├── src/
│   ├── Domain/
│   │   └── [Context]/
│   │       ├── Entities/
│   │       ├── ValueObjects/
│   │       └── Repositories/   # インターフェース
│   ├── Application/
│   │   └── [Context]/
│   │       ├── Commands/
│   │       ├── Queries/
│   │       └── DTOs/
│   ├── Infrastructure/
│   │   └── Persistence/
│   │       └── Repositories/   # 実装
│   └── Presentation/
│       └── Controllers/
├── frontend-admin/        # 管理画面
├── frontend-public/       # 公開画面（必要な場合）
└── tests/
```

---

## 9. Claude Code への指示テンプレート

新しい機能を追加する際は、以下の形式で依頼すると効率的：

```markdown
## 追加したい機能
[機能の概要]

## 開発方針
TDD（テスト駆動開発）で実装してください。
1. 品質テストを先に書く（RED）
2. テストが通る実装を書く（GREEN）
3. 必要に応じてリファクタリング

## 影響範囲
- [ ] Domain 層
- [ ] Application 層
- [ ] Infrastructure 層
- [ ] Presentation 層
- [ ] フロントエンド

## 参考にする既存コード
[類似の既存機能があれば記載]

## 制約・注意点
[特別な考慮事項があれば記載]
```

### TDD実装を依頼する例

```markdown
## 追加したい機能
商品（Product）エンティティを追加したい。
- 名前（必須）、価格（0以上）、在庫数を持つ
- 価格0は無料商品として許可

## 開発方針
TDDで実装してください。以下の品質テストを先に書いてから実装をお願いします：
- 不変条件（ID、CreatedAt）
- 境界値（価格0、マイナス価格）
- 異常系（空の名前）
- ビジネスルール（無料商品許可）

## 影響範囲
- [x] Domain 層（Product エンティティ）
- [x] Application 層（CRUD Handler）
- [x] Infrastructure 層（Repository）
- [x] Presentation 層（Controller）
- [ ] フロントエンド

## 参考にする既存コード
Member エンティティと同様の構成で
```
