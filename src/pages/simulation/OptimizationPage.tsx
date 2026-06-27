import { useEffect, useMemo, useRef, useState } from 'react';
import { PauseCircleOutlined, PlayCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { App, Button, Card, Collapse, Empty, InputNumber, Progress, Space, Table, Tag, Tooltip } from 'antd';
import {
  cancelOptimizationTask,
  getOptimizationResult,
  getOptimizationTaskState,
  optimize,
} from '@/services/simulation';
import type { ApiRecord } from '@/types/api';
import { SimulationSelector } from '@/features/simulation/SimulationSelector';
import {
  getQuantityKey,
  getRecordDisplayName,
  getRecordId,
  simulationEnvironmentDefinitions,
  simulationLoadDefinitions,
  simulationModelDefinitions,
  type SimulationEnvironmentKey,
  type SimulationLoadKey,
  type SimulationModelKey,
  type SimulationSelectionState,
} from '@/features/simulation/simulation-utils';
import {
  buildOptimizationRequest,
  defaultOptimizationParameters,
  normalizeOptimizationResult,
  type OptimizationBoundsState,
  type OptimizationParameters,
  type OptimizationTable,
} from '@/features/simulation/optimization-utils';

function createInitialSelectionState(): SimulationSelectionState {
  return {
    loads: {},
    environments: {},
    models: {},
    quantities: {},
  };
}

function getSelectedCount(state: SimulationSelectionState) {
  const loadCount = Object.values(state.loads).reduce((sum, records) => sum + (records?.length ?? 0), 0);
  const environmentCount = Object.values(state.environments).reduce((sum, records) => sum + (records?.length ?? 0), 0);
  const modelCount = Object.values(state.models).reduce((sum, records) => sum + (records?.length ?? 0), 0);
  return { loadCount, environmentCount, modelCount };
}

const parameterFields: Array<{ key: keyof OptimizationParameters; label: string; min: number; max: number; step?: number; unit?: string }> = [
  { key: 'particleCount', label: '粒子个数', min: 1, max: 999, step: 1 },
  { key: 'maxIterations', label: '最大迭代次数', min: 1, max: 9999, step: 1 },
  { key: 'inertiaWeightStart', label: '惯性权重初值', min: 0, max: 5, step: 0.1 },
  { key: 'inertiaWeightEnd', label: '惯性权重终值', min: 0, max: 5, step: 0.1 },
  { key: 'c1Start', label: '自我学习因子初值', min: 0, max: 5, step: 0.1 },
  { key: 'c1End', label: '自我学习因子终值', min: 0, max: 5, step: 0.1 },
  { key: 'c2Start', label: '群体学习因子初值', min: 0, max: 5, step: 0.1 },
  { key: 'c2End', label: '群体学习因子终值', min: 0, max: 5, step: 0.1 },
  { key: 'maxCurtailmentRate', label: '最大弃风弃光率', min: 0, max: 100, step: 1, unit: '%' },
  { key: 'minRenewableEnergyShare', label: '最小可再生能源占比', min: 0, max: 100, step: 1, unit: '%' },
];

export function OptimizationPage() {
  const { message } = App.useApp();
  const [selectionState, setSelectionState] = useState<SimulationSelectionState>(() => createInitialSelectionState());
  const [bounds, setBounds] = useState<OptimizationBoundsState>({});
  const [parameters, setParameters] = useState<OptimizationParameters>(defaultOptimizationParameters);
  const [activeKeys, setActiveKeys] = useState<string[]>(['loads', 'models', 'environments', 'configuration']);
  const [taskId, setTaskId] = useState<string>();
  const [taskStatus, setTaskStatus] = useState<string>('未开始');
  const [currentIteration, setCurrentIteration] = useState(0);
  const [totalIterations, setTotalIterations] = useState(0);
  const [resultTable, setResultTable] = useState<OptimizationTable>();
  const pollTimer = useRef<number>();
  const resultSectionRef = useRef<HTMLDivElement | null>(null);
  const selectedCount = useMemo(() => getSelectedCount(selectionState), [selectionState]);

  useEffect(() => () => {
    if (pollTimer.current) {
      window.clearTimeout(pollTimer.current);
    }
  }, []);

  const revealResults = () => {
    setActiveKeys(prev => Array.from(new Set([...prev, 'results'])));
    window.setTimeout(() => resultSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  };

  const updateLoads = (key: SimulationLoadKey, records: ApiRecord[]) => {
    setSelectionState(prev => ({ ...prev, loads: { ...prev.loads, [key]: records } }));
  };

  const updateEnvironments = (key: SimulationEnvironmentKey, records: ApiRecord[]) => {
    setSelectionState(prev => ({ ...prev, environments: { ...prev.environments, [key]: records } }));
  };

  const updateModels = (key: SimulationModelKey, records: ApiRecord[]) => {
    setSelectionState(prev => {
      const nextBounds = { ...bounds };
      const selectedIds = new Set(records.map(record => getRecordId(record)).filter(id => id !== undefined));
      Object.keys(nextBounds).forEach((boundKey) => {
        if (boundKey.startsWith(`${key}:`)) {
          const id = boundKey.slice(key.length + 1);
          if (!selectedIds.has(id) && !selectedIds.has(Number(id))) {
            delete nextBounds[boundKey];
          }
        }
      });
      setBounds(nextBounds);
      return { ...prev, models: { ...prev.models, [key]: records } };
    });
  };

  const updateBound = (key: SimulationModelKey, recordId: number | string, field: 'lowerBound' | 'upperBound', value: number | null) => {
    const boundKey = getQuantityKey(key, recordId);
    setBounds(prev => ({
      ...prev,
      [boundKey]: {
        lowerBound: prev[boundKey]?.lowerBound ?? 1,
        upperBound: prev[boundKey]?.upperBound ?? 50,
        [field]: value ?? (field === 'lowerBound' ? 1 : 50),
      },
    }));
  };

  const updateParameter = (key: keyof OptimizationParameters, value: number | null) => {
    setParameters(prev => ({ ...prev, [key]: value ?? defaultOptimizationParameters[key] }));
  };

  const resultMutation = useMutation({
    mutationFn: (id: string) => getOptimizationResult(id),
    onSuccess: (response) => {
      setResultTable(normalizeOptimizationResult(response.data));
      setTaskStatus('COMPLETED');
      revealResults();
      message.success('寻优完成');
    },
    onError: error => message.error(error instanceof Error ? error.message : '获取寻优结果失败'),
  });

  const pollTaskState = (id: string) => {
    pollTimer.current = window.setTimeout(async () => {
      try {
        const response = await getOptimizationTaskState(id);
        const state = response.data;
        setTaskStatus(state.taskState);
        setCurrentIteration(state.currentIteration ?? 0);
        setTotalIterations(state.totalIterations ?? parameters.maxIterations);
        if (state.taskState === 'COMPLETED') {
          resultMutation.mutate(id);
          return;
        }
        if (state.taskState === 'FAILED' || state.taskState === 'CANCELLED') {
          revealResults();
          return;
        }
        pollTaskState(id);
      } catch (error) {
        message.error(error instanceof Error ? error.message : '获取任务状态失败');
      }
    }, 3000);
  };

  const optimizeMutation = useMutation({
    mutationFn: () => optimize(buildOptimizationRequest(selectionState, bounds, parameters)),
    onSuccess: (response) => {
      const nextTaskId = String(response.data.taskId);
      setTaskId(nextTaskId);
      setTaskStatus('PENDING');
      setCurrentIteration(0);
      setTotalIterations(parameters.maxIterations);
      setResultTable(undefined);
      pollTaskState(nextTaskId);
      message.success('寻优任务已提交');
    },
    onError: error => message.error(error instanceof Error ? error.message : '寻优提交失败'),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => cancelOptimizationTask(id),
    onSuccess: () => {
      if (pollTimer.current) {
        window.clearTimeout(pollTimer.current);
      }
      setTaskStatus('CANCELLED');
      message.success('已取消寻优任务');
    },
    onError: error => message.error(error instanceof Error ? error.message : '取消任务失败'),
  });

  const handleOptimize = () => {
    const request = buildOptimizationRequest(selectionState, bounds, parameters);
    if (!request.loadDtoList.length) {
      message.warning('请至少选择一条负荷数据');
      return;
    }
    if (!request.modelDimensionDtoList.length) {
      message.warning('请至少选择一个模型');
      return;
    }
    if (!request.environmentDtoList.length) {
      message.warning('请至少选择一条环境数据');
      return;
    }
    optimizeMutation.mutate();
  };

  const resetPage = () => {
    if (pollTimer.current) {
      window.clearTimeout(pollTimer.current);
    }
    setSelectionState(createInitialSelectionState());
    setBounds({});
    setParameters(defaultOptimizationParameters);
    setTaskId(undefined);
    setTaskStatus('未开始');
    setCurrentIteration(0);
    setTotalIterations(0);
    setResultTable(undefined);
    setActiveKeys(['loads', 'models', 'environments', 'configuration']);
  };

  const dimensionRows = simulationModelDefinitions.flatMap(definition =>
    (selectionState.models[definition.key] ?? []).map(record => ({ definition, record })));
  const progressPercent = totalIterations > 0 ? Math.min(100, Math.round((currentIteration / totalIterations) * 100)) : 0;
  const running = optimizeMutation.isPending || taskStatus === 'PENDING' || taskStatus === 'IN_PROGRESS';

  return (
    <section className="optimization-page">
      <div className="simulation-page__header">
        <div>
          <h1 className="page-shell__title">寻优计算</h1>
          <p className="page-shell__description">配置设备数量边界和 PSO 参数，提交任务后自动轮询并展示结果。</p>
        </div>
        <Button icon={<ReloadOutlined />} onClick={resetPage}>重置</Button>
      </div>

      <Collapse
        className="simulation-flow"
        activeKey={activeKeys}
        onChange={keys => setActiveKeys(Array.isArray(keys) ? keys : [keys])}
        items={[
          {
            key: 'loads',
            label: '负荷',
            children: (
              <div className="simulation-selector-grid simulation-selector-grid--compact">
                {simulationLoadDefinitions.map(definition => (
                  <SimulationSelector
                    key={definition.key}
                    definition={definition}
                    selectedRecords={selectionState.loads[definition.key] ?? []}
                    onChange={records => updateLoads(definition.key, records)}
                  />
                ))}
              </div>
            ),
          },
          {
            key: 'models',
            label: '模型配置',
            children: (
              <div className="simulation-selector-grid">
                {simulationModelDefinitions.map(definition => (
                  <SimulationSelector
                    key={definition.key}
                    definition={definition}
                    selectedRecords={selectionState.models[definition.key] ?? []}
                    onChange={records => updateModels(definition.key, records)}
                  />
                ))}
              </div>
            ),
          },
          {
            key: 'environments',
            label: '环境配置',
            children: (
              <div className="simulation-selector-grid simulation-selector-grid--environment">
                {simulationEnvironmentDefinitions.map(definition => (
                  <SimulationSelector
                    key={definition.key}
                    definition={definition}
                    selectedRecords={selectionState.environments[definition.key] ?? []}
                    onChange={records => updateEnvironments(definition.key, records)}
                  />
                ))}
              </div>
            ),
          },
          {
            key: 'configuration',
            label: '寻优配置',
            children: (
              <div className="optimization-configuration">
                <div className="simulation-configuration-toolbar">
                  <Space wrap>
                    <Tag bordered={false}>负荷 {selectedCount.loadCount}</Tag>
                    <Tag bordered={false}>模型 {selectedCount.modelCount}</Tag>
                    <Tag bordered={false}>环境 {selectedCount.environmentCount}</Tag>
                    <Tag color={running ? 'processing' : undefined}>状态 {taskStatus}</Tag>
                  </Space>
                  <Space>
                    {taskId && running ? (
                      <Button
                        danger
                        icon={<PauseCircleOutlined />}
                        loading={cancelMutation.isPending}
                        onClick={() => cancelMutation.mutate(taskId)}
                      >
                        取消任务
                      </Button>
                    ) : null}
                    <Button
                      type="primary"
                      icon={<PlayCircleOutlined />}
                      loading={optimizeMutation.isPending}
                      disabled={running}
                      onClick={handleOptimize}
                    >
                      开始寻优
                    </Button>
                  </Space>
                </div>

                {running || currentIteration > 0 ? (
                  <Card size="small">
                    <Progress percent={progressPercent} />
                    <div className="optimization-task-meta">迭代进度：{currentIteration} / {totalIterations || parameters.maxIterations}</div>
                  </Card>
                ) : null}

                <div className="optimization-section">
                  <div className="model-parameter-section__heading">
                    <strong>模型数量边界</strong>
                    <span>每个参与寻优的模型需要配置数量下界和上界</span>
                  </div>
                  <div className="simulation-configuration">
                    {dimensionRows.length ? dimensionRows.map(({ definition, record }) => {
                      const id = getRecordId(record);
                      const boundKey = id === undefined ? undefined : getQuantityKey(definition.key, id);
                      const currentBound = boundKey ? bounds[boundKey] : undefined;
                      return (
                        <Card size="small" key={`${definition.key}-${String(id)}`}>
                          <div className="simulation-quantity-row">
                            <div>
                              <Tag bordered={false}>{definition.title}</Tag>
                              <strong>{getRecordDisplayName(record)}</strong>
                            </div>
                            {definition.requiresQuantity && id !== undefined ? (
                              <Space.Compact>
                                <InputNumber
                                  min={1}
                                  max={99999}
                                  value={currentBound?.lowerBound ?? 1}
                                  placeholder="下界"
                                  onChange={value => updateBound(definition.key, id, 'lowerBound', value)}
                                />
                                <InputNumber
                                  min={1}
                                  max={99999}
                                  value={currentBound?.upperBound ?? 50}
                                  placeholder="上界"
                                  onChange={value => updateBound(definition.key, id, 'upperBound', value)}
                                />
                              </Space.Compact>
                            ) : (
                              <span className="simulation-quantity-row__readonly">固定参与</span>
                            )}
                          </div>
                        </Card>
                      );
                    }) : <Empty description="选择模型后配置边界" />}
                  </div>
                </div>

                <div className="optimization-section">
                  <div className="model-parameter-section__heading">
                    <strong>PSO 参数与约束</strong>
                    <span>用于控制粒子群搜索过程和结果约束</span>
                  </div>
                  <div className="optimization-parameter-grid">
                    {parameterFields.map(field => (
                      <label className="optimization-parameter" key={field.key}>
                        <span>{field.label}</span>
                        <InputNumber
                          min={field.min}
                          max={field.max}
                          step={field.step}
                          value={parameters[field.key]}
                          addonAfter={field.unit}
                          onChange={value => updateParameter(field.key, value)}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            ),
          },
          {
            key: 'results',
            label: '寻优结果',
            children: (
              <div ref={resultSectionRef}>
                {resultTable ? (
                  <Table
                    size="small"
                    scroll={{ x: 'max-content' }}
                    columns={resultTable.columns.map(column => ({
                      title: column.title,
                      dataIndex: column.key,
                      key: column.key,
                      render: (value: unknown, record: ApiRecord) => {
                        if (column.title === '约束') {
                          return value === false ? (
                            <Tooltip title={String(record.constraintMessage ?? '')}>
                              <span className="optimization-result-invalid">不满足</span>
                            </Tooltip>
                          ) : <span className="optimization-result-valid">满足</span>;
                        }
                        return String(value ?? '-');
                      },
                    }))}
                    dataSource={resultTable.rows}
                    pagination={{ pageSize: 10 }}
                  />
                ) : (
                  <Empty description={taskStatus === '未开始' ? '开始寻优后展示结果' : `当前任务状态：${taskStatus}`} />
                )}
              </div>
            ),
          },
        ]}
      />
    </section>
  );
}
