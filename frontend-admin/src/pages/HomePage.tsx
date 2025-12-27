import { useQuery } from '@tanstack/react-query';
import { membersApi } from '../api/members';
import { groupsApi } from '../api/groups';
import { formationsApi } from '../api/formations';
import { songsApi } from '../api/songs';
import { Loading } from '../components/common/Loading';

export function HomePage() {
  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ['members'],
    queryFn: membersApi.getAll,
  });
  const { data: groups, isLoading: groupsLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: groupsApi.getAll,
  });
  const { data: formations, isLoading: formationsLoading } = useQuery({
    queryKey: ['formations'],
    queryFn: formationsApi.getAll,
  });
  const { data: songs, isLoading: songsLoading } = useQuery({
    queryKey: ['songs'],
    queryFn: songsApi.getAll,
  });

  const isLoading = membersLoading || groupsLoading || formationsLoading || songsLoading;

  if (isLoading) return <Loading message="ダッシュボードを読み込み中..." />;

  // 統計計算
  const activeMembers = members?.filter(m => !m.isGraduated).length ?? 0;
  const graduatedMembers = members?.filter(m => m.isGraduated).length ?? 0;

  // グループ別メンバー数
  const groupMemberCounts = groups?.map(g => ({
    name: g.name,
    count: g.memberCount,
  })) ?? [];

  return (
    <div className="home-page">
      <h1>ダッシュボード</h1>

      {/* メイン統計 */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>メンバー</h3>
          <p className="stat-number">{members?.length ?? 0}</p>
          <p className="stat-sub">現役: {activeMembers} / 卒業: {graduatedMembers}</p>
        </div>
        <div className="stat-card">
          <h3>グループ</h3>
          <p className="stat-number">{groups?.length ?? 0}</p>
        </div>
        <div className="stat-card">
          <h3>フォーメーション</h3>
          <p className="stat-number">{formations?.length ?? 0}</p>
        </div>
        <div className="stat-card">
          <h3>楽曲</h3>
          <p className="stat-number">{songs?.length ?? 0}</p>
        </div>
      </div>

      {/* グループ別統計 */}
      {groupMemberCounts.length > 0 && (
        <div className="dashboard-section">
          <h2>グループ別メンバー数</h2>
          <div className="group-stats">
            {groupMemberCounts.map((g) => (
              <div key={g.name} className="group-stat-item">
                <span className="group-name">{g.name}</span>
                <span className="group-count">{g.count}人</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 最近の更新 */}
      {members && members.length > 0 && (
        <div className="dashboard-section">
          <h2>最近追加されたメンバー</h2>
          <div className="recent-list">
            {members
              .slice()
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 5)
              .map((member) => (
                <div key={member.id} className="recent-item">
                  <span className="recent-name">{member.name}</span>
                  <span className="recent-date">
                    {new Date(member.createdAt).toLocaleDateString('ja-JP')}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
