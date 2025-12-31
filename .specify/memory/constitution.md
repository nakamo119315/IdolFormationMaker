<!--
  Sync Impact Report
  ===================
  Version change: N/A (initial) → 1.0.0

  Modified principles: N/A (initial creation)

  Added sections:
  - Core Principles (5 principles)
  - Technical Standards
  - Development Workflow
  - Governance

  Removed sections: N/A (initial creation)

  Templates requiring updates:
  - .specify/templates/plan-template.md ✅ (Constitution Check section exists, compatible)
  - .specify/templates/spec-template.md ✅ (Requirements section compatible)
  - .specify/templates/tasks-template.md ✅ (Phase structure compatible)

  Follow-up TODOs: None
-->

# アイドル管理システム Constitution

## Core Principles

### I. レイヤードアーキテクチャ（DDD準拠）

依存関係の方向は外側から内側へ流れなければならない（Presentation → Application → Domain ← Infrastructure）。

- Domain層は他の層に依存してはならない。純粋なビジネスロジックのみを含む
- Application層はDomain層のみに依存する。ユースケースを実装する
- Infrastructure層はDomain層のインターフェースを実装する
- Presentation層はApplication層を呼び出す
- 集約はトランザクション整合性の境界であり、集約ルート経由でのみアクセスする

**根拠**: DDDに基づくクリーンアーキテクチャにより、ビジネスロジックの独立性を保ち、テスト容易性と保守性を確保する。

### II. Repository パターンと EF Core ガイドライン

永続化ロジックはRepository内で完結させ、EF Coreのトラッキング問題を回避する。

- Handler/UseCaseは存在チェック、DTO変換を行う。エンティティのNavigation Propertyを直接操作してはならない
- RepositoryはCRUD、子要素の操作、SaveChangesを行う。ChangeTrackerを直接操作してはならない
- 子エンティティを持つ集約の更新は、Repositoryに必要なデータを渡し、Repository内でInclude→操作→SaveChangesを完結させる
- データ構造用のrecordはDomain層のRepositoriesフォルダに定義する

**根拠**: EF Coreのトラッキング競合を防ぎ、予測可能な永続化動作を保証する。

### III. 型安全性（NON-NEGOTIABLE）

TypeScriptとC#の両方で厳格な型付けを強制する。

- TypeScript: `strict: true`、`noImplicitAny: true`、`strictNullChecks: true`を有効化する
- TypeScript: `any`型の使用を禁止する。APIレスポンスは必ず型定義する
- C#: nullable参照型を有効化する
- C#: 値オブジェクトはrecordを推奨する
- 例外はDomain層で定義する

**根拠**: コンパイル時のエラー検出により、ランタイムエラーを最小化し、リファクタリングの安全性を高める。

### IV. フロントエンド分離

管理アプリ（frontend-admin）と顧客向けアプリ（frontend-public）を明確に分離する。

- 管理アプリ: CRUD機能を持つ内部ツール
- 顧客向けアプリ: 参照専用、リッチなUI/UX、Tailwind CSS + Framer Motion
- 両アプリは同一のAPIを使用するが、独立してビルド・デプロイ可能でなければならない
- レスポンシブ設計: モバイルファースト、最低44pxのタップ領域を確保

**根拠**: 関心の分離により、各アプリのUXを最適化し、独立したリリースサイクルを可能にする。

### V. シンプルさ優先（YAGNI）

必要最小限の実装を行い、過剰な抽象化を避ける。

- 要求された機能のみを実装する。仮定に基づく拡張機能を追加してはならない
- 1回しか使わない操作のためのヘルパー/ユーティリティを作成してはならない
- エラーハンドリングは実際に発生しうるシナリオに限定する
- 初期DBはSQLite。PostgreSQL等への拡張は実際に必要になった時点で行う

**根拠**: 複雑さはバグの温床であり、保守コストを増大させる。必要になるまで作らない。

## Technical Standards

### ポート番号

| サービス | ポート |
|---------|--------|
| バックエンド API | 5059 |
| フロントエンド（管理） | 5173 |
| フロントエンド（公開） | 5174 |

### 技術スタック

- **バックエンド**: .NET 10、ASP.NET Core Minimal API
- **ORM**: Entity Framework Core
- **データベース**: SQLite（初期）、PostgreSQL/SQL Server（拡張時）
- **フロントエンド**: React 18、TypeScript、Vite、TanStack Query、React Router v6
- **スタイリング（管理）**: CSS
- **スタイリング（公開）**: Tailwind CSS、Framer Motion

### プロキシ設定

フロントエンド開発サーバーは`/api`をバックエンドにプロキシする。

## Development Workflow

### PR前の確認事項

すべてのPRは以下のチェックをパスしなければならない:

- [ ] `npm run build` が成功する
- [ ] `npm run lint` が成功する
- [ ] `dotnet build` が成功する
- [ ] `dotnet test` が成功する
- [ ] モバイルでの動作確認（公開アプリの場合）

### 新機能追加時のチェックリスト

- [ ] Domain層にエンティティ/値オブジェクト追加
- [ ] Repositoryインターフェース定義
- [ ] Application層にCommand/Query追加
- [ ] Infrastructure層にRepository実装
- [ ] Presentation層にController追加
- [ ] フロントエンドに型定義追加
- [ ] テスト追加

## Governance

### 憲法の位置づけ

本憲法はプロジェクトの最上位の設計指針であり、すべての実装・レビューはこれに準拠しなければならない。

### 改訂プロセス

1. 改訂提案をドキュメント化する
2. 影響を受けるテンプレート・コードを特定する
3. チームレビューと承認を得る
4. 憲法を更新し、バージョンを上げる
5. 必要に応じてマイグレーション計画を作成・実行する

### バージョニングポリシー

- **MAJOR**: 後方互換性のない原則の削除・再定義
- **MINOR**: 新しい原則・セクションの追加、ガイダンスの実質的な拡張
- **PATCH**: 文言の明確化、誤字修正、非意味的な改善

### コンプライアンスレビュー

- すべてのPR/コードレビューは憲法への準拠を確認する
- 複雑さの追加は正当化されなければならない
- 日常の開発ガイダンスはCLAUDE.mdを参照する

**Version**: 1.0.0 | **Ratified**: 2025-12-30 | **Last Amended**: 2025-12-30
