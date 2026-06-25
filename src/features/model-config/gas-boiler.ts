import type { ApiRecord } from '@/types/api';
import type { ModelDefinition } from './types';

export interface GasBoilerFormValues {
  modelName: string;
  combustionEfficiency: number;
  gasEnergyDensity: number;
  carbonEmissionFactor: number;
  cost: number;
  purchaseCost: number;
}

export function buildGasBoilerSavePayload(id: number | string | null, values: GasBoilerFormValues) {
  return {
    ...(id === null ? {} : { id }),
    modelName: values.modelName,
    etaGB: values.combustionEfficiency,
    gasEnergyDensity: values.gasEnergyDensity,
    carbonEmissionFactor: values.carbonEmissionFactor,
    cost: values.cost,
    purchaseCost: values.purchaseCost,
  };
}

export function validateGasBoilerParameters(values: GasBoilerFormValues) {
  if (values.combustionEfficiency < 0 || values.combustionEfficiency > 1) {
    return '燃烧效率必须在 0 到 1 之间';
  }
  if (values.gasEnergyDensity < 8 || values.gasEnergyDensity > 12) {
    return '天然气热值必须在 8 到 12 kWh/m³ 之间';
  }
  return undefined;
}

export const gasBoilerDefinition: ModelDefinition<GasBoilerFormValues> = {
  key: 'gas-boiler',
  title: '燃气锅炉',
  endpoint: 'model/gas-boiler',
  fields: [
    {
      key: 'combustionEfficiency',
      recordKey: 'etaGB',
      label: '燃烧效率',
      min: 0,
      max: 1,
      step: 0.01,
      control: 'slider-number',
      placeholder: '0.90',
    },
    {
      key: 'gasEnergyDensity',
      recordKey: 'gasEnergyDensity',
      label: '天然气热值',
      unit: 'kWh/m³',
      min: 8,
      max: 12,
      step: 0.01,
      placeholder: '10.00',
      help: {
        title: '天然气典型热值范围',
        rows: [
          { label: '低热值 LHV', range: '31-38 MJ/m³', converted: '8.61-10.57 kWh/m³' },
          { label: '高热值 HHV', range: '35-42 MJ/m³', converted: '9.72-11.67 kWh/m³' },
        ],
      },
    },
    { key: 'carbonEmissionFactor', recordKey: 'carbonEmissionFactor', label: '碳排放', unit: 'kgCO2/kWh', min: 0, max: 5000, defaultValue: 0 },
    { key: 'cost', recordKey: 'cost', label: '维护成本', unit: '元/kWh', min: 0, max: 5000, defaultValue: 0, placeholder: '0.120' },
    { key: 'purchaseCost', recordKey: 'purchaseCost', label: '建设成本', unit: '元', min: 0, max: 99999999, defaultValue: 0, placeholder: '200000' },
  ],
  buildSavePayload: buildGasBoilerSavePayload,
  validate: validateGasBoilerParameters,
  mapRecordToValues: (record: ApiRecord) => ({
    modelName: String(record.modelName ?? ''),
    combustionEfficiency: Number(record.etaGB ?? 0),
    gasEnergyDensity: Number(record.gasEnergyDensity ?? 0),
    carbonEmissionFactor: Number(record.carbonEmissionFactor ?? 0),
    cost: Number(record.cost ?? 0),
    purchaseCost: Number(record.purchaseCost ?? 0),
  }),
};
