import { Layout, Menu, Typography } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { mainMenuItems } from '@/features/navigation/menu';

const { Header, Sider, Content } = Layout;

export function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Layout className="main-layout">
      <Sider width={256} breakpoint="lg" collapsedWidth={0} className="main-layout__sider">
        <div className="main-layout__brand">eSimulate</div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={mainMenuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header className="main-layout__header">
          <Typography.Text strong>县域多能互补一体化平台</Typography.Text>
        </Header>
        <Content className="main-layout__content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
