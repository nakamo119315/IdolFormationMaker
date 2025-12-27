# アプリケーション改善ログ

## 実装済み改善（2025-12-27）

### 1. frontend-admin UX改善

#### 1.1 ローディングコンポーネント
- `src/components/common/Loading.tsx` - スピナー付きローディング表示
- 各ページでローディング中に表示

#### 1.2 削除確認モーダル
- `src/components/common/ConfirmDialog.tsx` - 削除確認ダイアログ
- `window.confirm` から専用モーダルに変更
- 処理中状態の表示対応

#### 1.3 トースト通知
- `src/components/common/Toast.tsx` - 操作結果の通知
- 成功/エラー/警告/情報の4タイプ
- 自動消去（4秒後）

#### 1.4 エラーハンドリング改善
- 全ページにエラー表示と再読み込みボタンを追加
- API操作の成功/失敗をトーストで通知
- ボタンの disabled 状態で二重送信防止

#### 1.5 ダッシュボード統計
- `HomePage.tsx` に詳細な統計情報を追加
  - 現役/卒業メンバー数
  - グループ別メンバー数
  - 最近追加されたメンバー一覧

### 2. frontend-public 改善

#### 2.1 画像遅延読み込み
- `src/components/common/LazyImage.tsx` - Intersection Observer を使用
- ビューポートに入った時点で画像を読み込み
- ローディングスピナー付きプレースホルダー

#### 2.2 セトリ画像保存機能
- `SetlistDetailPage.tsx` に画像保存ボタン追加
- html2canvas を使用してPNG形式でダウンロード
- iOS Safari対応（Web Share API）

---

## 今後のTODO

### 優先度: 高

#### セキュリティ
- [ ] JWT認証の実装
- [ ] Role ベースのアクセス制御（RBAC）
- [ ] CORS設定の厳格化（必要なメソッド/ヘッダのみに限定）
- [ ] 入力バリデーション（FluentValidation導入）

#### パフォーマンス
- [ ] ページングAPI実装（`?page=1&pageSize=20`）
- [ ] 検索・フィルタリングAPI実装（`?search=xxx&groupId=xxx`）
- [ ] フロントエンドでのページングUI実装

### 優先度: 中

#### 機能追加
- [ ] 一括削除機能（複数選択削除）
- [ ] CSVエクスポートAPI（`/api/members/export`等）
- [ ] OGPメタデータ設定（frontend-public）
- [ ] SNSシェア機能（Twitter, LINE等）

#### UX改善
- [ ] フォームバリデーション（Zod + React Hook Form）
- [ ] 無限スクロール/ページングUI
- [ ] スケルトンローディング

### 優先度: 低

#### インフラ・運用
- [ ] 監査ログ（操作履歴の記録）
- [ ] レート制限（DDoS対策）
- [ ] マイグレーション戦略の整備

#### テスト
- [ ] Application Handlers テスト追加（現在9個 → 30個程度）
- [ ] frontend-admin 単体テスト（React Testing Library）
- [ ] E2Eテスト（Playwright）

---

## ファイル構成（追加分）

```
frontend-admin/
├── src/
│   ├── components/
│   │   └── common/
│   │       ├── Loading.tsx      # ローディングコンポーネント
│   │       ├── ConfirmDialog.tsx # 削除確認モーダル
│   │       └── Toast.tsx        # トースト通知
│   └── pages/
│       ├── MembersPage.tsx      # 改善済み
│       ├── GroupsPage.tsx       # 改善済み
│       ├── SongsPage.tsx        # 改善済み
│       ├── FormationsPage.tsx   # 改善済み
│       └── HomePage.tsx         # ダッシュボード統計追加

frontend-public/
├── src/
│   └── components/
│       └── common/
│           └── LazyImage.tsx    # 画像遅延読み込み
```

---

## 参考実装パターン

### ページングAPI実装例（バックエンド）

```csharp
// Application/Members/Queries/GetMembersPagedQuery.cs
public record GetMembersPagedQuery(
    int Page = 1,
    int PageSize = 20,
    string? Search = null,
    Guid? GroupId = null
) : IRequest<PagedResult<MemberDto>>;

public record PagedResult<T>(
    IEnumerable<T> Items,
    int TotalCount,
    int Page,
    int PageSize
);
```

### CSVエクスポートAPI実装例

```csharp
// Presentation/Controllers/MembersController.cs
[HttpGet("export")]
public async Task<IActionResult> Export()
{
    var members = await _mediator.Send(new GetAllMembersQuery());
    var csv = GenerateCsv(members);
    return File(Encoding.UTF8.GetBytes(csv), "text/csv", "members.csv");
}
```

### フロントエンドページング実装例

```typescript
// MembersPage.tsx
const [page, setPage] = useState(1);
const { data } = useQuery({
  queryKey: ['members', page],
  queryFn: () => membersApi.getPaged(page, 20),
});

// Pagination UI
<Pagination
  currentPage={data.page}
  totalPages={Math.ceil(data.totalCount / data.pageSize)}
  onPageChange={setPage}
/>
```
