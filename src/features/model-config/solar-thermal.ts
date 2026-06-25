import type { ApiRecord } from '@/types/api';
import type { ModelDefinition } from './types';

export interface SolarThermalFormValues {
  modelName: string;
  conversionEfficiency: number;
  collectorArea: number;
  carbonEmissionFactor: number;
  cost: number;
  purchaseCost: number;
}

export function buildSolarThermalSavePayload(id: number | string | null, values: SolarThermalFormValues) {
  return {
    ...(id === null ? {} : { id }),
    modelName: values.modelName,
    etaSF: values.conversionEfficiency,
    SSF: values.collectorArea,
    carbonEmissionFactor: values.carbonEmissionFactor,
    cost: values.cost,
    purchaseCost: values.purchaseCost,
  };
}

export function validateSolarThermalParameters(values: SolarThermalFormValues) {
  if (values.conversionEfficiency < 0 || values.conversionEfficiency > 1) {
    return '光热转换效率必须在 0 到 1 之间';
  }
  if (values.collectorArea <= 0) {
    return '太阳集热器采光面积必须大于 0';
  }
  return undefined;
}

export const solarThermalDefinition: ModelDefinition<SolarThermalFormValues> = {
  key: 'solar-thermal',
  title: '太阳能集热',
  endpoint: 'model/thermal-power',
  fields: [
    {
      key: 'conversionEfficiency',
      recordKey: 'etaSF',
      label: '光热转换效率',
      min: 0,
      max: 1,
      step: 0.01,
      control: 'slider-number',
      placeholder: '0.75',
    },
    {
      key: 'collectorArea',
      recordKey: 'SSF',
      label: '太阳集热器采光面积',
      unit: '㎡',
      min: 0,
      max: 5000,
      placeholder: '500',
    },
    { key: 'carbonEmissionFactor', recordKey: 'carbonEmissionFactor', label: '碳排放', unit: 'kgCO2/kWh', min: 0, max: 5000, defaultValue: 0 },
    { key: 'cost', recordKey: 'cost', label: '维护成本', unit: '元/kWh', min: 0, max: 5000, defaultValue: 0, placeholder: '0.040' },
    { key: 'purchaseCost', recordKey: 'purchaseCost', label: '建设成本', unit: '元', min: 0, max: 99999999, defaultValue: 0, placeholder: '300000' },
  ],
  buildSavePayload: buildSolarThermalSavePayload,
  validate: validateSolarThermalParameters,
  mapRecordToValues: (record: ApiRecord) => ({
    modelName: String(record.modelName ?? ''),
    conversionEfficiency: Number(record.etaSF ?? 0),
    collectorArea: Number(record.SSF ?? 0),
    carbonEmissionFactor: Number(record.carbonEmissionFactor ?? 0),
    cost: Number(record.cost ?? 0),
    purchaseCost: Number(record.purchaseCost ?? 0),
  }),
};
