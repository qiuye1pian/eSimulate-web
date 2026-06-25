import { useMutation, useQuery } from '@tanstack/react-query';
import { App, Button, Card, Form, Input, Modal, Popconfirm, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { createUser, deleteUser, getUsers, type UserRecord } from '@/services/users';

interface UserFormValues {
  username: string;
  password: string;
}

export function UserManagementPage() {
  const { message } = App.useApp();
  const [form] = Form.useForm<UserFormValues>();
  const [modalOpen, setModalOpen] = useState(false);

  const usersQuery = useQuery({
    queryKey: ['system-users'],
    queryFn: getUsers,
  });

  const createMutation = useMutation({
    mutationFn: (values: UserFormValues) => createUser({ ...values, role: 'user' }),
    onSuccess: () => {
      message.success('用户创建成功');
      setModalOpen(false);
      form.resetFields();
      usersQuery.refetch();
    },
    onError: error => message.error(error instanceof Error ? error.message : '用户创建失败'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      message.success('用户删除成功');
      usersQuery.refetch();
    },
    onError: error => message.error(error instanceof Error ? error.message : '用户删除失败'),
  });

  const columns: ColumnsType<UserRecord> = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 100,
    },
    {
      title: '用户名',
      dataIndex: 'username',
    },
    {
      title: '角色',
      dataIndex: 'role',
      width: 160,
      render: role => <Tag color="blue">{String(role || 'user')}</Tag>,
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Popconfirm
          title="确认删除该用户？"
          okText="删除"
          cancelText="取消"
          onConfirm={() => deleteMutation.mutate(record.id)}
        >
          <Button danger type="link" size="small">
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <section className="resource-page">
      <Card>
        <div className="resource-page__toolbar">
          <span>当前系统只使用单一用户角色：user</span>
          <Space>
            <Button onClick={() => usersQuery.refetch()}>刷新</Button>
            <Button type="primary" onClick={() => setModalOpen(true)}>
              新增用户
            </Button>
          </Space>
        </div>
        <Table
          rowKey="id"
          loading={usersQuery.isLoading || deleteMutation.isPending}
          columns={columns}
          dataSource={usersQuery.data?.data ?? []}
          pagination={false}
        />
      </Card>

      <Modal
        title="新增用户"
        open={modalOpen}
        confirmLoading={createMutation.isPending}
        okText="创建"
        cancelText="取消"
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={values => createMutation.mutate(values)}
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
          <Form.Item label="角色">
            <Input value="user" disabled />
          </Form.Item>
        </Form>
      </Modal>
    </section>
  );
}
