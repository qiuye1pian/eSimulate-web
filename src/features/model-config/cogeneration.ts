import type { ApiRecord } from '@/types/api';
import { MAX_PURCHASE_COST, type ModelDefinition } from './types';

export interface CogenerationFormValues {
  modelName: string;
  minHeatPower: number;
  maxHeatPower: number;
  rampUpRate: number;
  rampDownRate: number;
  electricEfficiency: number;
  heatLossRate: number;
  cop: number;
  flueGasRecoveryRate: number;
  costA: number;
  costB: number;
  costC: number;
  gasLowHeatValue: number;
  carbonEmissionFactor: number;
  cost: number;
  purchaseCost: number;
}

export function buildCogenerationSavePayload(id: number | string | null, values: CogenerationFormValues) {
  return {
    ...(id === null ? {} : { id }),
    modelName: values.modelName,
    PMin: values.minHeatPower,
    PMax: values.maxHeatPower,
    rampUpRate: values.rampUpRate,
    rampDownRate: values.rampDownRate,
    etaElectric: values.electricEfficiency,
    etaLoss: values.heatLossRate,
    COP: values.cop,
    flueGasRecoveryRate: values.flueGasRecoveryRate,
    a: values.costA,
    b: values.costB,
    c: values.costC,
    cv: values.gasLowHeatValue,
    carbonEmissionFactor: values.carbonEmissionFactor,
    cost: values.cost,
    purchaseCost: values.purchaseCost,
  };
}

export function validateCogenerationParameters(values: CogenerationFormValues) {
  if (values.maxHeatPower < values.minHeatPower) {
    return '最大供热功率必须大于或等于最小供热功率';
  }
  if (values.electricEfficiency + values.heatLossRate > 1) {
    return '发电效率和散热损失率之和必须小于或等于 1';
  }
  if (values.rampUpRate < 1 || values.rampDownRate < 1) {
    return '爬坡功率必须大于或等于 1';
  }
  return undefined;
}

export const cogenerationDefinition: ModelDefinition<CogenerationFormValues> = {
  key: 'cogeneration',
  title: '热电联产',
  endpoint: 'model/cogeneration',
  fields: [
    { key: 'minHeatPower', recordKey: 'PMin', label: '最小供热功率', unit: 'kW', min: 1, placeholder: '50' },
    { key: 'maxHeatPower', recordKey: 'PMax', label: '最大供热功率', unit: 'kW', min: 1, placeholder: '200' },
    { key: 'rampUpRate', recordKey: 'rampUpRate', label: '最大向上爬坡功率', unit: 'kW/h', min: 1, placeholder: '10' },
    { key: 'rampDownRate', recordKey: 'rampDownRate', label: '最大向下爬坡功率', unit: 'kW/h', min: 1, placeholder: '10' },
    { key: 'electricEfficiency', recordKey: 'etaElectric', label: '发电效率', min: 0, max: 1, step: 0.01, control: 'slider-number', defaultValue: 0.35, placeholder: '0.35' },
    { key: 'heatLossRate', recordKey: 'etaLoss', label: '散热损失率', min: 0, max: 1, step: 0.01, control: 'slider-number', defaultValue: 0.05, placeholder: '0.05' },
    { key: 'cop', recordKey: 'COP', label: '制热系数', min: 1, max: 3, step: 0.01, control: 'slider-number', defaultValue: 1.2, placeholder: '1.20' },
    { key: 'flueGasRecoveryRate', recordKey: 'flueGasRecoveryRate', label: '烟气回收率', min: 0, max: 1, step: 0.01, control: 'slider-number', defaultValue: 0.6, placeholder: '0.60' },
    { key: 'costA', recordKey: 'a', label: '运行成本系数 a', min: 0, max: 1, step: 0.01, control: 'slider-number', defaultValue: 0, placeholder: '0.00' },
    { key: 'costB', recordKey: 'b', label: '运行成本系数 b', min: 0, max: 50, step: 0.01, control: 'slider-number', defaultValue: 0, placeholder: '0.00' },
    { key: 'costC', recordKey: 'c', label: '运行成本系数 c', min: 0, max: 100, step: 0.01, control: 'slider-number', defaultValue: 0, placeholder: '0.00' },
    { key: 'gasLowHeatValue', recordKey: 'cv', label: '天然气低热值', unit: 'kWh/m³', min: 1, max: 10, defaultValue: 9.7, placeholder: '9.70' },
    { key: 'carbonEmissionFactor', recordKey: 'carbonEmissionFactor', label: '碳排放', unit: 'kgCO2/kWh', min: 0, max: 5000, defaultValue: 0 },
    { key: 'cost', recordKey: 'cost', label: '维护成本', unit: '元/kWh', min: 0, max: 5000, defaultValue: 0, placeholder: '0.100' },
    { key: 'purchaseCost', recordKey: 'purchaseCost', label: '建设成本', unit: '元', min: 0, max: MAX_PURCHASE_COST, defaultValue: 0, placeholder: '8000000' },
  ],
  buildSavePayload: buildCogenerationSavePayload,
  validate: validateCogenerationParameters,
  mapRecordToValues: (record: ApiRecord) => ({
    modelName: String(record.modelName ?? ''),
    minHeatPower: Number(record.PMin ?? 0),
    maxHeatPower: Number(record.PMax ?? 0),
    rampUpRate: Number(record.rampUpRate ?? 0),
    rampDownRate: Number(record.rampDownRate ?? 0),
    electricEfficiency: Number(record.etaElectric ?? 0.35),
    heatLossRate: Number(record.etaLoss ?? 0.05),
    cop: Number(record.COP ?? 1.2),
    flueGasRecoveryRate: Number(record.flueGasRecoveryRate ?? 0.6),
    costA: Number(record.a ?? 0),
    costB: Number(record.b ?? 0),
    costC: Number(record.c ?? 0),
    gasLowHeatValue: Number(record.cv ?? 9.7),
    carbonEmissionFactor: Number(record.carbonEmissionFactor ?? 0),
    cost: Number(record.cost ?? 0),
    purchaseCost: Number(record.purchaseCost ?? 0),
  }),
};
