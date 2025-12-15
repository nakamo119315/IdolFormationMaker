# dotnet10App

.NET 10 コンソールアプリケーション

## ビルド・実行

```bash
dotnet build
dotnet run
```

## ソースコード構成 (DDD)

```
src/
├── Domain/                           # ドメイン層
│   ├── Shared/                       # 共通（複数ドメインで使用）
│   │   ├── ValueObjects/
│   │   │   └── SharedValueObject.cs
│   │   └── Interfaces/
│   │       └── IEntity.cs
│   │
│   ├── DomainA/                      # ドメインA（境界づけられたコンテキスト）
│   │   ├── Entities/
│   │   │   └── DomainAEntity.cs
│   │   ├── ValueObjects/
│   │   │   └── DomainAValueObject.cs
│   │   ├── Aggregates/
│   │   │   └── DomainAAggregate.cs
│   │   ├── Services/
│   │   │   └── DomainAService.cs
│   │   ├── Events/
│   │   │   └── DomainACreatedEvent.cs
│   │   └── Repositories/
│   │       └── IDomainARepository.cs
│   │
│   └── DomainB/                      # ドメインB
│       ├── Entities/
│       │   └── DomainBEntity.cs
│       ├── ValueObjects/
│       │   └── DomainBValueObject.cs
│       ├── Services/
│       │   └── DomainBService.cs
│       └── Repositories/
│           └── IDomainBRepository.cs
│
├── Application/                      # アプリケーション層
│   ├── Shared/
│   │   └── Interfaces/
│   │       └── IUseCase.cs
│   │
│   ├── DomainA/
│   │   ├── Commands/
│   │   │   ├── CreateDomainACommand.cs
│   │   │   └── CreateDomainAHandler.cs
│   │   ├── Queries/
│   │   │   ├── GetDomainAQuery.cs
│   │   │   └── GetDomainAHandler.cs
│   │   └── DTOs/
│   │       └── DomainADto.cs
│   │
│   └── DomainB/
│       ├── Commands/
│       │   └── CreateDomainBCommand.cs
│       ├── Queries/
│       │   └── GetDomainBQuery.cs
│       └── DTOs/
│           └── DomainBDto.cs
│
├── Infrastructure/                   # インフラストラクチャ層
│   ├── Persistence/
│   │   ├── DbContext.cs
│   │   ├── DomainA/
│   │   │   ├── DomainAConfiguration.cs
│   │   │   └── DomainARepository.cs
│   │   └── DomainB/
│   │       ├── DomainBConfiguration.cs
│   │       └── DomainBRepository.cs
│   ├── ExternalServices/
│   │   └── ExternalApiClient.cs
│   └── DependencyInjection/
│       └── ServiceCollectionExtensions.cs
│
└── Presentation/                     # プレゼンテーション層
    ├── Controllers/
    │   ├── DomainAController.cs
    │   └── DomainBController.cs
    └── Middlewares/
        └── ExceptionMiddleware.cs

tests/
├── Domain.Tests/
│   ├── DomainA/
│   │   └── DomainAEntityTests.cs
│   └── DomainB/
│       └── DomainBEntityTests.cs
├── Application.Tests/
│   ├── DomainA/
│   │   └── CreateDomainAHandlerTests.cs
│   └── DomainB/
│       └── CreateDomainBHandlerTests.cs
└── Integration.Tests/
    └── DomainAIntegrationTests.cs
```

## 設計原則

- **依存関係の方向**: 外側から内側へ（Presentation → Application → Domain）
- **Domain層**: 他の層に依存しない。純粋なビジネスロジックのみ
- **Infrastructure層**: Domain層のインターフェースを実装
- **集約**: トランザクション整合性の境界。集約ルート経由でのみアクセス

## 要件

### 概要

アイドルのメンバー、グループ、フォーメーション情報を管理するAPI

### ドメインモデル

#### Member（メンバー）
| プロパティ | 型 | 説明 |
|-----------|-----|------|
| Id | Guid | メンバーID |
| Name | string | 名前 |
| BirthDate | DateOnly | 生年月日 |
| Images | List<MemberImage> | 画像一覧 |
| GroupId | Guid? | 所属グループID |
| CreatedAt | DateTime | 作成日時 |
| UpdatedAt | DateTime | 更新日時 |

#### MemberImage（メンバー画像）
| プロパティ | 型 | 説明 |
|-----------|-----|------|
| Id | Guid | 画像ID |
| MemberId | Guid | メンバーID |
| Url | string | 画像URL |
| IsPrimary | bool | メイン画像フラグ |
| CreatedAt | DateTime | 作成日時 |

#### Group（グループ）
| プロパティ | 型 | 説明 |
|-----------|-----|------|
| Id | Guid | グループID |
| Name | string | グループ名 |
| DebutDate | DateOnly? | デビュー日 |
| Members | List<Member> | 所属メンバー一覧 |
| CreatedAt | DateTime | 作成日時 |
| UpdatedAt | DateTime | 更新日時 |

#### Formation（フォーメーション）
| プロパティ | 型 | 説明 |
|-----------|-----|------|
| Id | Guid | フォーメーションID |
| Name | string | フォーメーション名（曲名など） |
| GroupId | Guid | グループID |
| Positions | List<FormationPosition> | ポジション一覧 |
| CreatedAt | DateTime | 作成日時 |
| UpdatedAt | DateTime | 更新日時 |

#### FormationPosition（フォーメーションポジション）
| プロパティ | 型 | 説明 |
|-----------|-----|------|
| Id | Guid | ポジションID |
| FormationId | Guid | フォーメーションID |
| MemberId | Guid | メンバーID |
| PositionNumber | int | ポジション番号 |
| Row | int | 列（前後） |
| Column | int | 行（左右） |

### API エンドポイント

#### Members API
| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| GET | /api/members | メンバー一覧取得 |
| GET | /api/members/{id} | メンバー詳細取得 |
| POST | /api/members | メンバー登録 |
| PUT | /api/members/{id} | メンバー更新 |
| DELETE | /api/members/{id} | メンバー削除 |
| POST | /api/members/{id}/images | メンバー画像追加 |
| DELETE | /api/members/{id}/images/{imageId} | メンバー画像削除 |

#### Groups API
| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| GET | /api/groups | グループ一覧取得 |
| GET | /api/groups/{id} | グループ詳細取得 |
| POST | /api/groups | グループ登録 |
| PUT | /api/groups/{id} | グループ更新 |
| DELETE | /api/groups/{id} | グループ削除 |

#### Formations API
| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| GET | /api/formations | フォーメーション一覧取得 |
| GET | /api/formations/{id} | フォーメーション詳細取得 |
| POST | /api/formations | フォーメーション登録 |
| PUT | /api/formations/{id} | フォーメーション更新 |
| DELETE | /api/formations/{id} | フォーメーション削除 |

### データベース

#### 方針
- **初期DB**: SQLite（サーバ内ファイルベース、追加インストール不要）
- **将来的な拡張**: PostgreSQL、SQL Server等への差し替えを想定

#### リポジトリパターン

```
Domain層（インターフェース定義）
├── Members/Repositories/
│   └── IMemberRepository.cs          # インターフェース
├── Groups/Repositories/
│   └── IGroupRepository.cs
└── Formations/Repositories/
    └── IFormationRepository.cs

Infrastructure層（実装）
├── Persistence/
│   ├── AppDbContext.cs               # EF Core DbContext
│   ├── SQLite/                       # SQLite実装（初期）
│   │   ├── SqliteMemberRepository.cs
│   │   ├── SqliteGroupRepository.cs
│   │   └── SqliteFormationRepository.cs
│   └── PostgreSQL/                   # PostgreSQL実装（将来）
│       ├── PostgresMemberRepository.cs
│       └── ...
```

#### DI設定による切り替え

```csharp
// SQLite使用時
services.AddScoped<IMemberRepository, SqliteMemberRepository>();
services.AddScoped<IGroupRepository, SqliteGroupRepository>();
services.AddScoped<IFormationRepository, SqliteFormationRepository>();

// PostgreSQL切り替え時（実装クラスを差し替えるだけ）
services.AddScoped<IMemberRepository, PostgresMemberRepository>();
services.AddScoped<IGroupRepository, PostgresGroupRepository>();
services.AddScoped<IFormationRepository, PostgresFormationRepository>();
```

#### 設計ポイント
- Domain層はDB実装の詳細を知らない（インターフェースのみ依存）
- Application層はインターフェース経由でリポジトリを利用
- Infrastructure層で具体的なDB実装を提供
- DIコンテナでの登録変更のみでDB切り替え可能

### Frontend（React）

#### 技術スタック
- **フレームワーク**: React 18
- **言語**: TypeScript
- **ビルドツール**: Vite
- **状態管理**: TanStack Query（React Query v5）
- **ルーティング**: React Router v6
- **HTTPクライアント**: fetch API
- **スタイリング**: CSS（カスタム）

#### 起動方法

```bash
# 開発サーバー起動
cd frontend
npm run dev
# http://localhost:5173 でアクセス

# ビルド
npm run build
```

#### フォルダ構成（実装済み）

```
frontend/
├── src/
│   ├── api/                      # API通信層
│   │   ├── client.ts             # HTTPクライアント（共通fetch wrapper）
│   │   ├── members.ts            # Members API（CRUD）
│   │   ├── groups.ts             # Groups API（CRUD）
│   │   └── formations.ts         # Formations API（CRUD）
│   │
│   ├── components/               # UIコンポーネント
│   │   └── common/               # 共通コンポーネント
│   │       ├── Layout.tsx        # ナビゲーション付きレイアウト
│   │       └── Modal.tsx         # モーダルダイアログ
│   │
│   ├── pages/                    # ページコンポーネント（CRUD機能付き）
│   │   ├── HomePage.tsx          # ダッシュボード（統計表示）
│   │   ├── MembersPage.tsx       # メンバー管理（一覧・登録・編集・削除）
│   │   ├── GroupsPage.tsx        # グループ管理（一覧・登録・編集・削除）
│   │   └── FormationsPage.tsx    # フォーメーション管理（一覧・登録・編集・削除）
│   │
│   ├── types/                    # 型定義
│   │   └── index.ts              # API DTOに対応するTypeScript型
│   │
│   ├── App.tsx                   # ルーティング設定、QueryClientProvider
│   ├── main.tsx                  # エントリーポイント
│   └── index.css                 # グローバルスタイル
│
├── package.json
├── tsconfig.json
└── vite.config.ts                # APIプロキシ設定（/api → localhost:5000）
```

#### 画面一覧

| 画面 | パス | 機能 |
|------|------|------|
| ホーム | / | ダッシュボード（メンバー・グループ・フォーメーション数） |
| メンバー管理 | /members | 一覧テーブル、モーダルで登録・編集、削除確認 |
| グループ管理 | /groups | 一覧テーブル、モーダルで登録・編集、削除確認 |
| フォーメーション管理 | /formations | 一覧テーブル、モーダルで登録・編集（ポジション動的追加）、削除確認 |

#### APIプロキシ設定

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
```

#### 主要コンポーネントの責務

| コンポーネント | 責務 |
|---------------|------|
| Layout | ナビゲーションバー、ページコンテンツのラッパー |
| Modal | 汎用モーダルダイアログ（登録・編集フォーム用） |
| HomePage | API呼び出し、統計カードの表示 |
| MembersPage | メンバーCRUD、グループ選択ドロップダウン |
| GroupsPage | グループCRUD、デビュー日入力 |
| FormationsPage | フォーメーションCRUD、ポジション動的追加・削除 |

#### 型定義（types/index.ts）

```typescript
// Member
export interface Member {
  id: string;
  name: string;
  birthDate: string;
  groupId: string | null;
  images: MemberImage[];
  createdAt: string;
  updatedAt: string;
}

export interface MemberImage {
  id: string;
  url: string;
  isPrimary: boolean;
  createdAt: string;
}

export interface CreateMemberDto {
  name: string;
  birthDate: string;
  groupId?: string | null;
}

export interface UpdateMemberDto {
  name: string;
  birthDate: string;
  groupId?: string | null;
}

// Group
export interface Group {
  id: string;
  name: string;
  debutDate: string | null;
  members: Member[];
  createdAt: string;
  updatedAt: string;
}

export interface GroupSummary {
  id: string;
  name: string;
  debutDate: string | null;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGroupDto {
  name: string;
  debutDate?: string | null;
}

export interface UpdateGroupDto {
  name: string;
  debutDate?: string | null;
}

// Formation
export interface Formation {
  id: string;
  name: string;
  groupId: string;
  positions: FormationPosition[];
  createdAt: string;
  updatedAt: string;
}

export interface FormationPosition {
  id: string;
  memberId: string;
  positionNumber: number;
  row: number;
  column: number;
}

export interface CreateFormationDto {
  name: string;
  groupId: string;
  positions: CreateFormationPositionDto[];
}

export interface CreateFormationPositionDto {
  memberId: string;
  positionNumber: number;
  row: number;
  column: number;
}

export interface UpdateFormationDto {
  name: string;
  groupId: string;
  positions: CreateFormationPositionDto[];
}
```
