import { useState } from 'react';
import { DeleteOutlined, PlusOutlined, SaveOutlined, SearchOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { App, Button, Form, Input, InputNumber, List, Pagination, Space, Tag } from 'antd';
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
      message.success(selectedRecord ? '保存电网电价成功' : '添加电网电价成功');
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
    <div className="resource-workspace">
      <aside className="resource-workspace__catalog">
        <div className="model-panel-heading">
          <div>
            <span className="model-panel-heading__eyebrow">RESOURCE CATALOG</span>
            <h2>电价方案</h2>
          </div>
          <Tag bordered={false}>{total} 条</Tag>
        </div>

        <Space.Compact className="model-catalog-search" block>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            value={searchText}
            placeholder="搜索方案名称"
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
          className="resource-catalog-list"
          loading={listQuery.isLoading || deleteMutation.isPending}
          dataSource={records}
          locale={{ emptyText: '暂无电价方案' }}
          renderItem={record => {
            const id = getRecordId(record);
            const selected = selectedRecord && getRecordId(selectedRecord) === id;
            const name = getRecordName(record);
            return (
              <List.Item
                className={selected ? 'resource-catalog-list__selected' : undefined}
                actions={[
                  <Button
                    key="delete"
                    aria-label={`删除${name}`}
                    danger
                    type="text"
                    icon={<DeleteOutlined />}
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
                  />,
                ]}
                onClick={() => handleSelect(record)}
              >
                <div className="model-catalog-item">
                  <span className="model-catalog-item__status" />
                  <div>
                    <strong>{name}</strong>
                    <span>{selected ? '正在编辑' : '点击编辑电价'}</span>
                  </div>
                </div>
              </List.Item>
            );
          }}
        />

        <div className="model-catalog-footer">
          {total > 0 ? (
            <Pagination
              simple
              current={currentPage}
              pageSize={pageSize}
              total={total}
              onChange={setPage}
            />
          ) : <span />}
          <span>共 {total} 条记录</span>
        </div>
      </aside>

      <main className="resource-workspace__main">
        <Form
          form={form}
          layout="vertical"
          initialValues={{ carbonEmissionFactor: 0 }}
          onFinish={values => saveMutation.mutate(values)}
        >
          <div className="model-panel-heading model-panel-heading--inline">
            <div>
              <span className="model-panel-heading__eyebrow">PRICING CONFIG</span>
              <h2>电价配置</h2>
              <div className="model-panel-heading__context">
                <Tag color={selectedRecord ? 'processing' : 'success'}>
                  {selectedRecord ? `${getRecordName(selectedRecord)}电价参数` : '创建电价方案'}
                </Tag>
              </div>
            </div>
            <div className="model-panel-heading__actions">
              <Button
                type="primary"
                htmlType="submit"
                loading={saveMutation.isPending}
                icon={selectedRecord ? <SaveOutlined /> : <PlusOutlined />}
              >
                {selectedRecord ? '保存修改' : '新增方案'}
              </Button>
              <Button onClick={resetEditor}>重置</Button>
            </div>
          </div>

          <div className="model-parameter-section">
            <div className="model-parameter-section__heading">
              <strong>基础信息</strong>
              <span>用于识别和管理电价方案</span>
            </div>
            <div className="model-parameter-grid model-parameter-grid--identity">
              <Form.Item name="modelName" label="方案名称" rules={[{ required: true, message: '请输入方案名称' }]}>
                <Input disabled={selectedRecord !== null} placeholder="请输入方案名称" />
              </Form.Item>
            </div>
          </div>

          <div className="model-parameter-section">
            <div className="model-parameter-section__heading">
              <strong>价格与排放</strong>
              <span>购电电价和对应碳排放因子</span>
            </div>
            <div className="model-parameter-grid">
              <Form.Item name="gridPrice" label="电网电价" rules={[{ required: true, message: '请输入电价' }]}>
                <InputNumber min={0} max={999999} addonAfter="元/kWh" style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="carbonEmissionFactor" label="碳排放" rules={[{ required: true, message: '请输入碳排放数值' }]}>
                <InputNumber min={0} max={5000} addonAfter="kgCO2/kWh" style={{ width: '100%' }} />
              </Form.Item>
            </div>
          </div>
        </Form>
      </main>
    </div>
  );
}
