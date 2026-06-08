import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { App, Button, Card, Form, Input, InputNumber, List, Pagination, Space } from 'antd';
import { addGridPricing, deleteResource, getResourceList } from '@/services/environment';
import type { ApiRecord } from '@/types/api';

interface GridPricingFormValues {
  modelName: string;
  gridPrice: number;
  carbonEmissionFactor: number;
}

export function buildGridPricingPayload(id: number | string | null, values: GridPricingFormValues) {
  return id === null ? values : { id, ...values };
}

function getRecordId(record: ApiRecord) {
  return record.id as number | string | undefined;
}

function getRecordName(record: ApiRecord) {
  return String(record.modelName ?? '-');
}

export function GridPricingPage() {
  const { message, modal } = App.useApp();
  const [form] = Form.useForm<GridPricingFormValues>();
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [keyword, setKeyword] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<ApiRecord | null>(null);

  const listQuery = useQuery({
    queryKey: ['grid-pricing-list', page, keyword],
    queryFn: () => getResourceList('model/grid', { page, size: 10, modelName: keyword || undefined }),
  });

  const resetEditor = () => {
    setSelectedRecord(null);
    form.resetFields();
    form.setFieldValue('carbonEmissionFactor', 0);
  };

  const saveMutation = useMutation({
    mutationFn: (values: GridPricingFormValues) =>
      addGridPricing(buildGridPricingPayload(selectedRecord ? getRecordId(selectedRecord) ?? null : null, values)),
    onSuccess: () => {
      message.success(selectedRecord ? '保存电网电价模型成功' : '添加电网电价模型成功');
      resetEditor();
      listQuery.refetch();
    },
    onError: error => message.error(error instanceof Error ? error.message : '保存失败'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number | string) => deleteResource('model/grid', id),
    onSuccess: () => {
      message.success('删除成功');
      resetEditor();
      listQuery.refetch();
    },
    onError: error => message.error(error instanceof Error ? error.message : '删除失败'),
  });

  const handleSelect = (record: ApiRecord) => {
    const applyRecord = () => {
      setSelectedRecord(record);
      form.setFieldsValue({
        modelName: String(record.modelName ?? ''),
        gridPrice: Number(record.gridPrice ?? 0),
        carbonEmissionFactor: Number(record.carbonEmissionFactor ?? 0),
      });
    };

    if (form.isFieldsTouched()) {
      modal.confirm({
        title: '忽略未保存的数据吗？',
        content: '点击确定后，未保存的数据将丢失。',
        okText: '确定',
        cancelText: '取消',
        onOk: applyRecord,
      });
      return;
    }
    applyRecord();
  };

  const records = listQuery.data?.data.list ?? [];
  const total = listQuery.data?.data.total ?? 0;
  const currentPage = listQuery.data?.data.page ?? page;
  const pageSize = listQuery.data?.data.size ?? 10;

  return (
    <div className="grid-pricing-layout">
      <Card title="模型管理">
        <Space.Compact block>
          <Input
            allowClear
            value={searchText}
            placeholder="请输入模型名称"
            onChange={event => setSearchText(event.target.value)}
            onPressEnter={event => {
              setPage(1);
              setKeyword(event.currentTarget.value.trim());
            }}
          />
          <Button
            type="primary"
            onClick={() => {
              setPage(1);
              setKeyword(searchText.trim());
            }}
          >
            搜索
          </Button>
        </Space.Compact>
        <List
          className="grid-pricing-list"
          loading={listQuery.isLoading || deleteMutation.isPending}
          dataSource={records}
          renderItem={record => {
            const id = getRecordId(record);
            return (
              <List.Item
                className={selectedRecord && getRecordId(selectedRecord) === id ? 'grid-pricing-list__selected' : undefined}
                actions={[
                  <Button
                    key="delete"
                    danger
                    type="link"
                    disabled={id === undefined}
                    onClick={(event) => {
                      event.stopPropagation();
                      modal.confirm({
                        title: '确认删除',
                        content: '确定要删除这条数据吗？',
                        okText: '确定',
                        cancelText: '取消',
                        onOk: () => id !== undefined && deleteMutation.mutate(id),
                      });
                    }}
                  >
                    删除
                  </Button>,
                ]}
                onClick={() => handleSelect(record)}
              >
                {getRecordName(record)}
              </List.Item>
            );
          }}
        />
        <Pagination current={currentPage} pageSize={pageSize} total={total} showTotal={value => `共 ${value} 条`} onChange={setPage} />
      </Card>

      <Card title="模型配置">
        <Form
          form={form}
          layout="vertical"
          initialValues={{ carbonEmissionFactor: 0 }}
          onFinish={values => saveMutation.mutate(values)}
        >
          <Form.Item name="modelName" label="模型名称" rules={[{ required: true, message: '请输入模型名称' }]}>
            <Input disabled={selectedRecord !== null} placeholder="请输入模型名称" />
          </Form.Item>
          <Form.Item name="gridPrice" label="电网电价" rules={[{ required: true, message: '请输入电价' }]}>
            <InputNumber min={0} max={999999} addonAfter="元/kWh" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="carbonEmissionFactor" label="碳排放" rules={[{ required: true, message: '请输入碳排放数值' }]}>
            <InputNumber min={0} max={5000} addonAfter="kgCO2/kWh" style={{ width: '100%' }} />
          </Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={saveMutation.isPending}>
              {selectedRecord ? '保存' : '新增'}
            </Button>
            <Button onClick={resetEditor}>取消</Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
}
