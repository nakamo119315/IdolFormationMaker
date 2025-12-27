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

### 3. バックエンド機能追加

#### 3.1 ページングAPI
- `GET /api/members/paged?page=1&pageSize=20` - メンバー一覧（ページング）
- `GET /api/groups/paged?page=1&pageSize=20` - グループ一覧（ページング）
- `GET /api/songs/paged?page=1&pageSize=20` - 楽曲一覧（ページング）

**レスポンス形式:**
```json
{
  "items": [...],
  "totalCount": 100,
  "page": 1,
  "pageSize": 20,
  "totalPages": 5,
  "hasNextPage": true,
  "hasPreviousPage": false
}
```

#### 3.2 検索・フィルタリングAPI
**メンバー検索パラメータ:**
- `search` - 名前・出身地で検索
- `groupId` - グループでフィルタ
- `generation` - 期でフィルタ
- `isGraduated` - 卒業フラグでフィルタ

**楽曲検索パラメータ:**
- `search` - タイトル・作詞・作曲で検索
- `groupId` - グループでフィルタ

#### 3.3 CSVエクスポートAPI
- `GET /api/members/export` - メンバー一覧CSV
- `GET /api/songs/export` - 楽曲一覧CSV
- UTF-8 BOM付き（Excel互換）

### 4. frontend-admin 機能追加

#### 4.1 ページングUI
- `src/components/common/Pagination.tsx` - ページネーションコンポーネント
- 件数表示（○件中 1-20件を表示）
- ページ番号ナビゲーション

#### 4.2 検索フォーム
- `src/components/common/SearchForm.tsx` - 検索コンポーネント
- リアルタイム検索（エンターで実行）
- クリアボタン

#### 4.3 フィルタ機能
- グループでフィルタ
- 期別でフィルタ
- フィルタ変更時に1ページ目に戻る

#### 4.4 CSVエクスポートボタン
- メンバー管理画面にCSVエクスポートボタン追加
- ダウンロード中の状態表示

---

## 今後のTODO

### 優先度: 高

#### セキュリティ
- [ ] JWT認証の実装
- [ ] Role ベースのアクセス制御（RBAC）
- [ ] CORS設定の厳格化（必要なメソッド/ヘッダのみに限定）
- [ ] 入力バリデーション（FluentValidation導入）

### 優先度: 中

#### 機能追加
- [ ] 一括削除機能（複数選択削除）
- [ ] OGPメタデータ設定（frontend-public）
- [ ] SNSシェア機能（Twitter, LINE等）

#### UX改善
- [ ] フォームバリデーション（Zod + React Hook Form）
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
src/
├── Application/
│   ├── Shared/
│   │   └── PagedResult.cs           # ページング結果型
│   ├── Members/
│   │   └── Queries/
│   │       ├── GetMembersPagedQuery.cs  # ページングクエリ
│   │       └── ExportMembersCsvQuery.cs # CSVエクスポート
│   ├── Groups/
│   │   └── Queries/
│   │       └── GetGroupsPagedQuery.cs   # ページングクエリ
│   └── Songs/
│       └── Queries/
│           ├── GetSongsPagedQuery.cs    # ページングクエリ
│           └── ExportSongsCsvQuery.cs   # CSVエクスポート

frontend-admin/
├── src/
│   ├── api/
│   │   └── members.ts               # getPaged, exportCsv 追加
│   ├── components/
│   │   └── common/
│   │       ├── Loading.tsx          # ローディングコンポーネント
│   │       ├── ConfirmDialog.tsx    # 削除確認モーダル
│   │       ├── Toast.tsx            # トースト通知
│   │       ├── Pagination.tsx       # ページネーション
│   │       └── SearchForm.tsx       # 検索フォーム
│   ├── types/
│   │   └── index.ts                 # PagedResult 追加
│   └── pages/
│       └── MembersPage.tsx          # ページング・検索対応

frontend-public/
├── src/
│   └── components/
│       └── common/
│           └── LazyImage.tsx        # 画像遅延読み込み
```

---

## API エンドポイント一覧

### Members API
| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| GET | /api/members | メンバー一覧取得（全件） |
| GET | /api/members/paged | メンバー一覧取得（ページング） |
| GET | /api/members/export | メンバーCSVエクスポート |
| GET | /api/members/{id} | メンバー詳細取得 |
| POST | /api/members | メンバー登録 |
| PUT | /api/members/{id} | メンバー更新 |
| DELETE | /api/members/{id} | メンバー削除 |

### Groups API
| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| GET | /api/groups | グループ一覧取得（全件） |
| GET | /api/groups/paged | グループ一覧取得（ページング） |
| GET | /api/groups/{id} | グループ詳細取得 |
| POST | /api/groups | グループ登録 |
| PUT | /api/groups/{id} | グループ更新 |
| DELETE | /api/groups/{id} | グループ削除 |

### Songs API
| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| GET | /api/songs | 楽曲一覧取得（全件） |
| GET | /api/songs/paged | 楽曲一覧取得（ページング） |
| GET | /api/songs/export | 楽曲CSVエクスポート |
| GET | /api/songs/{id} | 楽曲詳細取得 |
| POST | /api/songs | 楽曲登録 |
| PUT | /api/songs/{id} | 楽曲更新 |
| DELETE | /api/songs/{id} | 楽曲削除 |
