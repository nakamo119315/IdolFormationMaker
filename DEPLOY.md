# Cloudflare Pages + Tunnel デプロイガイド

## 概要

- **フロントエンド**: Cloudflare Pages (静的サイトホスティング)
- **バックエンド**: ローカルサーバー + Cloudflare Tunnel

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Cloudflare     │     │  Cloudflare      │     │  ローカル       │
│  Pages          │────▶│  Tunnel          │────▶│  バックエンド   │
│  (フロントエンド)│     │                  │     │  (.NET API)     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## 1. Cloudflare Tunnel のセットアップ

### cloudflared のインストール

```bash
# macOS
brew install cloudflared

# または直接ダウンロード
# https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
```

### Tunnel の作成と認証

```bash
# Cloudflareにログイン
cloudflared tunnel login

# Tunnelを作成
cloudflared tunnel create idol-api

# 設定ファイルを作成
cat > ~/.cloudflared/config.yml << 'CONFIG'
tunnel: idol-api
credentials-file: /Users/YOUR_USER/.cloudflared/TUNNEL_ID.json

ingress:
  - hostname: idol-api.YOUR_DOMAIN.com
    service: http://localhost:5059
  - service: http_status:404
CONFIG

# DNSレコードを追加
cloudflared tunnel route dns idol-api idol-api.YOUR_DOMAIN.com

# Tunnelを起動
cloudflared tunnel run idol-api
```

### クイックトンネル（テスト用）

```bash
# 一時的なトンネルURL（開発テスト用）
cloudflared tunnel --url http://localhost:5059
```

## 2. バックエンドの起動

```bash
cd /path/to/dotnet10App

# バックエンドを起動
dotnet run --project src/Presentation

# 別ターミナルでTunnelを起動
cloudflared tunnel run idol-api
# または
cloudflared tunnel --url http://localhost:5059
```

## 3. フロントエンドのデプロイ

### 初回セットアップ

```bash
# wrangler をインストール
npm install -g wrangler

# Cloudflareにログイン
wrangler login
```

### 管理画面 (frontend-admin)

```bash
cd frontend-admin

# 環境変数を設定（.env.production）
echo "VITE_API_URL=https://idol-api.YOUR_DOMAIN.com/api" > .env.production

# ビルド＆デプロイ
npm run deploy
```

### 公開サイト (frontend-public)

```bash
cd frontend-public

# 環境変数を設定（.env.production）
echo "VITE_API_URL=https://idol-api.YOUR_DOMAIN.com/api" > .env.production

# ビルド＆デプロイ
npm run deploy
```

## 4. Cloudflare Dashboard での環境変数設定

Cloudflare Dashboardでも環境変数を設定できます：

1. Cloudflare Dashboard → Pages → プロジェクト選択
2. Settings → Environment variables
3. 以下を追加:
   - `VITE_API_URL` = `https://idol-api.YOUR_DOMAIN.com/api`

## 5. CORS 設定

バックエンドでCORSを許可する必要があります。`Program.cs` に以下を追加:

```csharp
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(
            "https://idol-admin.pages.dev",
            "https://idol-public.pages.dev",
            "https://your-custom-domain.com"
        )
        .AllowAnyHeader()
        .AllowAnyMethod();
    });
});

// app.UseRouting() の後に
app.UseCors();
```

## ローカル開発

ローカル開発時はViteのプロキシを使用するため、環境変数は不要です。

```bash
# バックエンド起動
dotnet run --project src/Presentation

# 管理画面（別ターミナル）
cd frontend-admin && npm run dev

# 公開サイト（別ターミナル）
cd frontend-public && npm run dev
```

## トラブルシューティング

### API接続エラー
- Cloudflare Tunnelが起動しているか確認
- CORS設定が正しいか確認
- 環境変数 `VITE_API_URL` が正しく設定されているか確認

### ビルドエラー
- `npm install` を再実行
- `node_modules` を削除して再インストール

### Tunnel接続エラー
- `cloudflared tunnel list` でTunnelの状態を確認
- `cloudflared tunnel info idol-api` で詳細を確認
