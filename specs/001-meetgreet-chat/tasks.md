# Tasks: ミーグリ会話記録

**Input**: Design documents from `/specs/001-meetgreet-chat/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: テストは明示的に要求されていないため、手動テストのみ

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `src/Domain/`, `src/Application/`, `src/Infrastructure/`, `src/Presentation/`
- **Frontend**: `frontend-public/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: ドメインフォルダ構成とフロントエンド依存関係の追加

- [ ] T001 Create Conversations domain folder structure in src/Domain/Conversations/
- [ ] T002 Create Application layer folder structure in src/Application/Conversations/
- [ ] T003 [P] Install html2canvas dependency in frontend-public/ (npm install html2canvas @types/html2canvas)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Backend Entities & Repository

- [ ] T004 [P] Create SpeakerType enum in src/Domain/Conversations/Entities/SpeakerType.cs
- [ ] T005 [P] Create ConversationMessage entity in src/Domain/Conversations/Entities/ConversationMessage.cs
- [ ] T006 Create MeetGreetConversation entity (aggregate root) in src/Domain/Conversations/Entities/MeetGreetConversation.cs
- [ ] T007 Create IConversationRepository interface in src/Domain/Conversations/Repositories/IConversationRepository.cs
- [ ] T008 [P] Create ConversationMessageConfiguration in src/Infrastructure/Persistence/Configurations/ConversationMessageConfiguration.cs
- [ ] T009 [P] Create MeetGreetConversationConfiguration in src/Infrastructure/Persistence/Configurations/MeetGreetConversationConfiguration.cs
- [ ] T010 Add DbSet properties to AppDbContext in src/Infrastructure/Persistence/AppDbContext.cs
- [ ] T011 Create ConversationRepository in src/Infrastructure/Persistence/Repositories/ConversationRepository.cs
- [ ] T012 Register IConversationRepository in DI container in src/Infrastructure/DependencyInjection/ServiceCollectionExtensions.cs
- [ ] T013 Create and apply EF Core migration for Conversations tables

### Frontend Types

- [ ] T014 Add Conversation types to frontend-public/src/types/index.ts (MeetGreetConversation, ConversationSummary, ConversationMessage, SpeakerType, DTOs)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - 会話のリアルタイム記録 (Priority: P1) 🎯 MVP

**Goal**: ミーグリ中/直後に会話を素早く記録できる。チャット風UIで自分と相手のセリフを交互に入力。

**Independent Test**: 新規会話を作成し、自分とアイドルのセリフを交互に3〜5件入力してチャット風に表示される

### Backend - Application Layer

- [ ] T015 [P] [US1] Create ConversationDto in src/Application/Conversations/DTOs/ConversationDto.cs
- [ ] T016 [P] [US1] Create CreateConversationCommand and Handler in src/Application/Conversations/Commands/CreateConversationCommand.cs
- [ ] T017 [P] [US1] Create AddMessageCommand and Handler in src/Application/Conversations/Commands/AddMessageCommand.cs
- [ ] T018 [US1] Create GetConversationQuery and Handler in src/Application/Conversations/Queries/GetConversationQuery.cs

### Backend - Presentation Layer

- [ ] T019 [US1] Create ConversationsController with POST /api/conversations endpoint in src/Presentation/Controllers/ConversationsController.cs
- [ ] T020 [US1] Add GET /api/conversations/{id} endpoint to ConversationsController
- [ ] T021 [US1] Add POST /api/conversations/{id}/messages endpoint to ConversationsController

### Frontend - API & Components

- [ ] T022 [P] [US1] Create conversations API client in frontend-public/src/api/conversations.ts (createConversation, getConversation, addMessage)
- [ ] T023 [P] [US1] Create ChatBubble component in frontend-public/src/components/conversations/ChatBubble.tsx
- [ ] T024 [P] [US1] Create ChatInput component with speaker toggle in frontend-public/src/components/conversations/ChatInput.tsx
- [ ] T025 [US1] Create ConversationDetailPage in frontend-public/src/pages/ConversationDetailPage.tsx (new conversation mode)
- [ ] T026 [US1] Add member selector to ConversationDetailPage using existing members API

### Frontend - Routing & Navigation

- [ ] T027 [US1] Add /conversations/new route to App.tsx
- [ ] T028 [US1] Add "会話記録" link to Header component in frontend-public/src/components/common/Header.tsx

**Checkpoint**: User Story 1 complete - チャット風入力と表示が動作する

---

## Phase 4: User Story 2 - 会話の保存と一覧表示 (Priority: P2)

**Goal**: 会話をサーバーに保存し、一覧から過去の会話を閲覧できる

**Independent Test**: 会話を保存し、アプリ再起動後も一覧から過去の会話を開ける

### Backend - Application Layer

- [ ] T029 [P] [US2] Create GetAllConversationsQuery and Handler in src/Application/Conversations/Queries/GetAllConversationsQuery.cs
- [ ] T030 [P] [US2] Create UpdateConversationCommand and Handler in src/Application/Conversations/Commands/UpdateConversationCommand.cs
- [ ] T031 [P] [US2] Create DeleteConversationCommand and Handler in src/Application/Conversations/Commands/DeleteConversationCommand.cs

### Backend - Presentation Layer

- [ ] T032 [US2] Add GET /api/conversations (list with memberId filter) to ConversationsController
- [ ] T033 [US2] Add PUT /api/conversations/{id} endpoint to ConversationsController
- [ ] T034 [US2] Add DELETE /api/conversations/{id} endpoint to ConversationsController

### Frontend - API & Components

- [ ] T035 [P] [US2] Add getConversations, updateConversation, deleteConversation to conversations.ts API client
- [ ] T036 [P] [US2] Create ConversationCard component in frontend-public/src/components/conversations/ConversationCard.tsx
- [ ] T037 [US2] Create ConversationsPage (list view) in frontend-public/src/pages/ConversationsPage.tsx
- [ ] T038 [US2] Add member filter dropdown to ConversationsPage
- [ ] T039 [US2] Update ConversationDetailPage to support view/edit mode for saved conversations
- [ ] T040 [US2] Add save and delete buttons to ConversationDetailPage

### Frontend - Routing

- [ ] T041 [US2] Add /conversations route to App.tsx
- [ ] T042 [US2] Add /conversations/:id route to App.tsx

**Checkpoint**: User Stories 1 AND 2 complete - 会話の記録・保存・一覧表示が動作する

---

## Phase 5: User Story 3 - 会話の画像エクスポート (Priority: P3)

**Goal**: 会話をPNG画像としてダウンロードし、SNSでシェアできる

**Independent Test**: 保存済みの会話を画像ファイル（PNG）としてダウンロードできる

### Frontend - Export Components

- [ ] T043 [P] [US3] Create ExportableChat component (export-optimized layout) in frontend-public/src/components/conversations/ExportableChat.tsx
- [ ] T044 [US3] Implement useExportToImage hook using html2canvas in frontend-public/src/hooks/useExportToImage.ts
- [ ] T045 [US3] Add "画像ダウンロード" button to ConversationDetailPage
- [ ] T046 [US3] Style ExportableChat for SNS-friendly output (1080px width, centered layout, member image)

**Checkpoint**: All user stories complete - 会話記録・保存・一覧・画像エクスポートが動作する

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T047 [P] Add loading states and skeleton UI to ConversationsPage and ConversationDetailPage
- [ ] T048 [P] Add error handling and toast notifications for API errors
- [ ] T049 Add empty state validation (prevent saving empty conversations)
- [ ] T050 Mobile optimization - ensure 44px minimum tap targets, test on mobile viewport
- [ ] T051 Run quickstart.md validation (verify all setup steps work)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - US1 → US2 → US3 (sequential, each builds on previous)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - Creates the core chat UI
- **User Story 2 (P2)**: Depends on US1 - Adds persistence and list view
- **User Story 3 (P3)**: Depends on US2 - Adds export to existing detail page

### Within Each User Story

- Backend entities/DTOs before handlers
- Handlers before controllers
- Controllers before frontend API client
- API client before components
- Components before pages
- Pages before routing

### Parallel Opportunities

- Phase 1: T001, T002, T003 can run in parallel
- Phase 2: T004/T005 entities, T008/T009 configurations can run in parallel
- Phase 3: T015/T016/T017 commands, T022/T023/T024 frontend components can run in parallel
- Phase 4: T029/T030/T031 commands, T035/T036 frontend can run in parallel
- Phase 5: T043 export component can be developed in parallel with hook T044

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Launch entity tasks together:
Task: "Create SpeakerType enum in src/Domain/Conversations/Entities/SpeakerType.cs"
Task: "Create ConversationMessage entity in src/Domain/Conversations/Entities/ConversationMessage.cs"

# Launch configuration tasks together (after entities):
Task: "Create ConversationMessageConfiguration in src/Infrastructure/Persistence/Configurations/"
Task: "Create MeetGreetConversationConfiguration in src/Infrastructure/Persistence/Configurations/"
```

## Parallel Example: Phase 3 (User Story 1)

```bash
# Launch backend command handlers together:
Task: "Create CreateConversationCommand and Handler"
Task: "Create AddMessageCommand and Handler"

# Launch frontend components together:
Task: "Create ChatBubble component"
Task: "Create ChatInput component with speaker toggle"
Task: "Create conversations API client"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: チャット風入力・表示が動作することを確認
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy (MVP: 会話入力)
3. Add User Story 2 → Test independently → Deploy (保存・一覧機能追加)
4. Add User Story 3 → Test independently → Deploy (画像エクスポート追加)
5. Polish → Final testing → Release

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently testable at checkpoint
- Commit after each task or logical group
- Backend API can be tested independently with curl before frontend integration
- Frontend components can be developed with mock data before API integration
