import { useParams } from 'react-router-dom';

const titles: Record<string, string> = {
  users: '用户管理',
  roles: '角色管理',
  resources: '资源管理',
};

export function SystemPage() {
  const { section = '' } = useParams();
  const title = titles[section] ?? '系统管理';

  return (
    <section className="page-shell">
      <h1 className="page-shell__title">{title}</h1>
      <p className="page-shell__description">系统管理模块先保留路由和模块边界，后续按业务优先级复刻。</p>
    </section>
  );
}
