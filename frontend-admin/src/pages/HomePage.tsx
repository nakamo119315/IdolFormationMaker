import { useQuery } from '@tanstack/react-query';
import { membersApi } from '../api/members';
import { groupsApi } from '../api/groups';
import { formationsApi } from '../api/formations';

export function HomePage() {
  const { data: members } = useQuery({ queryKey: ['members'], queryFn: membersApi.getAll });
  const { data: groups } = useQuery({ queryKey: ['groups'], queryFn: groupsApi.getAll });
  const { data: formations } = useQuery({ queryKey: ['formations'], queryFn: formationsApi.getAll });

  return (
    <div className="home-page">
      <h1>ダッシュボード</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>メンバー</h3>
          <p className="stat-number">{members?.length ?? 0}</p>
        </div>
        <div className="stat-card">
          <h3>グループ</h3>
          <p className="stat-number">{groups?.length ?? 0}</p>
        </div>
        <div className="stat-card">
          <h3>フォーメーション</h3>
          <p className="stat-number">{formations?.length ?? 0}</p>
        </div>
      </div>
    </div>
  );
}
