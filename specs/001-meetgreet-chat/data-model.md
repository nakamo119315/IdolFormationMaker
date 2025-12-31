# Data Model: ミーグリ会話記録

**Feature**: 001-meetgreet-chat
**Date**: 2025-12-30

## Entity Relationship Diagram

```
┌─────────────────────────────┐       ┌──────────────────────┐
│   MeetGreetConversation     │       │   ConversationMessage│
├─────────────────────────────┤       ├──────────────────────┤
│ Id: Guid (PK)               │       │ Id: Guid (PK)        │
│ Title: string               │       │ ConversationId: Guid │
│ MemberId: Guid? (FK)        │1────*>│ SpeakerType: enum    │
│ MemberName: string?         │       │ Content: string      │
│ ConversationDate: DateTime  │       │ Order: int           │
│ CreatedAt: DateTime         │       │ CreatedAt: DateTime  │
│ UpdatedAt: DateTime         │       └──────────────────────┘
└─────────────────────────────┘
            │
            │ 0..1
            ▼
┌─────────────────────────────┐
│   Member (既存)              │
├─────────────────────────────┤
│ Id: Guid (PK)               │
│ Name: string                │
│ ...                         │
└─────────────────────────────┘
```

## Entities

### MeetGreetConversation（ミーグリ会話）

**Purpose**: 1回のミーグリでの会話全体を表す集約ルート

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| Id | Guid | Yes | 会話ID（自動生成） |
| Title | string | Yes | 会話タイトル（デフォルト: メンバー名 + 日付） |
| MemberId | Guid? | No | 対象メンバーID（既存Memberへの参照） |
| MemberName | string? | No | メンバー名（Member削除時のフォールバック用） |
| ConversationDate | DateTime | Yes | ミーグリ日時 |
| Messages | List<ConversationMessage> | No | メッセージ一覧（子エンティティ） |
| CreatedAt | DateTime | Yes | 作成日時 |
| UpdatedAt | DateTime | Yes | 更新日時 |

**Validation Rules**:
- Title: 1〜100文字
- Messages: 保存時に最低1件必要

**Business Rules**:
- MemberIdがnullの場合、「不明なメンバー」として扱う
- MemberNameはMember選択時にコピー（削除されても表示可能）

### ConversationMessage（会話メッセージ）

**Purpose**: 1つのセリフを表す

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| Id | Guid | Yes | メッセージID（自動生成） |
| ConversationId | Guid | Yes | 親会話ID（外部キー） |
| SpeakerType | SpeakerType | Yes | 話者種別（Self=自分, Partner=相手） |
| Content | string | Yes | セリフ内容 |
| Order | int | Yes | 表示順序（1始まり） |
| CreatedAt | DateTime | Yes | 作成日時 |

**Validation Rules**:
- Content: 1〜1000文字
- Order: 1以上の整数

### SpeakerType（話者種別）

```csharp
public enum SpeakerType
{
    Self = 0,     // 自分
    Partner = 1   // 相手（アイドル）
}
```

## C# Entity Definitions

### MeetGreetConversation.cs

```csharp
using IdolManagement.Domain.Shared.Interfaces;

namespace IdolManagement.Domain.Conversations.Entities;

public class MeetGreetConversation : IEntity
{
    public Guid Id { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public Guid? MemberId { get; private set; }
    public string? MemberName { get; private set; }
    public DateTime ConversationDate { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    private readonly List<ConversationMessage> _messages = new();
    public IReadOnlyCollection<ConversationMessage> Messages => _messages.AsReadOnly();

    private MeetGreetConversation() { }

    public static MeetGreetConversation Create(
        string title,
        Guid? memberId,
        string? memberName,
        DateTime? conversationDate = null)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Title is required.", nameof(title));
        if (title.Length > 100)
            throw new ArgumentException("Title must be 100 characters or less.", nameof(title));

        var now = DateTime.UtcNow;
        return new MeetGreetConversation
        {
            Id = Guid.NewGuid(),
            Title = title,
            MemberId = memberId,
            MemberName = memberName,
            ConversationDate = conversationDate ?? now,
            CreatedAt = now,
            UpdatedAt = now
        };
    }

    public void Update(string title)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Title is required.", nameof(title));
        if (title.Length > 100)
            throw new ArgumentException("Title must be 100 characters or less.", nameof(title));

        Title = title;
        UpdatedAt = DateTime.UtcNow;
    }

    public ConversationMessage AddMessage(SpeakerType speakerType, string content)
    {
        if (string.IsNullOrWhiteSpace(content))
            throw new ArgumentException("Content is required.", nameof(content));
        if (content.Length > 1000)
            throw new ArgumentException("Content must be 1000 characters or less.", nameof(content));

        var order = _messages.Count > 0 ? _messages.Max(m => m.Order) + 1 : 1;
        var message = ConversationMessage.Create(Id, speakerType, content, order);
        _messages.Add(message);
        UpdatedAt = DateTime.UtcNow;
        return message;
    }

    public void SetMessages(IEnumerable<ConversationMessage> messages)
    {
        _messages.Clear();
        _messages.AddRange(messages);
    }
}
```

### ConversationMessage.cs

```csharp
namespace IdolManagement.Domain.Conversations.Entities;

public class ConversationMessage
{
    public Guid Id { get; private set; }
    public Guid ConversationId { get; private set; }
    public SpeakerType SpeakerType { get; private set; }
    public string Content { get; private set; } = string.Empty;
    public int Order { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private ConversationMessage() { }

    public static ConversationMessage Create(
        Guid conversationId,
        SpeakerType speakerType,
        string content,
        int order)
    {
        if (conversationId == Guid.Empty)
            throw new ArgumentException("ConversationId is required.", nameof(conversationId));
        if (string.IsNullOrWhiteSpace(content))
            throw new ArgumentException("Content is required.", nameof(content));
        if (content.Length > 1000)
            throw new ArgumentException("Content must be 1000 characters or less.", nameof(content));
        if (order < 1)
            throw new ArgumentException("Order must be at least 1.", nameof(order));

        return new ConversationMessage
        {
            Id = Guid.NewGuid(),
            ConversationId = conversationId,
            SpeakerType = speakerType,
            Content = content,
            Order = order,
            CreatedAt = DateTime.UtcNow
        };
    }
}

public enum SpeakerType
{
    Self = 0,
    Partner = 1
}
```

## TypeScript Type Definitions

```typescript
// frontend-public/src/types/index.ts に追加

export interface MeetGreetConversation {
  id: string;
  title: string;
  memberId: string | null;
  memberName: string | null;
  conversationDate: string;
  messages: ConversationMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ConversationSummary {
  id: string;
  title: string;
  memberId: string | null;
  memberName: string | null;
  conversationDate: string;
  messageCount: number;
  previewText: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationMessage {
  id: string;
  speakerType: SpeakerType;
  content: string;
  order: number;
  createdAt: string;
}

export type SpeakerType = 'Self' | 'Partner';

export interface CreateConversationDto {
  title: string;
  memberId?: string | null;
  conversationDate?: string;
  messages: CreateMessageDto[];
}

export interface CreateMessageDto {
  speakerType: SpeakerType;
  content: string;
  order: number;
}

export interface UpdateConversationDto {
  title: string;
  messages: CreateMessageDto[];
}

export interface AddMessageDto {
  speakerType: SpeakerType;
  content: string;
}
```

## Database Schema

```sql
-- SQLite

CREATE TABLE MeetGreetConversations (
    Id TEXT PRIMARY KEY,
    Title TEXT NOT NULL,
    MemberId TEXT NULL,
    MemberName TEXT NULL,
    ConversationDate TEXT NOT NULL,
    CreatedAt TEXT NOT NULL,
    UpdatedAt TEXT NOT NULL,
    FOREIGN KEY (MemberId) REFERENCES Members(Id) ON DELETE SET NULL
);

CREATE TABLE ConversationMessages (
    Id TEXT PRIMARY KEY,
    ConversationId TEXT NOT NULL,
    SpeakerType INTEGER NOT NULL,
    Content TEXT NOT NULL,
    "Order" INTEGER NOT NULL,
    CreatedAt TEXT NOT NULL,
    FOREIGN KEY (ConversationId) REFERENCES MeetGreetConversations(Id) ON DELETE CASCADE
);

CREATE INDEX IX_MeetGreetConversations_MemberId ON MeetGreetConversations(MemberId);
CREATE INDEX IX_MeetGreetConversations_ConversationDate ON MeetGreetConversations(ConversationDate DESC);
CREATE INDEX IX_ConversationMessages_ConversationId ON ConversationMessages(ConversationId);
```
