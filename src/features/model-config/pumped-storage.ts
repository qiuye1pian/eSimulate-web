import type { ApiRecord } from '@/types/api';
import { MAX_PURCHASE_COST, type ModelDefinition } from './types';

export interface PumpedStorageFormValues {
  modelName: string;
  maxPower: number;
  maxEnergy: number;
  chargeEfficiency: number;
  dischargeEfficiency: number;
  stateOfCharge: number;
  carbonEmissionFactor: number;
  cost: number;
  purchaseCost: number;
}

export function buildPumpedStorageSavePayload(id: number | string | null, values: PumpedStorageFormValues) {
  return {
    ...(id === null ? {} : { id }),
    modelName: values.modelName,
    PMax: values.maxPower,
    EMax: values.maxEnergy,
    etaCh: values.chargeEfficiency,
    etaDis: values.dischargeEfficiency,
    lambda: 1,
    stateOfCharge: values.stateOfCharge,
    carbonEmissionFactor: values.carbonEmissionFactor,
    cost: values.cost,
    purchaseCost: values.purchaseCost,
  };
}

export function validatePumpedStorageParameters(values: PumpedStorageFormValues) {
  if (values.maxEnergy < values.stateOfCharge) {
    return '上游水库最大储能容量必须大于或等于当前水库储能';
  }
  if (values.chargeEfficiency < 0 || values.chargeEfficiency > 1 || values.dischargeEfficiency < 0 || values.dischargeEfficiency > 1) {
    return '效率参数必须在 0 到 1 之间';
  }
  return undefined;
}

export const pumpedStorageDefinition: ModelDefinition<PumpedStorageFormValues> = {
  key: 'pumped-storage',
  title: '抽水蓄能',
  endpoint: 'model/pumped-storage',
  fields: [
    { key: 'maxPower', recordKey: 'PMax', label: '放水（发电）功率', unit: 'kWh', min: 1, placeholder: '1000' },
    { key: 'maxEnergy', recordKey: 'EMax', label: '上游水库最大储能容量', unit: 'kWh', min: 1, placeholder: '10000' },
    { key: 'chargeEfficiency', recordKey: 'etaCh', label: '抽水（蓄能）效率', min: 0, max: 1, step: 0.01, control: 'slider-number', defaultValue: 0, placeholder: '0.80' },
    { key: 'dischargeEfficiency', recordKey: 'etaDis', label: '放水（发电）效率', min: 0, max: 1, step: 0.01, control: 'slider-number', defaultValue: 0, placeholder: '0.80' },
    { key: 'stateOfCharge', recordKey: 'stateOfCharge', label: '当前水库储能', unit: 'kWh', min: 1, placeholder: '5000' },
    { key: 'carbonEmissionFactor', recordKey: 'carbonEmissionFactor', label: '碳排放', unit: 'kgCO2/kWh', min: 0, max: 5000, defaultValue: 0 },
    { key: 'cost', recordKey: 'cost', label: '维护成本', unit: '元/kWh', min: 0, max: 5000, defaultValue: 0, placeholder: '0.070' },
    { key: 'purchaseCost', recordKey: 'purchaseCost', label: '建设成本', unit: '元', min: 0, max: MAX_PURCHASE_COST, defaultValue: 0, placeholder: '7000000' },
  ],
  buildSavePayload: buildPumpedStorageSavePayload,
  validate: validatePumpedStorageParameters,
  mapRecordToValues: (record: ApiRecord) => ({
    modelName: String(record.modelName ?? ''),
    maxPower: Number(record.PMax ?? 0),
    maxEnergy: Number(record.EMax ?? 0),
    chargeEfficiency: Number(record.etaCh ?? 0),
    dischargeEfficiency: Number(record.etaDis ?? 0),
    stateOfCharge: Number(record.stateOfCharge ?? 0),
    carbonEmissionFactor: Number(record.carbonEmissionFactor ?? 0),
    cost: Number(record.cost ?? 0),
    purchaseCost: Number(record.purchaseCost ?? 0),
  }),
};
