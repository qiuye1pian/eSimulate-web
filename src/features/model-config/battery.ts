import type { ApiRecord } from '@/types/api';
import type { ModelDefinition } from './types';

export interface BatteryFormValues {
  modelName: string;
  capacity: number;
  initialEnergy: number;
  socMin: number;
  socMax: number;
  selfDischargeRate: number;
  chargePower: number;
  dischargePower: number;
  chargeEfficiency: number;
  dischargeEfficiency: number;
  carbonEmissionFactor: number;
  cost: number;
  purchaseCost: number;
}

export function buildBatterySavePayload(id: number | string | null, values: BatteryFormValues) {
  return {
    ...(id === null ? {} : { id }),
    modelName: values.modelName,
    ct: values.capacity,
    EESSt: values.initialEnergy,
    SOCMin: values.socMin,
    SOCMax: values.socMax,
    mu: values.selfDischargeRate,
    maxChargePower: values.chargePower,
    maxDischargePower: values.dischargePower,
    etaHch: values.chargeEfficiency,
    etaHDis: values.dischargeEfficiency,
    carbonEmissionFactor: values.carbonEmissionFactor,
    cost: values.cost,
    purchaseCost: values.purchaseCost,
  };
}

export function validateBatteryParameters(values: BatteryFormValues) {
  const ratios = [
    values.socMin,
    values.socMax,
    values.selfDischargeRate,
    values.chargeEfficiency,
    values.dischargeEfficiency,
  ];
  if (ratios.some(value => value < 0 || value > 1)) {
    return 'SOC、损失率和效率参数必须在 0 到 1 之间';
  }
  if (values.socMin > values.socMax) {
    return 'SOC 最小值必须小于或等于 SOC 最大值';
  }
  if (values.initialEnergy > values.capacity) {
    return '蓄电池初始电量必须小于或等于总容量';
  }
  if (values.chargePower < values.dischargePower) {
    return '蓄电池充电功率必须大于或等于放电功率';
  }
  return undefined;
}

export const batteryDefinition: ModelDefinition<BatteryFormValues> = {
  key: 'battery',
  title: '电储能',
  endpoint: 'model/battery',
  formula: {
    title: '电储能容量更新',
    description: '聚焦参数时同步标记公式中的对应变量。',
    rows: [
      {
        tokens: [
          { text: 'EESS,t' },
          { text: '=' },
          { text: '(' },
          { text: '1' },
          { text: '-' },
          { text: 'μ', fieldKey: 'selfDischargeRate' },
          { text: ')' },
          { text: 'EESS,t-1' },
          { text: '+' },
          { text: '[' },
          { text: 'PESS,in,t', fieldKey: 'chargePower' },
          { text: 'ηhch', fieldKey: 'chargeEfficiency' },
          { text: '-' },
          { text: 'PESS,dis,t', fieldKey: 'dischargePower' },
          { text: '/ηhdis', fieldKey: 'dischargeEfficiency' },
          { text: ']' },
          { text: '⋅Δt' },
        ],
      },
    ],
  },
  fields: [
    { key: 'capacity', recordKey: 'ct', label: '蓄电池总容量', unit: 'kWh', min: 0, max: 100000 },
    { key: 'initialEnergy', recordKey: 'EESSt', label: '蓄电池初始电量', unit: 'kWh', min: 0, max: 100000 },
    {
      key: 'socMin',
      recordKey: 'SOCMin',
      label: 'SOC 最小值',
      min: 0,
      max: 1,
      step: 0.001,
      control: 'slider-number',
      placeholder: '0.001',
    },
    {
      key: 'socMax',
      recordKey: 'SOCMax',
      label: 'SOC 最大值',
      min: 0,
      max: 1,
      step: 0.001,
      control: 'slider-number',
      placeholder: '0.999',
    },
    {
      key: 'selfDischargeRate',
      recordKey: 'mu',
      label: '自放电损失率',
      min: 0,
      max: 1,
      step: 0.00001,
      control: 'slider-number',
      placeholder: '0.00001',
    },
    { key: 'chargePower', recordKey: 'maxChargePower', label: '蓄电池充电功率', unit: 'kW', min: 0, max: 100000 },
    { key: 'dischargePower', recordKey: 'maxDischargePower', label: '蓄电池放电功率', unit: 'kW', min: 0, max: 100000 },
    {
      key: 'chargeEfficiency',
      recordKey: 'etaHch',
      label: '最大充电效率',
      min: 0,
      max: 1,
      step: 0.001,
      control: 'slider-number',
      placeholder: '0.950',
    },
    {
      key: 'dischargeEfficiency',
      recordKey: 'etaHDis',
      label: '最大放电效率',
      min: 0,
      max: 1,
      step: 0.001,
      control: 'slider-number',
      placeholder: '0.950',
    },
    { key: 'carbonEmissionFactor', recordKey: 'carbonEmissionFactor', label: '碳排放', unit: 'kgCO2/kWh', min: 0, max: 5000, defaultValue: 0 },
    { key: 'cost', recordKey: 'cost', label: '维护成本', unit: '元/kWh', min: 0, max: 5000, defaultValue: 0 },
    { key: 'purchaseCost', recordKey: 'purchaseCost', label: '建设成本', unit: '元', min: 0, max: 99999999, defaultValue: 0 },
  ],
  buildSavePayload: buildBatterySavePayload,
  validate: validateBatteryParameters,
  mapRecordToValues: (record: ApiRecord) => ({
    modelName: String(record.modelName ?? ''),
    capacity: Number(record.ct ?? 0),
    initialEnergy: Number(record.EESSt ?? 0),
    socMin: Number(record.SOCMin ?? 0),
    socMax: Number(record.SOCMax ?? 0),
    selfDischargeRate: Number(record.mu ?? 0),
    chargePower: Number(record.maxChargePower ?? 0),
    dischargePower: Number(record.maxDischargePower ?? 0),
    chargeEfficiency: Number(record.etaHch ?? 0),
    dischargeEfficiency: Number(record.etaHDis ?? 0),
    carbonEmissionFactor: Number(record.carbonEmissionFactor ?? 0),
    cost: Number(record.cost ?? 0),
    purchaseCost: Number(record.purchaseCost ?? 0),
  }),
};
