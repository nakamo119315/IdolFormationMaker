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
