import type { ApiRecord } from '@/types/api';
import { MAX_PURCHASE_COST, type ModelDefinition } from './types';

export interface ThermalStorageFormValues {
  modelName: string;
  totalStorageCapacity: number;
  currentStorage: number;
  thermalLossRate: number;
  chargingEfficiency: number;
  dischargingEfficiency: number;
  carbonEmissionFactor: number;
  cost: number;
  purchaseCost: number;
}

export function buildThermalStorageSavePayload(id: number | string | null, values: ThermalStorageFormValues) {
  return {
    ...(id === null ? {} : { id }),
    modelName: values.modelName,
    totalStorageCapacity: values.totalStorageCapacity,
    currentStorage: values.currentStorage,
    thermalLossRate: values.thermalLossRate,
    chargingEfficiency: values.chargingEfficiency,
    dischargingEfficiency: values.dischargingEfficiency,
    carbonEmissionFactor: values.carbonEmissionFactor,
    cost: values.cost,
    purchaseCost: values.purchaseCost,
  };
}

export function validateThermalStorageParameters(values: ThermalStorageFormValues) {
  const ratios = [
    values.thermalLossRate,
    values.chargingEfficiency,
    values.dischargingEfficiency,
  ];
  if (ratios.some(value => value < 0 || value > 1)) {
    return '热损失率和效率参数必须在 0 到 1 之间';
  }
  if (values.currentStorage > values.totalStorageCapacity) {
    return '当前热储容量必须小于或等于总热储能容量';
  }
  return undefined;
}

export const thermalStorageDefinition: ModelDefinition<ThermalStorageFormValues> = {
  key: 'thermal-storage',
  title: '热储能',
  endpoint: 'model/thermal-saver',
  formula: {
    title: '热储能容量更新',
    description: '聚焦参数时同步标记公式中的对应变量。',
    rows: [
      {
        tokens: [
          { text: 'HHS(t)' },
          { text: '=' },
          { text: '(' },
          { text: '1' },
          { text: '-' },
          { text: 'μ', fieldKey: 'thermalLossRate' },
          { text: ')' },
          { text: 'HHS(t-1)' },
          { text: '+' },
          { text: '[' },
          { text: 'QHS_ch(t)' },
          { text: 'ηhch', fieldKey: 'chargingEfficiency' },
          { text: '-' },
          { text: 'QHS_dis(t)' },
          { text: '/ηhdis', fieldKey: 'dischargingEfficiency' },
          { text: ']' },
          { text: '⋅Δt' },
        ],
      },
    ],
  },
  fields: [
    { key: 'totalStorageCapacity', recordKey: 'totalStorageCapacity', label: '总热储能容量', unit: 'kWh', min: 0, max: 100000, placeholder: '10000' },
    { key: 'currentStorage', recordKey: 'currentStorage', label: '当前热储容量', unit: 'kWh', min: 0, max: 100000, placeholder: '5000' },
    { key: 'thermalLossRate', recordKey: 'thermalLossRate', label: '热损失率', min: 0, max: 1, step: 0.01, control: 'slider-number', defaultValue: 0, placeholder: '0.01' },
    { key: 'chargingEfficiency', recordKey: 'chargingEfficiency', label: '储热效率', min: 0, max: 1, step: 0.01, control: 'slider-number', defaultValue: 0, placeholder: '0.90' },
    { key: 'dischargingEfficiency', recordKey: 'dischargingEfficiency', label: '放热效率', min: 0, max: 1, step: 0.01, control: 'slider-number', defaultValue: 0, placeholder: '0.90' },
    { key: 'carbonEmissionFactor', recordKey: 'carbonEmissionFactor', label: '碳排放', unit: 'kgCO2/kWh', min: 0, max: 5000, defaultValue: 0 },
    { key: 'cost', recordKey: 'cost', label: '维护成本', unit: '元/kWh', min: 0, max: 99_999_999, defaultValue: 0, placeholder: '0.070' },
    { key: 'purchaseCost', recordKey: 'purchaseCost', label: '建设成本', unit: '元', min: 0, max: MAX_PURCHASE_COST, defaultValue: 0, placeholder: '7000000' },
  ],
  buildSavePayload: buildThermalStorageSavePayload,
  validate: validateThermalStorageParameters,
  mapRecordToValues: (record: ApiRecord) => ({
    modelName: String(record.modelName ?? ''),
    totalStorageCapacity: Number(record.totalStorageCapacity ?? 0),
    currentStorage: Number(record.currentStorage ?? 0),
    thermalLossRate: Number(record.thermalLossRate ?? 0),
    chargingEfficiency: Number(record.chargingEfficiency ?? 0),
    dischargingEfficiency: Number(record.dischargingEfficiency ?? 0),
    carbonEmissionFactor: Number(record.carbonEmissionFactor ?? 0),
    cost: Number(record.cost ?? 0),
    purchaseCost: Number(record.purchaseCost ?? 0),
  }),
};
