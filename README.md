# IDOL STAGE - アイドル管理システム

.NET 10 + React で構築されたアイドルグループ管理アプリケーションです。

## 機能概要

### バックエンド API
- **メンバー管理**: アイドルメンバーのCRUD操作、画像管理
- **グループ管理**: グループのCRUD操作
- **フォーメーション管理**: ステージフォーメーションの作成・編集

### 管理用フロントエンド (frontend-admin)
管理者向けのCRUD機能を提供します。

| 画面 | 機能 |
|------|------|
| ホーム | ダッシュボード |
| メンバー一覧 | メンバーの追加・編集・削除、画像管理 |
| グループ一覧 | グループの追加・編集・削除 |
| フォーメーション一覧 | フォーメーションの作成・編集・削除 |

### 公開用フロントエンド (frontend-public)
顧客向けの閲覧専用ページです。モダンなデザインとアニメーションを採用しています。

| 画面 | 説明 |
|------|------|
| ホーム | ヒーローセクション、統計情報表示 |
| メンバー一覧 | メンバーカードのグリッド表示 |
| メンバー詳細 | プロフィール、画像ギャラリー |
| グループ一覧 | グループカードのグリッド表示 |
| グループ詳細 | グループ情報、所属メンバー一覧 |
| フォーメーション | ステージ形式でのフォーメーション表示 |

#### フォーメーション表示について
- `row=1` がステージ前方（画面下部）
- `row` の数字が大きいほどステージ後方（画面上部）
- 各列は中央揃えで表示

## 技術スタック

### バックエンド
- .NET 10 Preview
- ASP.NET Core Web API
- Entity Framework Core
- SQLite
- DDD (ドメイン駆動設計) アーキテクチャ

### フロントエンド
- React 18
- TypeScript
- Vite
- TanStack Query (React Query)
- React Router

#### 管理用 (frontend-admin)
- 標準的なCSS

#### 公開用 (frontend-public)
- Tailwind CSS v4
- Framer Motion (アニメーション)

## プロジェクト構成

```
dotnet10App/
├── src/
│   ├── Domain/           # ドメイン層（エンティティ、リポジトリインターフェース）
│   ├── Application/      # アプリケーション層（ユースケース、DTO）
│   ├── Infrastructure/   # インフラ層（EF Core、リポジトリ実装）
│   └── Presentation/     # プレゼンテーション層（API コントローラ）
├── tests/
│   └── Application.Tests/ # ユニットテスト
├── frontend-admin/       # 管理用フロントエンド
└── frontend-public/      # 公開用フロントエンド
```

## 起動方法

### 前提条件
- .NET 10 SDK Preview
- Node.js 18+

### バックエンド

```bash
cd src/Presentation
~/.dotnet/dotnet run
```

API: http://localhost:5059
Swagger UI: http://localhost:5059/swagger

### 管理用フロントエンド

```bash
cd frontend-admin
npm install
npm run dev
```

http://localhost:5173

### 公開用フロントエンド

```bash
cd frontend-public
npm install
npm run dev
```

http://localhost:5174

## テスト実行

```bash
cd tests/Application.Tests
~/.dotnet/dotnet test
```

## Docker

### Docker Compose (推奨)

全サービスを一括起動:

```bash
docker-compose up -d
```

| サービス | URL |
|----------|-----|
| API | http://localhost:5000 |
| 管理用フロントエンド | http://localhost:3000 |
| 公開用フロントエンド | http://localhost:3001 |

停止:

```bash
docker-compose down
```

### 個別ビルド

```bash
# バックエンドAPI
docker build -t idol-api .
docker run -p 5000:80 idol-api

# 管理用フロントエンド
docker build -t idol-admin ./frontend-admin
docker run -p 3000:80 idol-admin

# 公開用フロントエンド
docker build -t idol-public ./frontend-public
docker run -p 3001:80 idol-public
```

### データ永続化

docker-compose使用時、SQLiteデータベースは`api-data`ボリュームに保存されます。

```bash
# ボリューム確認
docker volume ls

# データバックアップ
docker cp $(docker-compose ps -q api):/app/data/idolmanagement.db ./backup.db
```

## 環境変数

`.env.example`をコピーして設定:

```bash
cp .env.example .env
```

詳細は各ディレクトリの`.env.example`を参照してください。

## CI/CD

GitHub Actionsでプッシュ/PR時に自動テスト:

- バックエンド: ビルド + テスト
- フロントエンド: Lint + ビルド

## API エンドポイント

### Members
- `GET /api/members` - メンバー一覧
- `GET /api/members/{id}` - メンバー詳細
- `POST /api/members` - メンバー作成
- `PUT /api/members/{id}` - メンバー更新
- `DELETE /api/members/{id}` - メンバー削除
- `POST /api/members/{id}/images` - 画像追加
- `DELETE /api/members/{memberId}/images/{imageId}` - 画像削除
- `PUT /api/members/{memberId}/images/{imageId}/primary` - プライマリ画像設定

### Groups
- `GET /api/groups` - グループ一覧
- `GET /api/groups/{id}` - グループ詳細
- `POST /api/groups` - グループ作成
- `PUT /api/groups/{id}` - グループ更新
- `DELETE /api/groups/{id}` - グループ削除

### Formations
- `GET /api/formations` - フォーメーション一覧
- `GET /api/formations/{id}` - フォーメーション詳細
- `POST /api/formations` - フォーメーション作成
- `PUT /api/formations/{id}` - フォーメーション更新
- `DELETE /api/formations/{id}` - フォーメーション削除
