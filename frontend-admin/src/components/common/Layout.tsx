import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'ホーム' },
    { path: '/members', label: 'メンバー' },
    { path: '/groups', label: 'グループ' },
    { path: '/formations', label: 'フォーメーション' },
  ];

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-brand">アイドル管理システム</div>
        <ul className="nav-links">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={location.pathname === item.path ? 'active' : ''}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <main className="main-content">{children}</main>
    </div>
  );
}
