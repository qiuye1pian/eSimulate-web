import type { ApiRecord } from '@/types/api';
import type { ModelDefinition } from './types';

export interface WindPowerFormValues {
  modelName: string;
  ratedPower: number;
  cutInSpeed: number;
  ratedSpeed: number;
  cutOutSpeed: number;
  carbonEmissionFactor: number;
  cost: number;
  purchaseCost: number;
}

export function buildWindPowerSavePayload(id: number | string | null, values: WindPowerFormValues) {
  return {
    ...(id === null ? {} : { id }),
    modelName: values.modelName,
    P_r: values.ratedPower,
    v_in: values.cutInSpeed,
    v_n: values.ratedSpeed,
    v_out: values.cutOutSpeed,
    carbonEmissionFactor: values.carbonEmissionFactor,
    cost: values.cost,
    purchaseCost: values.purchaseCost,
  };
}

export function buildWindPowerGraphPayload(values: WindPowerFormValues) {
  return {
    P_r: values.ratedPower,
    v_in: values.cutInSpeed,
    v_n: values.ratedSpeed,
    v_out: values.cutOutSpeed,
  };
}

export function validateWindSpeedOrder(values: WindPowerFormValues) {
  if (values.cutInSpeed > values.ratedSpeed) {
    return '切入风速必须小于或等于额定风速';
  }
  if (values.ratedSpeed > values.cutOutSpeed) {
    return '切出风速必须大于或等于额定风速';
  }
  return undefined;
}

export const windPowerDefinition: ModelDefinition<WindPowerFormValues> = {
  key: 'wind-power',
  title: '风电',
  endpoint: 'model/wind-power',
  graphUnit: 'kWh',
  graphFields: ['ratedPower', 'cutInSpeed', 'ratedSpeed', 'cutOutSpeed'],
  fields: [
    { key: 'ratedPower', recordKey: 'p_r', label: '额定功率', unit: 'kW', min: 0, max: 5000, placeholder: '1000' },
    { key: 'cutInSpeed', recordKey: 'v_in', label: '切入风速', unit: 'm/s', min: 0, max: 5000, placeholder: '3' },
    { key: 'ratedSpeed', recordKey: 'v_n', label: '额定风速', unit: 'm/s', min: 0, max: 5000, placeholder: '12' },
    { key: 'cutOutSpeed', recordKey: 'v_out', label: '切出风速', unit: 'm/s', min: 0, max: 5000, placeholder: '25' },
    {
      key: 'carbonEmissionFactor',
      recordKey: 'carbonEmissionFactor',
      label: '碳排放',
      unit: 'kgCO2/kWh',
      min: 0,
      max: 5000,
      defaultValue: 0,
    },
    { key: 'cost', recordKey: 'cost', label: '维护成本', unit: '元/kWh', min: 0, max: 5000, defaultValue: 0, placeholder: '0.100' },
    { key: 'purchaseCost', recordKey: 'purchaseCost', label: '建设成本', unit: '元', min: 0, max: 99999999, defaultValue: 0, placeholder: '5000000' },
  ],
  buildSavePayload: buildWindPowerSavePayload,
  buildGraphPayload: buildWindPowerGraphPayload,
  validate: validateWindSpeedOrder,
  mapRecordToValues: (record: ApiRecord) => ({
    modelName: String(record.modelName ?? ''),
    ratedPower: Number(record.p_r ?? 0),
    cutInSpeed: Number(record.v_in ?? 0),
    ratedSpeed: Number(record.v_n ?? 0),
    cutOutSpeed: Number(record.v_out ?? 0),
    carbonEmissionFactor: Number(record.carbonEmissionFactor ?? 0),
    cost: Number(record.cost ?? 0),
    purchaseCost: Number(record.purchaseCost ?? 0),
  }),
};
