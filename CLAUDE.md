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
