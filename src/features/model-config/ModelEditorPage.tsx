import { useEffect, useRef, useState } from 'react';
import { DeleteOutlined, PlusOutlined, ReloadOutlined, SaveOutlined, SearchOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { App, Button, Form, Input, InputNumber, List, Pagination, Space, Tag } from 'antd';
import { addModel, deleteModel, getModelList, showModelGraph } from '@/services/model-config';
import type { ApiRecord } from '@/types/api';
import { CurvePreview } from '@/features/environment/CurvePreview';
import { FormulaPanel } from './FormulaPanel';
import type { ModelDefinition } from './types';

interface ModelEditorPageProps<TValues extends object> {
  definition: ModelDefinition<TValues>;
}

function getRecordId(record: ApiRecord) {
  return record.id as number | string | undefined;
}

const sharedFieldOrder = ['cost', 'purchaseCost', 'carbonEmissionFactor'];

export function ModelEditorPage<TValues extends object>({ definition }: ModelEditorPageProps<TValues>) {
  const { message, modal } = App.useApp();
  const [form] = Form.useForm<TValues & { modelName: string }>();
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [keyword, setKeyword] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<ApiRecord | null>(null);
  const [graphData, setGraphData] = useState<unknown>();
  const [isDirty, setIsDirty] = useState(false);
  const [activeFormulaField, setActiveFormulaField] = useState<keyof TValues & string>();
  const graphTimer = useRef<number>();
  const deriveTimer = useRef<number>();

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
    if (deriveTimer.current) {
      window.clearTimeout(deriveTimer.current);
    }
  }, []);

  const resetEditor = () => {
    setSelectedRecord(null);
    setGraphData(undefined);
    setIsDirty(false);
    setActiveFormulaField(undefined);
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
    setIsDirty(false);
    form.setFieldsValue(values as TValues & { modelName: string });
    if (definition.buildGraphPayload) {
      graphMutation.mutate(values);
    }
  };

  const handleSelect = (record: ApiRecord) => {
    if (isDirty) {
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
  const technicalFields = definition.fields.filter(field => !sharedFieldOrder.includes(field.key));
  const sharedFields = sharedFieldOrder.flatMap(key => definition.fields.filter(field => field.key === key));
  const hasVisualPanel = definition.buildGraphPayload || definition.formula;
  const compactFormulaPanel = definition.formula && !definition.buildGraphPayload;

  return (
    <div className="model-workspace">
      <aside className="model-workspace__catalog">
        <div className="model-panel-heading">
          <div>
            <span className="model-panel-heading__eyebrow">MODEL CATALOG</span>
            <h2>{definition.title}模型</h2>
          </div>
          <Tag bordered={false}>{total} 个</Tag>
        </div>

        <Space.Compact className="model-catalog-search" block>
          <Input
            allowClear
            value={searchText}
            prefix={<SearchOutlined />}
            placeholder="搜索模型名称"
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
          locale={{ emptyText: '暂无模型记录' }}
          renderItem={record => {
            const id = getRecordId(record);
            const selected = selectedRecord && getRecordId(selectedRecord) === id;
            return (
              <List.Item
                className={selected ? 'model-editor-list__selected' : undefined}
                actions={[
                  <Button
                    key="delete"
                    aria-label={`删除${String(record.modelName ?? '模型')}`}
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
                    <strong>{String(record.modelName ?? '-')}</strong>
                    <span>{selected ? '当前编辑' : '点击查看参数'}</span>
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

      <main className={`model-workspace__main${compactFormulaPanel ? ' model-workspace__main--formula' : ''}`}>
        {hasVisualPanel ? (
          <section className={`model-workspace__visual${definition.buildGraphPayload ? ' model-workspace__chart' : ' model-workspace__formula'}`}>
            {definition.buildGraphPayload ? (
              <>
                <div className="model-panel-heading model-panel-heading--inline">
                  <div>
                    <span className="model-panel-heading__eyebrow">OUTPUT CURVE</span>
                    <h2>{selectedRecord ? String(selectedRecord.modelName) : `${definition.title}模型出力`}</h2>
                  </div>
                  <Button
                    icon={<ReloadOutlined />}
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
                </div>
                <CurvePreview data={graphData} loading={graphMutation.isPending} type={definition.graphType} unit={definition.graphUnit} />
              </>
            ) : definition.formula ? (
              <FormulaPanel formula={definition.formula} activeField={activeFormulaField} />
            ) : null}
          </section>
        ) : null}

        <section className="model-workspace__parameters">
          <Form
            form={form}
            layout="vertical"
            initialValues={initialValues}
            onFinish={values => handleFinish(values as TValues)}
            onValuesChange={(_, allValues) => {
              setIsDirty(true);
              if (definition.deriveValues) {
                if (deriveTimer.current) {
                  window.clearTimeout(deriveTimer.current);
                }
                deriveTimer.current = window.setTimeout(() => {
                  definition.deriveValues?.(allValues as TValues)
                    .then(values => form.setFieldsValue(values as TValues & { modelName: string }))
                    .catch(error => message.error(error instanceof Error ? error.message : '计算派生参数失败'));
                }, 600);
              }
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
            <div className="model-panel-heading model-panel-heading--inline">
              <div>
                <span className="model-panel-heading__eyebrow">PARAMETERS</span>
                <div className="model-panel-heading__context">
                  <Tag color={selectedRecord ? 'processing' : 'success'}>
                    {selectedRecord
                      ? `${String(selectedRecord.modelName ?? definition.title)}模型参数`
                      : `创建${definition.title}模型`}
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
                  {selectedRecord ? '保存修改' : '新增模型'}
                </Button>
                <Button onClick={resetEditor}>重置</Button>
              </div>
            </div>
            <div className="model-parameter-section">
              <div className="model-parameter-section__heading">
                <strong>基础信息</strong>
                <span>用于识别和管理模型</span>
              </div>
              <div className="model-parameter-grid model-parameter-grid--identity">
                <Form.Item
                  name="modelName"
                  label="模型名称"
                  rules={[{ required: true, message: '请输入模型名称' }]}
                >
                  <Input disabled={selectedRecord !== null} placeholder="请输入模型名称" />
                </Form.Item>
              </div>
            </div>

            {technicalFields.length ? (
              <div className="model-parameter-section">
                <div className="model-parameter-section__heading">
                  <strong>技术参数</strong>
                  <span>{definition.title}模型的运行与出力特性</span>
                </div>
                <div className="model-parameter-grid">
                  {technicalFields.map(field => (
                    <Form.Item
                      key={field.key}
                      name={field.key as never}
                      label={field.label}
                      rules={[{ required: !field.readOnly, message: `请输入${field.label}` }]}
                    >
                      <InputNumber
                        disabled={field.readOnly}
                        min={field.min}
                        max={field.max}
                        suffix={field.unit}
                        style={{ width: '100%' }}
                        onFocus={() => setActiveFormulaField(field.key)}
                      />
                    </Form.Item>
                  ))}
                </div>
              </div>
            ) : null}

            {sharedFields.length ? (
              <div className="model-parameter-section model-parameter-section--shared">
                <div className="model-parameter-section__heading">
                  <strong>经济与环境</strong>
                  <span>跨模型保持一致的成本与排放参数</span>
                </div>
                <div className="model-parameter-grid">
                  {sharedFields.map(field => (
                    <Form.Item
                      key={field.key}
                      name={field.key as never}
                      label={field.label}
                      rules={[{ required: !field.readOnly, message: `请输入${field.label}` }]}
                    >
                      <InputNumber
                        disabled={field.readOnly}
                        min={field.min}
                        max={field.max}
                        suffix={field.unit}
                        style={{ width: '100%' }}
                        onFocus={() => setActiveFormulaField(field.key)}
                      />
                    </Form.Item>
                  ))}
                </div>
              </div>
            ) : null}
          </Form>
        </section>
      </main>
    </div>
  );
}
