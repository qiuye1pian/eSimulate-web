import type { ApiRecord } from '@/types/api';
import type { ModelDefinition } from './types';

export interface SolarPowerFormValues {
  modelName: string;
  ratedPower: number;
  referenceTemperature: number;
  temperatureCoefficient: number;
  referenceIrradiance: number;
  carbonEmissionFactor: number;
  cost: number;
  purchaseCost: number;
}

export function buildSolarPowerSavePayload(id: number | string | null, values: SolarPowerFormValues) {
  return {
    ...(id === null ? {} : { id }),
    modelName: values.modelName,
    ppvN: values.ratedPower,
    tref: values.referenceTemperature,
    te: values.temperatureCoefficient,
    gref: values.referenceIrradiance,
    carbonEmissionFactor: values.carbonEmissionFactor,
    cost: values.cost,
    purchaseCost: values.purchaseCost,
  };
}

export function buildSolarPowerGraphPayload(values: SolarPowerFormValues) {
  return {
    ppvN: values.ratedPower,
    tref: values.referenceTemperature,
    te: values.temperatureCoefficient,
    gref: values.referenceIrradiance,
  };
}

export function validateSolarPowerParameters(values: SolarPowerFormValues) {
  if (values.temperatureCoefficient > 0) {
    return '环境温度系数必须小于或等于 0';
  }
  if (values.referenceIrradiance <= 0) {
    return '标准辐照强度必须大于 0';
  }
  return undefined;
}

export const solarPowerDefinition: ModelDefinition<SolarPowerFormValues> = {
  key: 'solar-power',
  title: '光伏',
  endpoint: 'model/solar-power',
  graphType: 'solar-3d',
  graphUnit: 'kW',
  graphFields: ['ratedPower', 'referenceTemperature', 'temperatureCoefficient', 'referenceIrradiance'],
  fields: [
    { key: 'ratedPower', recordKey: 'ppvN', label: '额定功率', unit: 'kW', min: 1, max: 99999, placeholder: '100' },
    {
      key: 'referenceTemperature',
      recordKey: 'tref',
      label: '标准环境温度',
      unit: '℃',
      min: -50,
      max: 50,
      defaultValue: 25,
      placeholder: '25',
    },
    {
      key: 'temperatureCoefficient',
      recordKey: 'te',
      label: '环境温度系数',
      unit: '-1 到 0',
      min: -1,
      max: 0,
      defaultValue: -0.0045,
      placeholder: '-0.0045',
    },
    {
      key: 'referenceIrradiance',
      recordKey: 'gref',
      label: '标准辐照强度',
      unit: 'W/m²',
      min: 0,
      max: 4000,
      defaultValue: 1000,
      placeholder: '1000',
    },
    {
      key: 'carbonEmissionFactor',
      recordKey: 'carbonEmissionFactor',
      label: '碳排放',
      unit: 'kgCO2/kWh',
      min: 0,
      max: 5000,
      defaultValue: 0,
    },
    { key: 'cost', recordKey: 'cost', label: '维护成本', unit: '元/kWh', min: 0, max: 5000, defaultValue: 0, placeholder: '0.020' },
    { key: 'purchaseCost', recordKey: 'purchaseCost', label: '建设成本', unit: '元', min: 0, max: 99999999, defaultValue: 0, placeholder: '120000' },
  ],
  buildSavePayload: buildSolarPowerSavePayload,
  buildGraphPayload: buildSolarPowerGraphPayload,
  validate: validateSolarPowerParameters,
  mapRecordToValues: (record: ApiRecord) => ({
    modelName: String(record.modelName ?? ''),
    ratedPower: Number(record.ppvN ?? 0),
    referenceTemperature: Number(record.tref ?? 25),
    temperatureCoefficient: Number(record.te ?? -0.0045),
    referenceIrradiance: Number(record.gref ?? 1000),
    carbonEmissionFactor: Number(record.carbonEmissionFactor ?? 0),
    cost: Number(record.cost ?? 0),
    purchaseCost: Number(record.purchaseCost ?? 0),
  }),
};
