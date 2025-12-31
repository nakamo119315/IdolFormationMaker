# Research: ミーグリ会話記録

**Feature**: 001-meetgreet-chat
**Date**: 2025-12-30

## Research Topics

### 1. 画像エクスポートライブラリの選定

**Decision**: html2canvas

**Rationale**:
- DOM要素をCanvas経由でPNG画像に変換できる
- クライアントサイドで完結（サーバーサイド不要）
- React環境での実績が豊富
- npm週間ダウンロード数が多く、メンテナンスが活発

**Alternatives Considered**:
| ライブラリ | 長所 | 短所 | 却下理由 |
|-----------|------|------|---------|
| html2canvas | 軽量、クライアント完結 | 一部CSSの再現性に制限 | - |
| dom-to-image | html2canvasより高精度 | メンテナンス停滞 | 長期サポートの懸念 |
| Puppeteer/サーバー生成 | 完全なCSS対応 | サーバーリソース必要 | YAGNIに反する |

### 2. チャットUIのパターン

**Decision**: LINEスタイルのバブルUI

**Rationale**:
- 日本のユーザーに馴染みのあるUI
- 自分のメッセージは右寄せ（緑/青系）、相手は左寄せ（白/グレー系）
- シンプルで実装が容易

**Implementation Notes**:
- `flex-direction: column` でメッセージを縦に並べる
- 自分: `align-self: flex-end` + 右寄せ背景色
- 相手: `align-self: flex-start` + 左寄せ背景色 + アイコン表示

### 3. 話者切り替えのUX

**Decision**: トグルボタン方式

**Rationale**:
- ワンタップで切り替え可能（SC-002準拠）
- 現在の話者が視覚的に明確
- 片手操作に最適

**Implementation Notes**:
- 入力欄の左側に「自分/相手」トグル配置
- 現在選択中の話者をハイライト
- 送信後は直前の話者を維持（連続入力しやすく）

### 4. 既存エンティティとの関連

**Decision**: MemberへのOptional参照

**Rationale**:
- 会話の相手（アイドル）は既存のMemberエンティティを参照可能
- ただし必須ではない（メンバー未登録でも会話記録可能）
- 会話は独立した集約として設計（Memberに依存しない）

**Implementation Notes**:
```csharp
public class MeetGreetConversation : IEntity
{
    public Guid? MemberId { get; private set; }  // Optional reference
    public string? MemberName { get; private set; }  // Fallback for deleted members
}
```

### 5. EF Core マイグレーション

**Decision**: 既存AppDbContextにテーブル追加

**Rationale**:
- 既存のマイグレーション履歴を継続
- 同一DbContextで管理（トランザクション整合性）

**Implementation Notes**:
```csharp
// AppDbContext.cs に追加
public DbSet<MeetGreetConversation> MeetGreetConversations => Set<MeetGreetConversation>();
public DbSet<ConversationMessage> ConversationMessages => Set<ConversationMessage>();
```

## Resolved Clarifications

| Topic | Question | Resolution |
|-------|----------|------------|
| ユーザー認証 | 必要か？ | 不要（既存システムに合わせる） |
| データ共有 | 他ユーザーの会話は見える？ | 全ユーザー共有（認証なしのため） |
| メンバー削除時 | 会話はどうなる？ | 会話は保持、MemberNameで表示 |
| 最大メッセージ数 | 制限は？ | 制限なし（パフォーマンス監視） |

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| html2canvas | ^1.4.1 | 画像エクスポート |
| (既存) | - | TanStack Query, React Router等は既存利用 |
