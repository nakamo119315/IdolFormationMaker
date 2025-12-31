# コントリビューションガイド

IDOL STAGE プロジェクトへの貢献を歓迎します。このドキュメントでは、開発に参加するためのガイドラインを説明します。

## 開発環境のセットアップ

### 必要なツール

- .NET 10 SDK Preview
- Node.js 18+
- Git

### クローンと起動

```bash
# リポジトリをクローン
git clone https://github.com/your-org/idol-stage.git
cd idol-stage

# バックエンドの起動
cd src/Presentation
~/.dotnet/dotnet run

# 管理画面の起動（別ターミナル）
cd frontend-admin
npm install
npm run dev

# 公開サイトの起動（別ターミナル）
cd frontend-public
npm install
npm run dev
```

## ブランチ戦略

- `main` - 本番環境にデプロイされるブランチ
- `feature/*` - 新機能開発用ブランチ
- `fix/*` - バグ修正用ブランチ
- `docs/*` - ドキュメント更新用ブランチ

```bash
# 新機能開発の例
git checkout -b feature/add-member-search
```

## コーディング規約

### C# (.NET)

- **アーキテクチャ**: DDD（ドメイン駆動設計）に従う
- **命名規則**: PascalCase（クラス、メソッド）、camelCase（ローカル変数）
- **ファイル配置**: `CLAUDE.md` のソースコード構成に従う

#### Repository パターン

Handler と Repository の責務を分離してください：

```csharp
// ✅ OK: Repository に必要なデータを渡す
await _repository.UpdateAsync(id, name, groupId, positions);

// ❌ NG: Handler でエンティティの Navigation Property を操作
var entity = await _repository.GetByIdAsync(id);
entity.ClearItems();  // トラッキング競合の可能性
```

詳細は `CLAUDE.md` の「Repository パターンと EF Core ガイドライン」を参照してください。

### TypeScript (React)

- **コンポーネント**: 関数コンポーネントを使用
- **状態管理**: TanStack Query でサーバー状態を管理
- **スタイリング**:
  - frontend-admin: カスタムCSS
  - frontend-public: Tailwind CSS

## テスト駆動開発 (TDD)

新機能を追加する場合は、TDD（テスト駆動開発）のアプローチを推奨します：

### TDD フロー

```
RED → GREEN → REFACTOR
 ↓       ↓        ↓
失敗する → テストを → コードを
テストを   通す最小  リファクタ
書く      コードを   リング
          書く
```

### テストカテゴリ

すべてのドメインエンティティに対して以下のテストを作成してください：

1. **不変条件テスト** - ID一意性、タイムスタンプ整合性
2. **境界値テスト** - 最大値、最小値、エッジケース
3. **エラーハンドリングテスト** - 例外発生、無効入力
4. **ビジネスルールテスト** - ドメイン固有のルール検証
5. **状態遷移テスト** - 更新による状態変化

### テスト実行

```bash
# 全テスト実行
~/.dotnet/dotnet test

# 特定のテストプロジェクト
~/.dotnet/dotnet test tests/Domain.Tests
~/.dotnet/dotnet test tests/Application.Tests
```

## プルリクエスト

### PR を作成する前に

1. テストがすべて通ることを確認
2. リントエラーがないことを確認
3. 変更に関連するドキュメントを更新

```bash
# バックエンドのテスト
~/.dotnet/dotnet test

# フロントエンドのリント
cd frontend-admin && npm run lint
cd frontend-public && npm run lint
```

### PR のタイトル

プレフィックスを使用してください：

- `feat:` - 新機能
- `fix:` - バグ修正
- `docs:` - ドキュメント更新
- `refactor:` - リファクタリング
- `test:` - テスト追加・修正
- `chore:` - その他（依存関係更新など）

例: `feat: メンバー検索にグループフィルタを追加`

### PR の説明

以下の情報を含めてください：

- 変更の概要
- 動作確認方法
- 関連する Issue 番号（あれば）

## コミットメッセージ

```
feat: メンバー検索にグループフィルタを追加

- GroupId パラメータを GetAllMembersQuery に追加
- MemberRepository でフィルタリングロジックを実装
- 単体テストを追加

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

## Issue の報告

バグや機能リクエストは Issue で報告してください。

### バグ報告

以下の情報を含めてください：

- 再現手順
- 期待される動作
- 実際の動作
- 環境情報（OS、ブラウザなど）

### 機能リクエスト

以下の情報を含めてください：

- 機能の概要
- ユースケース
- 期待される動作

## ドキュメント

### 主要なドキュメント

| ファイル | 説明 |
|----------|------|
| `README.md` | プロジェクト概要、起動方法 |
| `CLAUDE.md` | アーキテクチャ、設計原則、API仕様 |
| `PROJECT_TEMPLATE.md` | テンプレート、TDDガイドライン |
| `DEPLOY.md` | デプロイ手順 |
| `docs/IMPROVEMENTS.md` | 改善ログ、TODO |

### ドキュメントの更新

コードを変更した場合は、関連するドキュメントも更新してください：

- API エンドポイントの追加 → `README.md` と `CLAUDE.md` を更新
- 新しいコンポーネントの追加 → 該当する `README.md` を更新
- アーキテクチャの変更 → `CLAUDE.md` を更新

## ライセンス

このプロジェクトへの貢献は、プロジェクトのライセンスに従って公開されます。
