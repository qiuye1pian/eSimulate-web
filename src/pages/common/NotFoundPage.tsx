import { Button, Result } from 'antd';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <Result
      status="404"
      title="页面不存在"
      subTitle="请检查访问地址，或返回方案仿真页面。"
      extra={
        <Link to="/simulation/scheme">
          <Button type="primary">返回方案仿真</Button>
        </Link>
      }
    />
  );
}
