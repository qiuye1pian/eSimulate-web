import { useParams } from 'react-router-dom';
import { UserManagementPage } from './UserManagementPage';

const titles: Record<string, string> = {
  users: '用户管理',
  roles: '角色管理',
};

export function SystemPage() {
  const { section = '' } = useParams();
  const title = titles[section] ?? '系统管理';

  if (section === 'users') {
    return (
      <section className="page-shell">
        <h1 className="page-shell__title">{title}</h1>
        <p className="page-shell__description">管理系统登录用户，当前版本统一使用 user 角色。</p>
        <UserManagementPage />
      </section>
    );
  }

  return (
    <section className="page-shell">
      <h1 className="page-shell__title">{title}</h1>
      <p className="page-shell__description">角色管理暂不启用，当前系统统一使用 user 角色。</p>
    </section>
  );
}
