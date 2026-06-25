import { calculateHydroEta, calculateHydroHead } from '@/services/model-config';
import type { ApiRecord } from '@/types/api';
import type { ModelDefinition } from './types';

export interface HydropowerFormValues {
  modelName: string;
  totalEfficiency: number;
  turbineEfficiency: number;
  generatorEfficiency: number;
  transmissionEfficiency: number;
  head: number;
  upstreamElevation: number;
  downstreamElevation: number;
  upstreamVelocity: number;
  downstreamVelocity: number;
  upstreamDensity: number;
  downstreamDensity: number;
  specificWeight: number;
  gravity: number;
  carbonEmissionFactor: number;
  cost: number;
  purchaseCost: number;
}

export function buildHydropowerEtaPayload(values: HydropowerFormValues) {
  return {
    eta1: values.turbineEfficiency,
    eta2: values.generatorEfficiency,
    eta3: values.transmissionEfficiency,
  };
}

export function buildHydropowerHeadPayload(values: HydropowerFormValues) {
  return {
    z1: values.upstreamElevation,
    z2: values.downstreamElevation,
    v1: values.upstreamVelocity,
    v2: values.downstreamVelocity,
    p1: values.upstreamDensity,
    p2: values.downstreamDensity,
    pg: values.specificWeight,
    g: values.gravity,
  };
}

export function buildHydropowerSavePayload(id: number | string | null, values: HydropowerFormValues) {
  return {
    ...(id === null ? {} : { id }),
    modelName: values.modelName,
    ...buildHydropowerEtaPayload(values),
    ...buildHydropowerHeadPayload(values),
    carbonEmissionFactor: values.carbonEmissionFactor,
    cost: values.cost,
    purchaseCost: values.purchaseCost,
  };
}

export function validateHydropowerParameters(values: HydropowerFormValues) {
  const efficiencies = [values.turbineEfficiency, values.generatorEfficiency, values.transmissionEfficiency];
  if (efficiencies.some(value => value < 0 || value > 1)) {
    return '效率参数必须在 0 到 1 之间';
  }
  if (values.gravity <= 0 || values.specificWeight <= 0) {
    return '重力加速度和 ρg 必须大于 0';
  }
  return undefined;
}

function valuesAreFinite(values: unknown[]) {
  return values.every(value => Number.isFinite(Number(value)));
}

export const hydropowerDefinition: ModelDefinition<HydropowerFormValues> = {
  key: 'hydropower',
  title: '小水电',
  endpoint: 'model/hydro_power_plant',
  formula: {
    title: '小水电机组配置',
    description: '聚焦参数时同步标记公式中的对应变量。',
    rows: [
      {
        tokens: [
          { text: 'Pₕ' },
          { text: '=' },
          { text: 'η', fieldKey: 'totalEfficiency' },
          { text: '×' },
          { text: 'A' },
          { text: '×' },
          { text: 'H', fieldKey: 'head' },
        ],
      },
      {
        tokens: [
          { text: 'η' },
          { text: '=' },
          { text: 'η1', fieldKey: 'turbineEfficiency' },
          { text: '×' },
          { text: 'η2', fieldKey: 'generatorEfficiency' },
          { text: '×' },
          { text: 'η3', fieldKey: 'transmissionEfficiency' },
        ],
      },
      {
        tokens: [
          { text: 'H' },
          { text: '=' },
          { text: '(' },
          { text: 'z1', fieldKey: 'upstreamElevation' },
          { text: '+' },
          { text: 'ρ1', fieldKey: 'upstreamDensity' },
          { text: '/ρg', fieldKey: 'specificWeight' },
          { text: '+' },
          { text: 'v1²', fieldKey: 'upstreamVelocity' },
          { text: '/2g', fieldKey: 'gravity' },
          { text: ')' },
          { text: '-' },
          { text: '(' },
          { text: 'z2', fieldKey: 'downstreamElevation' },
          { text: '+' },
          { text: 'ρ2', fieldKey: 'downstreamDensity' },
          { text: '/ρg', fieldKey: 'specificWeight' },
          { text: '+' },
          { text: 'v2²', fieldKey: 'downstreamVelocity' },
          { text: '/2g', fieldKey: 'gravity' },
          { text: ')' },
        ],
      },
    ],
  },
  fields: [
    { key: 'totalEfficiency', recordKey: 'eta', label: '水电站总效率', readOnly: true },
    { key: 'turbineEfficiency', recordKey: 'eta1', label: '水轮机效率', min: 0, max: 1, step: 0.01, control: 'slider-number', defaultValue: 0, placeholder: '0.90' },
    { key: 'generatorEfficiency', recordKey: 'eta2', label: '发电机效率', min: 0, max: 1, step: 0.01, control: 'slider-number', defaultValue: 0, placeholder: '0.95' },
    { key: 'transmissionEfficiency', recordKey: 'eta3', label: '机组传动效率', min: 0, max: 1, step: 0.01, control: 'slider-number', defaultValue: 0, placeholder: '0.98' },
    { key: 'head', recordKey: 'head', label: '水头', unit: 'm', readOnly: true },
    { key: 'upstreamElevation', recordKey: 'z1', label: '上游位能 Z1', unit: 'm', min: 1, max: 1000, placeholder: '100' },
    { key: 'downstreamElevation', recordKey: 'z2', label: '下游位能 Z2', unit: 'm', min: 1, max: 1000, placeholder: '90' },
    { key: 'upstreamDensity', recordKey: 'p1', label: '上游水密度 p1', unit: 'kg/m³', min: 900, max: 1100, columnStart: 1, defaultValue: 1000 },
    { key: 'downstreamDensity', recordKey: 'p2', label: '下游水密度 p2', unit: 'kg/m³', min: 900, max: 1100, defaultValue: 1000 },
    { key: 'specificWeight', recordKey: 'pg', label: 'ρg', unit: 'N/m³', min: 9000, max: 11000, defaultValue: 9810 },
    { key: 'gravity', recordKey: 'g', label: '重力加速度 g', unit: 'm/s²', min: 0, max: 10, defaultValue: 9.81 },
    { key: 'upstreamVelocity', recordKey: 'v1', label: '上游平均流速 v1', unit: 'm³/s', min: 0, max: 1000, columnStart: 1, placeholder: '2' },
    { key: 'downstreamVelocity', recordKey: 'v2', label: '下游平均流速 v2', unit: 'm³/s', min: 0, max: 1000, placeholder: '1' },
    { key: 'carbonEmissionFactor', recordKey: 'carbonEmissionFactor', label: '碳排放', unit: 'kgCO2/kWh', min: 0, max: 5000, defaultValue: 0 },
    { key: 'cost', recordKey: 'cost', label: '维护成本', unit: '元/kWh', min: 0, max: 5000, defaultValue: 0, placeholder: '0.030' },
    { key: 'purchaseCost', recordKey: 'purchaseCost', label: '建设成本', unit: '元', min: 0, max: 99999999, defaultValue: 0, placeholder: '200000' },
  ],
  buildSavePayload: buildHydropowerSavePayload,
  validate: validateHydropowerParameters,
  deriveValues: async values => {
    const derived: Partial<HydropowerFormValues> = {};
    const etaPayload = buildHydropowerEtaPayload(values);
    const headPayload = buildHydropowerHeadPayload(values);
    const tasks: Promise<void>[] = [];

    if (valuesAreFinite(Object.values(etaPayload))) {
      tasks.push(calculateHydroEta(etaPayload).then(response => {
        derived.totalEfficiency = Number(response.data);
      }));
    }
    if (valuesAreFinite(Object.values(headPayload)) && values.gravity > 0 && values.specificWeight > 0) {
      tasks.push(calculateHydroHead(headPayload).then(response => {
        derived.head = Number(response.data);
      }));
    }

    await Promise.all(tasks);
    return derived;
  },
  mapRecordToValues: (record: ApiRecord) => ({
    modelName: String(record.modelName ?? ''),
    totalEfficiency: Number(record.eta ?? 0),
    turbineEfficiency: Number(record.eta1 ?? 0),
    generatorEfficiency: Number(record.eta2 ?? 0),
    transmissionEfficiency: Number(record.eta3 ?? 0),
    head: Number(record.head ?? 0),
    upstreamElevation: Number(record.z1 ?? 0),
    downstreamElevation: Number(record.z2 ?? 0),
    upstreamVelocity: Number(record.v1 ?? 0),
    downstreamVelocity: Number(record.v2 ?? 0),
    upstreamDensity: Number(record.p1 ?? 1000),
    downstreamDensity: Number(record.p2 ?? 1000),
    specificWeight: Number(record.pg ?? 9810),
    gravity: Number(record.g ?? 9.81),
    carbonEmissionFactor: Number(record.carbonEmissionFactor ?? 0),
    cost: Number(record.cost ?? 0),
    purchaseCost: Number(record.purchaseCost ?? 0),
  }),
};
