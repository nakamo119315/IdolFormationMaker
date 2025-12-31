# Quickstart: ミーグリ会話記録

**Feature**: 001-meetgreet-chat
**Date**: 2025-12-30

## 前提条件

- .NET 10 SDK インストール済み
- Node.js 18+ インストール済み
- 既存のアイドル管理アプリがビルド可能な状態

## セットアップ手順

### 1. バックエンド（.NET API）

```bash
# プロジェクトルートで実行

# マイグレーション作成
$HOME/.dotnet/dotnet ef migrations add AddConversations -p src/Infrastructure -s src/Presentation

# マイグレーション適用
$HOME/.dotnet/dotnet ef database update -p src/Infrastructure -s src/Presentation

# ビルド確認
$HOME/.dotnet/dotnet build

# API起動
$HOME/.dotnet/dotnet run --project src/Presentation
```

### 2. フロントエンド（React）

```bash
# frontend-public ディレクトリで実行
cd frontend-public

# html2canvas インストール
npm install html2canvas

# 型定義も追加
npm install --save-dev @types/html2canvas

# 開発サーバー起動
npm run dev
```

### 3. 動作確認

1. ブラウザで http://localhost:5174 を開く
2. ナビゲーションから「会話記録」をクリック
3. 「新規作成」ボタンをクリック
4. メンバーを選択（任意）
5. 話者を選んでメッセージを入力
6. 「保存」をクリック
7. 一覧に戻って保存されたことを確認
8. 会話を開いて「画像ダウンロード」をクリック

## API エンドポイント確認

```bash
# 会話一覧取得
curl http://localhost:5059/api/conversations

# 会話作成
curl -X POST http://localhost:5059/api/conversations \
  -H "Content-Type: application/json" \
  -d '{
    "title": "テスト会話",
    "memberId": null,
    "messages": [
      {"speakerType": "Self", "content": "こんにちは！", "order": 1},
      {"speakerType": "Partner", "content": "こんにちは〜", "order": 2}
    ]
  }'

# 会話詳細取得（IDは作成時のレスポンスから取得）
curl http://localhost:5059/api/conversations/{id}

# メッセージ追加
curl -X POST http://localhost:5059/api/conversations/{id}/messages \
  -H "Content-Type: application/json" \
  -d '{"speakerType": "Self", "content": "また会えて嬉しいです！"}'

# 会話削除
curl -X DELETE http://localhost:5059/api/conversations/{id}
```

## 画面フロー

```
┌────────────────────┐
│   会話一覧画面     │
│  /conversations    │
├────────────────────┤
│ [新規作成ボタン]   │──────┐
│                    │      │
│ ┌────────────────┐ │      ▼
│ │ 会話カード1    │─┼─► ┌────────────────────┐
│ │ メンバー名     │ │   │   会話詳細画面     │
│ │ 2024-12-30     │ │   │  /conversations/:id│
│ │ プレビュー...  │ │   ├────────────────────┤
│ └────────────────┘ │   │ [編集] [削除]      │
│                    │   │ [画像ダウンロード] │
│ ┌────────────────┐ │   │                    │
│ │ 会話カード2    │ │   │ ┌────────────────┐ │
│ └────────────────┘ │   │ │ チャット表示   │ │
└────────────────────┘   │ │ 自分: こんにちは│ │
                         │ │ 相手: やっほー  │ │
                         │ └────────────────┘ │
                         │                    │
                         │ ┌────────────────┐ │
                         │ │ 入力エリア     │ │
                         │ │[自分|相手][入力]│ │
                         │ │        [送信]  │ │
                         │ └────────────────┘ │
                         └────────────────────┘
```

## トラブルシューティング

### マイグレーションエラー

```bash
# データベースファイルを削除して再作成
rm -f IdolManagement.db
$HOME/.dotnet/dotnet ef database update -p src/Infrastructure -s src/Presentation
```

### CORS エラー

既存のProgram.csにCORS設定があることを確認:

```csharp
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5174")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
```

### html2canvas で画像が真っ白

- Canvas要素のサイズが大きすぎる可能性
- `scale` オプションを調整:

```typescript
const canvas = await html2canvas(element, {
  scale: 1,  // 2から1に下げる
  useCORS: true,
});
```
