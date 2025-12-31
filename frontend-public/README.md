# IDOL STAGE - 公開サイト (frontend-public)

アイドル管理システムの顧客向け公開サイトです。モダンなデザインとリッチなアニメーションを採用した閲覧専用ページを提供します。

## 技術スタック

- **React 18** - UIフレームワーク
- **TypeScript** - 型安全な開発
- **Vite** - 高速なビルドツール
- **TanStack Query** - データフェッチング・キャッシュ管理
- **React Router v6** - ルーティング
- **Tailwind CSS v4** - ユーティリティファーストCSS
- **Framer Motion** - アニメーションライブラリ

## 画面一覧

| 画面 | パス | 機能 |
|------|------|------|
| トップページ | `/` | ヒーローセクション、統計情報表示 |
| メンバー一覧 | `/members` | カード形式で画像付き一覧表示、グループ・期別フィルタ |
| メンバー詳細 | `/members/:id` | プロフィール、画像ギャラリー、期生・卒業バッジ |
| メンバーソート | `/members/sort` | マージソートによる比較ベースのランキング作成 |
| グループ一覧 | `/groups` | グループカードのグリッド表示 |
| グループ詳細 | `/groups/:id` | グループ情報、所属メンバー一覧 |
| フォーメーション一覧 | `/formations` | フォーメーションカードのグリッド表示 |
| フォーメーション詳細 | `/formations/:id` | ステージ形式でのフォーメーション表示 |
| フォーメーション作成 | `/formations/create` | ドラッグ&ドロップでフォーメーション配置 |
| 楽曲一覧 | `/songs` | 楽曲カードのグリッド表示 |
| 楽曲詳細 | `/songs/:id` | 歌詞・クレジット表示 |
| セトリ一覧 | `/setlists` | セットリストのグリッド表示 |
| セトリ詳細 | `/setlists/:id` | セットリストの曲順表示、画像保存機能 |
| セトリ作成 | `/setlists/create` | ドラッグ&ドロップでセットリスト作成 |

## ディレクトリ構成

```
src/
├── api/                    # API通信層
│   ├── client.ts           # HTTP クライアント
│   ├── members.ts          # Members API
│   ├── groups.ts           # Groups API
│   ├── formations.ts       # Formations API
│   ├── songs.ts            # Songs API
│   └── setlists.ts         # Setlists API
│
├── components/             # UIコンポーネント
│   ├── common/             # 共通コンポーネント
│   │   ├── Header.tsx      # ヘッダー
│   │   ├── Footer.tsx      # フッター
│   │   ├── LazyImage.tsx   # 画像遅延読み込み
│   │   └── Loading.tsx     # ローディング
│   ├── members/            # メンバー関連コンポーネント
│   ├── groups/             # グループ関連コンポーネント
│   ├── formations/         # フォーメーション関連コンポーネント
│   └── conversations/      # 会話機能コンポーネント
│
├── pages/                  # ページコンポーネント
│   ├── HomePage.tsx        # トップページ
│   ├── MembersPage.tsx     # メンバー一覧
│   ├── MemberDetailPage.tsx # メンバー詳細
│   ├── MemberSortPage.tsx  # メンバーソート
│   ├── GroupsPage.tsx      # グループ一覧
│   ├── GroupDetailPage.tsx # グループ詳細
│   ├── FormationsPage.tsx  # フォーメーション一覧
│   ├── FormationCreatePage.tsx # フォーメーション作成
│   ├── SongsPage.tsx       # 楽曲一覧
│   ├── SongDetailPage.tsx  # 楽曲詳細
│   ├── SetlistsPage.tsx    # セトリ一覧
│   ├── SetlistDetailPage.tsx # セトリ詳細
│   └── SetlistCreatePage.tsx # セトリ作成
│
├── hooks/                  # カスタムフック
│   └── index.ts
│
├── utils/                  # ユーティリティ関数
│   └── index.ts
│
├── types/                  # 型定義
│   └── index.ts
│
├── App.tsx                 # ルーティング設定
├── main.tsx                # エントリーポイント
└── index.css               # Tailwind CSS設定
```

## セットアップ

### 前提条件

- Node.js 18+
- npm または yarn

### インストール

```bash
cd frontend-public
npm install
```

### 開発サーバー起動

```bash
npm run dev
```

http://localhost:5174 でアクセスできます。

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

## 主要機能

### フォーメーション表示

ステージ形式でフォーメーションを表示します：

```
    ステージ後方（客席から遠い）
    ┌─────────────────────────┐
    │    [3列目: n人]         │  ← row=3（上段）
    │   [2列目: m人]          │  ← row=2（中段）
    │  [1列目: k人]           │  ← row=1（下段・最前列）
    └─────────────────────────┘
    ステージ前方（客席に近い）
              ↓
            客席
```

- `row=1` がステージ前方（画面下部に表示）
- `row` の数字が大きいほど後方（画面上部）
- 各列は人数に応じて中央揃え
- メンバー画像を円形で表示、ポジション番号をバッジ表示

### メンバーソート機能

マージソートアルゴリズムを使用した比較ベースのランキング作成機能：
- 2人のメンバーを比較して好みを選択
- 最小限の比較回数で順位付け
- 結果をSNSでシェア可能

### セトリ画像保存

html2canvas を使用してセットリストをPNG画像として保存できます。iOS Safari では Web Share API を使用。

### 画像遅延読み込み

Intersection Observer を使用して、ビューポートに入った画像のみを読み込みます。

## デザイン

### カラーパレット

Tailwind CSS v4 のデフォルトカラーをベースに、アクセントカラーを設定しています。

### アニメーション

Framer Motion を使用して以下のアニメーションを実装：
- ページ遷移
- カードのホバーエフェクト
- スクロールアニメーション
- ローディングアニメーション

### レスポンシブデザイン

モバイルファースト設計で、すべてのデバイスに対応しています。

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
