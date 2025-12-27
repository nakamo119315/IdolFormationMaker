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

## 6. チェックリスト

### PR 前の確認

- [ ] `npm run build` が通る
- [ ] `npm run lint` が通る
- [ ] `dotnet build` が通る
- [ ] `dotnet test` が通る
- [ ] モバイルでの動作確認

### 新機能追加時

- [ ] Domain 層にエンティティ/値オブジェクト追加
- [ ] Repository インターフェース定義
- [ ] Application 層に Command/Query 追加
- [ ] Infrastructure 層に Repository 実装
- [ ] Presentation 層に Controller 追加
- [ ] フロントエンドに型定義追加
- [ ] テスト追加

---

## 7. ディレクトリ構成の雛形

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

## 8. Claude Code への指示テンプレート

新しい機能を追加する際は、以下の形式で依頼すると効率的：

```markdown
## 追加したい機能
[機能の概要]

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
