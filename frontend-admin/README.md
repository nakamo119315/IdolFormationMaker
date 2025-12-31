# IDOL STAGE - 管理画面 (frontend-admin)

アイドル管理システムの管理者向けダッシュボードです。メンバー、グループ、楽曲、フォーメーションなどのCRUD操作を行えます。

## 技術スタック

- **React 18** - UIフレームワーク
- **TypeScript** - 型安全な開発
- **Vite** - 高速なビルドツール
- **TanStack Query** - データフェッチング・キャッシュ管理
- **React Router v6** - ルーティング
- **CSS** - スタイリング（カスタムCSS）

## 画面一覧

| 画面 | パス | 機能 |
|------|------|------|
| ダッシュボード | `/` | 統計情報表示（メンバー数、グループ別メンバー数など） |
| メンバー管理 | `/members` | 一覧・検索・フィルタ・追加・編集・削除・画像管理 |
| グループ管理 | `/groups` | 一覧・追加・編集・削除 |
| フォーメーション管理 | `/formations` | 一覧・追加・編集・削除・ポジション配置 |
| 楽曲管理 | `/songs` | 一覧・検索・追加・編集・削除 |
| データ管理 | `/data` | JSON形式でのエクスポート/インポート |

## ディレクトリ構成

```
src/
├── api/                    # API通信層
│   ├── client.ts           # HTTP クライアント（fetch wrapper）
│   ├── members.ts          # Members API
│   ├── groups.ts           # Groups API
│   ├── formations.ts       # Formations API
│   └── songs.ts            # Songs API
│
├── components/             # UIコンポーネント
│   ├── common/             # 共通コンポーネント
│   │   ├── Layout.tsx      # ナビゲーション付きレイアウト
│   │   ├── Modal.tsx       # モーダルダイアログ
│   │   ├── Loading.tsx     # ローディングスピナー
│   │   ├── Toast.tsx       # トースト通知
│   │   ├── ConfirmDialog.tsx # 削除確認ダイアログ
│   │   ├── Pagination.tsx  # ページネーション
│   │   └── SearchForm.tsx  # 検索フォーム
│   └── formations/         # フォーメーション専用コンポーネント
│
├── pages/                  # ページコンポーネント
│   ├── HomePage.tsx        # ダッシュボード
│   ├── MembersPage.tsx     # メンバー管理（ページング・検索・フィルタ対応）
│   ├── GroupsPage.tsx      # グループ管理
│   ├── FormationsPage.tsx  # フォーメーション管理
│   ├── SongsPage.tsx       # 楽曲管理
│   └── DataPage.tsx        # データ管理
│
├── types/                  # 型定義
│   └── index.ts            # API DTOに対応するTypeScript型
│
├── validation/             # バリデーション
│   └── schemas.ts          # 入力バリデーションスキーマ
│
├── App.tsx                 # ルーティング設定
├── main.tsx                # エントリーポイント
└── index.css               # グローバルスタイル
```

## セットアップ

### 前提条件

- Node.js 18+
- npm または yarn

### インストール

```bash
cd frontend-admin
npm install
```

### 開発サーバー起動

```bash
npm run dev
```

http://localhost:5173 でアクセスできます。

### ビルド

```bash
npm run build
```

`dist/` ディレクトリに静的ファイルが生成されます。

### リント

```bash
npm run lint
```

## 環境変数

開発時は Vite のプロキシ設定により `/api` へのリクエストが自動的に `http://localhost:5059` に転送されます。

### 本番環境

`.env.production` を作成して API URL を設定：

```bash
VITE_API_URL=https://your-api-domain.com/api
```

## 機能詳細

### ページング

メンバー一覧はページング対応しており、大量データでも高速に表示できます。

### 検索・フィルタリング

- **名前検索**: 部分一致で検索
- **グループフィルタ**: 所属グループで絞り込み
- **期フィルタ**: 期生で絞り込み
- **卒業フィルタ**: 現役/卒業で絞り込み

### CSVエクスポート

メンバー一覧・楽曲一覧をCSV形式でダウンロードできます（Excel互換UTF-8 BOM付き）。

### 画像管理

メンバーには複数画像を登録でき、プライマリ画像を設定できます。

## バックエンドとの接続

バックエンドAPI（.NET）を事前に起動しておく必要があります：

```bash
cd ../src/Presentation
~/.dotnet/dotnet run
```

API: http://localhost:5059

## デプロイ

Cloudflare Pages へのデプロイ：

```bash
npm run deploy
```

詳細は [DEPLOY.md](../DEPLOY.md) を参照してください。
