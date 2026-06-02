import { Button, Card, Form, Input, Typography } from 'antd';

export function LoginPage() {
  return (
    <Card title="eSimulate 登录" style={{ width: 360 }}>
      <Form layout="vertical">
        <Form.Item label="账号" name="username">
          <Input placeholder="请输入账号" />
        </Form.Item>
        <Form.Item label="密码" name="password">
          <Input.Password placeholder="请输入密码" />
        </Form.Item>
        <Button type="primary" block>
          登录
        </Button>
      </Form>
      <Typography.Paragraph type="secondary" style={{ marginTop: 16, marginBottom: 0 }}>
        第一阶段占位页面，后续接入旧版 RSA 登录流程。
      </Typography.Paragraph>
    </Card>
  );
}
