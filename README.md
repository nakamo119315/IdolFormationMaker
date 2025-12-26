# IDOL STAGE - アイドル管理システム

.NET 10 + React で構築されたアイドルグループ管理アプリケーションです。

## 機能概要

### バックエンド API
- **メンバー管理**: アイドルメンバーのCRUD操作、画像管理
- **グループ管理**: グループのCRUD操作
- **フォーメーション管理**: ステージフォーメーションの作成・編集
- **楽曲管理**: 楽曲情報のCRUD操作
- **セットリスト管理**: ライブセットリストの作成・編集
- **データ管理**: 全データのエクスポート/インポート

### 管理用フロントエンド (frontend-admin)
管理者向けのCRUD機能を提供します。

| 画面 | 機能 |
|------|------|
| ホーム | ダッシュボード |
| メンバー一覧 | メンバーの追加・編集・削除、画像管理 |
| グループ一覧 | グループの追加・編集・削除 |
| フォーメーション一覧 | フォーメーションの作成・編集・削除 |
| 楽曲一覧 | 楽曲の追加・編集・削除 |
| データ管理 | データのエクスポート/インポート |

### 公開用フロントエンド (frontend-public)
顧客向けの閲覧専用ページです。モダンなデザインとアニメーションを採用しています。

| 画面 | 説明 |
|------|------|
| ホーム | ヒーローセクション、統計情報表示 |
| メンバー一覧 | メンバーカードのグリッド表示、グループ・期別フィルタリング |
| メンバー詳細 | プロフィール、画像ギャラリー、期生・卒業バッジ表示 |
| メンバーソート | マージソートによる比較ベースのメンバーランキング作成 |
| グループ一覧 | グループカードのグリッド表示 |
| グループ詳細 | グループ情報、所属メンバー一覧 |
| フォーメーション一覧 | フォーメーションカードのグリッド表示 |
| フォーメーション詳細 | ステージ形式でのフォーメーション表示 |
| フォーメーション作成 | ドラッグ&ドロップでフォーメーション配置 |
| 楽曲一覧 | 楽曲カードのグリッド表示 |
| 楽曲詳細 | 歌詞・クレジット表示 |
| セトリ一覧 | セットリストのグリッド表示 |
| セトリ詳細 | セットリストの曲順表示 |
| セトリ作成 | ドラッグ&ドロップでセットリスト作成 |

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
│   │   ├── Members/      # メンバードメイン
│   │   ├── Groups/       # グループドメイン
│   │   ├── Formations/   # フォーメーションドメイン
│   │   ├── Songs/        # 楽曲ドメイン
│   │   └── Setlists/     # セットリストドメイン
│   ├── Application/      # アプリケーション層（ユースケース、DTO）
│   ├── Infrastructure/   # インフラ層（EF Core、リポジトリ実装）
│   └── Presentation/     # プレゼンテーション層（API コントローラ）
├── tests/
│   ├── Domain.Tests/     # ドメイン層ユニットテスト
│   └── Application.Tests/ # アプリケーション層ユニットテスト
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
# 全テスト実行
~/.dotnet/dotnet test

# ドメインテストのみ
~/.dotnet/dotnet test tests/Domain.Tests

# アプリケーションテストのみ
~/.dotnet/dotnet test tests/Application.Tests
```

### テストカバレッジ

| レイヤー | テスト数 | 対象 |
|----------|---------|------|
| Domain | 80 | エンティティ、値オブジェクト |
| Application | 9 | ハンドラー |

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

### Songs
- `GET /api/songs` - 楽曲一覧
- `GET /api/songs/{id}` - 楽曲詳細
- `GET /api/songs/group/{groupId}` - グループ別楽曲一覧
- `POST /api/songs` - 楽曲作成
- `PUT /api/songs/{id}` - 楽曲更新
- `DELETE /api/songs/{id}` - 楽曲削除

### Setlists
- `GET /api/setlists` - セットリスト一覧
- `GET /api/setlists/{id}` - セットリスト詳細
- `GET /api/setlists/group/{groupId}` - グループ別セットリスト一覧
- `POST /api/setlists` - セットリスト作成
- `PUT /api/setlists/{id}` - セットリスト更新
- `DELETE /api/setlists/{id}` - セットリスト削除

### Data (エクスポート/インポート)
- `GET /api/data/export` - 全データをJSON形式でエクスポート
- `POST /api/data/import?clearExisting=false` - JSONデータをインポート

## Cloudflare Pages デプロイ

フロントエンドはCloudflare Pagesにデプロイ可能です。バックエンドはCloudflare Tunnelで公開します。

詳細は [DEPLOY.md](DEPLOY.md) を参照してください。

```bash
# Cloudflare Tunnelでバックエンドを公開
cloudflared tunnel --url http://localhost:5059

# フロントエンドをデプロイ
cd frontend-admin && npm run deploy
cd frontend-public && npm run deploy
```
