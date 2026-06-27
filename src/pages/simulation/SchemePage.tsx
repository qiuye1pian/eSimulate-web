import { useMemo, useRef, useState } from 'react';
import { PlayCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { App, Button, Card, Collapse, Empty, InputNumber, Space, Tag } from 'antd';
import { simulate } from '@/services/simulation';
import type { ApiRecord } from '@/types/api';
import { SimulationResultPanel } from '@/features/simulation/SimulationCharts';
import { SimulationSelector } from '@/features/simulation/SimulationSelector';
import {
  buildSimulationRequest,
  getQuantityKey,
  getRecordDisplayName,
  getRecordId,
  normalizeSimulationResult,
  simulationEnvironmentDefinitions,
  simulationLoadDefinitions,
  simulationModelDefinitions,
  type NormalizedSimulationResult,
  type SimulationEnvironmentKey,
  type SimulationLoadKey,
  type SimulationModelKey,
  type SimulationSelectionState,
} from '@/features/simulation/simulation-utils';

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

export function SchemePage() {
  const { message } = App.useApp();
  const [selectionState, setSelectionState] = useState<SimulationSelectionState>(() => createInitialSelectionState());
  const [result, setResult] = useState<NormalizedSimulationResult>();
  const [activeKeys, setActiveKeys] = useState<string[]>(['loads', 'models', 'environments', 'configuration']);
  const resultSectionRef = useRef<HTMLDivElement | null>(null);
  const selectedCount = useMemo(() => getSelectedCount(selectionState), [selectionState]);

  const revealResults = () => {
    setActiveKeys(prev => Array.from(new Set([...prev, 'results'])));
    window.setTimeout(() => {
      resultSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const simulationMutation = useMutation({
    mutationFn: () => simulate(buildSimulationRequest(selectionState)),
    onSuccess: (response) => {
      const normalized = normalizeSimulationResult(response.data);
      setResult(normalized);
      revealResults();
      if (normalized.resultType === 'FAILED') {
        message.warning(normalized.message || '仿真失败');
        return;
      }
      message.success('仿真完成');
    },
    onError: error => message.error(error instanceof Error ? error.message : '仿真提交失败'),
  });

  const updateLoads = (key: SimulationLoadKey, records: ApiRecord[]) => {
    setSelectionState(prev => ({
      ...prev,
      loads: { ...prev.loads, [key]: records },
    }));
  };

  const updateEnvironments = (key: SimulationEnvironmentKey, records: ApiRecord[]) => {
    setSelectionState(prev => ({
      ...prev,
      environments: { ...prev.environments, [key]: records },
    }));
  };

  const updateModels = (key: SimulationModelKey, records: ApiRecord[]) => {
    setSelectionState(prev => {
      const nextQuantities = { ...prev.quantities };
      const selectedIds = new Set(records.map(record => getRecordId(record)).filter(id => id !== undefined));
      Object.keys(nextQuantities).forEach((quantityKey) => {
        if (quantityKey.startsWith(`${key}:`)) {
          const id = quantityKey.slice(key.length + 1);
          if (!selectedIds.has(id) && !selectedIds.has(Number(id))) {
            delete nextQuantities[quantityKey];
          }
        }
      });
      return {
        ...prev,
        models: { ...prev.models, [key]: records },
        quantities: nextQuantities,
      };
    });
  };

  const updateQuantity = (key: SimulationModelKey, recordId: number | string, quantity: number | null) => {
    setSelectionState(prev => ({
      ...prev,
      quantities: {
        ...prev.quantities,
        [getQuantityKey(key, recordId)]: quantity ?? 0,
      },
    }));
  };

  const handleSimulate = () => {
    const request = buildSimulationRequest(selectionState);
    if (!request.loadDtoList.length) {
      message.warning('请至少选择一条负荷数据');
      return;
    }
    if (!request.modelDtoList.length) {
      message.warning('请至少选择一个模型');
      return;
    }
    if (!request.environmentDtoList.length) {
      message.warning('请至少选择一条环境数据');
      return;
    }
    simulationMutation.mutate();
  };

  const quantityRows = simulationModelDefinitions.flatMap(definition =>
    (selectionState.models[definition.key] ?? []).map(record => ({ definition, record })));

  return (
    <section className="simulation-page">
      <div className="simulation-page__header">
        <div>
          <h1 className="page-shell__title">方案仿真</h1>
          <p className="page-shell__description">选择负荷、模型与环境，配置模型数量后运行仿真。</p>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => {
            setSelectionState(createInitialSelectionState());
            setResult(undefined);
            setActiveKeys(['loads', 'models', 'environments', 'configuration']);
          }}
        >
          重置
        </Button>
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
            label: '仿真配置',
            children: (
              <div>
                <div className="simulation-configuration-toolbar">
                  <Space wrap>
                    <Tag bordered={false}>负荷 {selectedCount.loadCount}</Tag>
                    <Tag bordered={false}>模型 {selectedCount.modelCount}</Tag>
                    <Tag bordered={false}>环境 {selectedCount.environmentCount}</Tag>
                  </Space>
                  <Button
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    loading={simulationMutation.isPending}
                    onClick={handleSimulate}
                  >
                    开始仿真
                  </Button>
                </div>
                <div className="simulation-configuration">
                  {quantityRows.length ? quantityRows.map(({ definition, record }) => {
                    const id = getRecordId(record);
                    const quantityKey = id === undefined ? undefined : getQuantityKey(definition.key, id);
                    return (
                      <Card size="small" key={`${definition.key}-${String(id)}`}>
                        <div className="simulation-quantity-row">
                          <div>
                            <Tag bordered={false}>{definition.title}</Tag>
                            <strong>{getRecordDisplayName(record)}</strong>
                          </div>
                          {definition.requiresQuantity && id !== undefined ? (
                            <InputNumber
                              min={1}
                              max={99999}
                              value={selectionState.quantities[quantityKey as string]}
                              placeholder="数量"
                              addonAfter="台"
                              onChange={value => updateQuantity(definition.key, id, value)}
                            />
                          ) : (
                            <span className="simulation-quantity-row__readonly">无需配置数量</span>
                          )}
                        </div>
                      </Card>
                    );
                  }) : <Empty description="选择模型后配置数量" />}
                </div>
              </div>
            ),
          },
          {
            key: 'results',
            label: '仿真结果',
            children: (
              <div ref={resultSectionRef}>
                <SimulationResultPanel result={result} />
              </div>
            ),
          },
        ]}
      />
    </section>
  );
}
