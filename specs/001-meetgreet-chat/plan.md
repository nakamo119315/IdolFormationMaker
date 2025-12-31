# Implementation Plan: ミーグリ会話記録

**Branch**: `001-meetgreet-chat` | **Date**: 2025-12-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-meetgreet-chat/spec.md`

## Summary

既存のアイドル管理システムに、ミーグリ（ミート&グリート）での会話を記録・保存・画像エクスポートできる機能を追加する。既存のDDDアーキテクチャに準拠し、バックエンドAPI（.NET 10）とフロントエンド（frontend-public）の両方を拡張する。

## Technical Context

**Language/Version**: C# / .NET 10 (backend), TypeScript / React 18 (frontend)
**Primary Dependencies**: ASP.NET Core Minimal API, Entity Framework Core, TanStack Query, React Router v6, html2canvas (画像エクスポート用)
**Storage**: SQLite (既存DBに新テーブル追加)
**Testing**: xUnit (backend), 手動テスト (frontend)
**Target Platform**: Web (モバイル最適化)
**Project Type**: Web application (既存プロジェクトへの機能追加)
**Performance Goals**: 会話一覧3秒以内表示、画像エクスポート5秒以内
**Constraints**: スマートフォン片手操作対応、最低44pxタップ領域
**Scale/Scope**: 既存ユーザー向け追加機能、2画面 + API 6エンドポイント

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. レイヤードアーキテクチャ（DDD準拠） | ✅ PASS | Domain/Application/Infrastructure/Presentation層に分離 |
| II. Repository パターンと EF Core | ✅ PASS | IConversationRepository定義、Repository内で永続化完結 |
| III. 型安全性 | ✅ PASS | TypeScript strict mode、C# nullable参照型使用 |
| IV. フロントエンド分離 | ✅ PASS | frontend-publicに追加（顧客向け参照+入力機能） |
| V. シンプルさ優先（YAGNI） | ✅ PASS | 必要最小限の機能のみ実装 |

**Note**: 本機能はfrontend-public（顧客向け）に追加するが、参照だけでなく入力機能を持つ。これは憲法IV「参照専用」の拡張解釈となるが、ミーグリ記録は顧客自身が使う機能であり、管理機能ではないため許容される。

## Project Structure

### Documentation (this feature)

```text
specs/001-meetgreet-chat/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contracts)
│   └── conversations-api.yaml
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
# Backend (既存構造に追加)
src/
├── Domain/
│   └── Conversations/
│       ├── Entities/
│       │   ├── MeetGreetConversation.cs
│       │   └── ConversationMessage.cs
│       └── Repositories/
│           └── IConversationRepository.cs
├── Application/
│   └── Conversations/
│       ├── Commands/
│       │   ├── CreateConversationCommand.cs
│       │   ├── UpdateConversationCommand.cs
│       │   ├── DeleteConversationCommand.cs
│       │   └── AddMessageCommand.cs
│       ├── Queries/
│       │   ├── GetConversationQuery.cs
│       │   └── GetAllConversationsQuery.cs
│       └── DTOs/
│           └── ConversationDto.cs
├── Infrastructure/
│   └── Persistence/
│       ├── Configurations/
│       │   ├── MeetGreetConversationConfiguration.cs
│       │   └── ConversationMessageConfiguration.cs
│       └── Repositories/
│           └── ConversationRepository.cs
└── Presentation/
    └── Controllers/
        └── ConversationsController.cs

# Frontend (既存構造に追加)
frontend-public/
├── src/
│   ├── api/
│   │   └── conversations.ts
│   ├── components/
│   │   └── conversations/
│   │       ├── ChatBubble.tsx
│   │       ├── ChatInput.tsx
│   │       ├── ConversationCard.tsx
│   │       └── ExportableChat.tsx
│   ├── pages/
│   │   ├── ConversationsPage.tsx
│   │   └── ConversationDetailPage.tsx
│   └── types/
│       └── index.ts (追記)
```

**Structure Decision**: 既存のDDDレイヤー構造に従い、Conversationsドメインを新規追加。フロントエンドは既存のfrontend-publicに画面・コンポーネントを追加。

## Complexity Tracking

> Constitution Check に違反なし。追加の正当化は不要。

N/A
