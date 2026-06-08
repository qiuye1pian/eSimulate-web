import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { App, Button, Card, Form, Input, InputNumber, List, Pagination, Space } from 'antd';
import { addModel, deleteModel, getModelList, showModelGraph } from '@/services/model-config';
import type { ApiRecord } from '@/types/api';
import { CurvePreview } from '@/features/environment/CurvePreview';
import type { ModelDefinition } from './types';

interface ModelEditorPageProps<TValues extends object> {
  definition: ModelDefinition<TValues>;
}

function getRecordId(record: ApiRecord) {
  return record.id as number | string | undefined;
}

export function ModelEditorPage<TValues extends object>({ definition }: ModelEditorPageProps<TValues>) {
  const { message, modal } = App.useApp();
  const [form] = Form.useForm<TValues & { modelName: string }>();
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [keyword, setKeyword] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<ApiRecord | null>(null);
  const [graphData, setGraphData] = useState<ApiRecord>();
  const graphTimer = useRef<number>();

  const initialValues = Object.fromEntries(
    definition.fields.filter(field => field.defaultValue !== undefined).map(field => [field.key, field.defaultValue]),
  ) as Partial<TValues>;

  const listQuery = useQuery({
    queryKey: ['model-list', definition.key, page, keyword],
    queryFn: () => getModelList(definition.endpoint, { page, size: 10, modelName: keyword || undefined }),
  });

  const graphMutation = useMutation({
    mutationFn: (values: TValues) => showModelGraph(definition.endpoint, definition.buildGraphPayload?.(values) ?? {}),
    onSuccess: response => setGraphData(response.data),
    onError: error => message.error(error instanceof Error ? error.message : '获取模型出力图失败'),
  });

  useEffect(() => () => {
    if (graphTimer.current) {
      window.clearTimeout(graphTimer.current);
    }
  }, []);

  const resetEditor = () => {
    setSelectedRecord(null);
    setGraphData(undefined);
    form.resetFields();
  };

  const saveMutation = useMutation({
    mutationFn: (values: TValues) =>
      addModel(definition.endpoint, definition.buildSavePayload(selectedRecord ? getRecordId(selectedRecord) ?? null : null, values)),
    onSuccess: () => {
      message.success(selectedRecord ? `保存${definition.title}模型成功` : `添加${definition.title}模型成功`);
      resetEditor();
      listQuery.refetch();
    },
    onError: error => message.error(error instanceof Error ? error.message : '保存失败'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number | string) => deleteModel(definition.endpoint, id),
    onSuccess: () => {
      message.success('删除成功');
      resetEditor();
      listQuery.refetch();
    },
    onError: error => message.error(error instanceof Error ? error.message : '删除失败'),
  });

  const applyRecord = (record: ApiRecord) => {
    const values = definition.mapRecordToValues(record);
    setSelectedRecord(record);
    form.setFieldsValue(values as TValues & { modelName: string });
    if (definition.buildGraphPayload) {
      graphMutation.mutate(values);
    }
  };

  const handleSelect = (record: ApiRecord) => {
    if (form.isFieldsTouched()) {
      modal.confirm({
        title: '忽略未保存的数据吗？',
        content: '点击确定后，未保存的数据将丢失。',
        okText: '确定',
        cancelText: '取消',
        onOk: () => applyRecord(record),
      });
      return;
    }
    applyRecord(record);
  };

  const handleFinish = (values: TValues) => {
    const validationMessage = definition.validate?.(values);
    if (validationMessage) {
      message.warning(validationMessage);
      return;
    }
    saveMutation.mutate(values);
  };

  const records = listQuery.data?.data.list ?? [];
  const total = listQuery.data?.data.total ?? 0;
  const currentPage = listQuery.data?.data.page ?? page;
  const pageSize = listQuery.data?.data.size ?? 10;

  return (
    <div className="model-editor-layout">
      <Card title={`${definition.title}模型管理`}>
        <Space.Compact block>
          <Input
            allowClear
            value={searchText}
            placeholder="请输入模型名称"
            onChange={event => setSearchText(event.target.value)}
            onPressEnter={() => {
              setPage(1);
              setKeyword(searchText.trim());
            }}
          />
          <Button type="primary" onClick={() => { setPage(1); setKeyword(searchText.trim()); }}>搜索</Button>
        </Space.Compact>
        <List
          className="model-editor-list"
          loading={listQuery.isLoading || deleteMutation.isPending}
          dataSource={records}
          renderItem={record => {
            const id = getRecordId(record);
            return (
              <List.Item
                className={selectedRecord && getRecordId(selectedRecord) === id ? 'model-editor-list__selected' : undefined}
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
                {String(record.modelName ?? '-')}
              </List.Item>
            );
          }}
        />
        <Pagination current={currentPage} pageSize={pageSize} total={total} showTotal={value => `共 ${value} 条`} onChange={setPage} />
      </Card>

      <Card title={`${definition.title}模型配置`}>
        <Form
          form={form}
          layout="vertical"
          initialValues={initialValues}
          onFinish={values => handleFinish(values as TValues)}
          onValuesChange={(_, allValues) => {
            if (!definition.buildGraphPayload || !definition.graphFields) {
              return;
            }
            if (graphTimer.current) {
              window.clearTimeout(graphTimer.current);
            }
            const values = allValues as TValues;
            const graphValuesComplete = definition.graphFields.every(field => Number.isFinite(Number(values[field])));
            if (!graphValuesComplete || definition.validate?.(values)) {
              return;
            }
            graphTimer.current = window.setTimeout(() => graphMutation.mutate(values), 3000);
          }}
        >
          <Form.Item name="modelName" label="模型名称" rules={[{ required: true, message: '请输入模型名称' }]}>
            <Input disabled={selectedRecord !== null} placeholder="请输入模型名称" />
          </Form.Item>
          {definition.fields.map(field => (
            <Form.Item
              key={field.key}
              name={field.key as never}
              label={field.label}
              rules={[{ required: true, message: `请输入${field.label}` }]}
            >
              <InputNumber min={field.min} max={field.max} addonAfter={field.unit} style={{ width: '100%' }} />
            </Form.Item>
          ))}
          <Space>
            <Button type="primary" htmlType="submit" loading={saveMutation.isPending}>
              {selectedRecord ? '保存' : '新增'}
            </Button>
            <Button onClick={resetEditor}>取消</Button>
          </Space>
        </Form>
      </Card>

      {definition.buildGraphPayload ? (
        <Card title={`${definition.title}模型出力图`}>
          <Button
            style={{ marginBottom: 12 }}
            loading={graphMutation.isPending}
            onClick={async () => {
              const values = await form.validateFields();
              const validationMessage = definition.validate?.(values as TValues);
              if (validationMessage) {
                message.warning(validationMessage);
                return;
              }
              graphMutation.mutate(values as TValues);
            }}
          >
            刷新曲线
          </Button>
          <CurvePreview data={graphData} loading={graphMutation.isPending} unit={definition.graphUnit} />
        </Card>
      ) : null}
    </div>
  );
}
