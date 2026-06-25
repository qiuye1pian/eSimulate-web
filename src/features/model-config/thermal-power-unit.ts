import type { ApiRecord } from '@/types/api';
import type { ModelDefinition } from './types';

export interface ThermalPowerUnitFormValues {
  modelName: string;
  maxPower: number;
  minPower: number;
  startStopCost: number;
  costA: number;
  costB: number;
  costC: number;
  rampUpRate: number;
  rampDownRate: number;
  runningStatus: boolean;
  minStartupTime: number;
  minShutdownTime: number;
  carbonEmissionFactor: number;
  cost: number;
  purchaseCost: number;
}

export function buildThermalPowerUnitSavePayload(id: number | string | null, values: ThermalPowerUnitFormValues) {
  return {
    ...(id === null ? {} : { id }),
    modelName: values.modelName,
    maxPower: values.maxPower,
    minPower: values.minPower,
    startStopCost: values.startStopCost,
    a: values.costA,
    b: values.costB,
    c: values.costC,
    rampUpRate: values.rampUpRate,
    rampDownRate: values.rampDownRate,
    runningStatus: values.runningStatus,
    auxiliaryRate: 5,
    emissionRate: 1,
    minStartupTime: values.minStartupTime,
    minShutdownTime: values.minShutdownTime,
    carbonEmissionFactor: values.carbonEmissionFactor,
    cost: values.cost,
    purchaseCost: values.purchaseCost,
  };
}

export function validateThermalPowerUnitParameters(values: ThermalPowerUnitFormValues) {
  if (values.minPower > values.maxPower) {
    return '最小发电出力必须小于或等于最大发电出力';
  }
  if (values.costA < 0 || values.costA > 10) {
    return '成本函数 a 必须在 0 到 10 之间';
  }
  if (values.costB < 0 || values.costB > 1) {
    return '成本函数 b 必须在 0 到 1 之间';
  }
  if (values.costC < 0 || values.costC > 100) {
    return '成本函数 c 必须在 0 到 100 之间';
  }
  if (values.rampUpRate < 1 || values.rampDownRate < 1) {
    return '爬坡功率必须大于或等于 1';
  }
  return undefined;
}

export const thermalPowerUnitDefinition: ModelDefinition<ThermalPowerUnitFormValues> = {
  key: 'thermal-power-unit',
  title: '火电机组',
  endpoint: 'model/thermal-power-unit',
  fields: [
    { key: 'maxPower', recordKey: 'maxPower', label: '最大发电出力', unit: 'kW', min: 0, max: 99999999, placeholder: '600000' },
    { key: 'minPower', recordKey: 'minPower', label: '最小发电出力', unit: 'kW', min: 0, max: 99999999, placeholder: '200000' },
    { key: 'startStopCost', recordKey: 'startStopCost', label: '起停成本', unit: '元', min: 0, max: 99999999, placeholder: '239000' },
    { key: 'runningStatus', recordKey: 'runningStatus', label: '当前运行状态', control: 'switch', defaultValue: false },
    { key: 'costA', recordKey: 'a', label: '成本函数 a', min: 0, max: 10, placeholder: '0.78' },
    { key: 'costB', recordKey: 'b', label: '成本函数 b', min: 0, max: 1, step: 0.01, control: 'slider-number', defaultValue: 0, placeholder: '0.23' },
    { key: 'costC', recordKey: 'c', label: '成本函数 c', min: 0, max: 100, placeholder: '25.54' },
    { key: 'rampUpRate', recordKey: 'rampUpRate', label: '最大向上爬坡功率', unit: 'kW/h', min: 1, placeholder: '10000' },
    { key: 'rampDownRate', recordKey: 'rampDownRate', label: '最大向下爬坡功率', unit: 'kW/h', min: 1, placeholder: '10000' },
    { key: 'minStartupTime', recordKey: 'minStartupTime', label: '最小连续运行时间', unit: '小时', min: 1, max: 100, step: 1, placeholder: '18' },
    { key: 'minShutdownTime', recordKey: 'minShutdownTime', label: '最小停机时间', unit: '小时', min: 1, max: 100, step: 1, placeholder: '18' },
    { key: 'carbonEmissionFactor', recordKey: 'carbonEmissionFactor', label: '碳排放', unit: 'kgCO2/kWh', min: 0, max: 5000, defaultValue: 0 },
    { key: 'cost', recordKey: 'cost', label: '维护成本', unit: '元/kWh', min: 0, max: 5000, defaultValue: 0, placeholder: '0.100' },
    { key: 'purchaseCost', recordKey: 'purchaseCost', label: '建设成本', unit: '元', min: 0, max: 99999999, defaultValue: 0, placeholder: '10000000' },
  ],
  buildSavePayload: buildThermalPowerUnitSavePayload,
  validate: validateThermalPowerUnitParameters,
  mapRecordToValues: (record: ApiRecord) => ({
    modelName: String(record.modelName ?? ''),
    maxPower: Number(record.maxPower ?? 0),
    minPower: Number(record.minPower ?? 0),
    startStopCost: Number(record.startStopCost ?? 0),
    costA: Number(record.a ?? 0),
    costB: Number(record.b ?? 0),
    costC: Number(record.c ?? 0),
    rampUpRate: Number(record.rampUpRate ?? 0),
    rampDownRate: Number(record.rampDownRate ?? 0),
    runningStatus: Boolean(record.runningStatus ?? false),
    minStartupTime: Number(record.minStartupTime ?? 0),
    minShutdownTime: Number(record.minShutdownTime ?? 0),
    carbonEmissionFactor: Number(record.carbonEmissionFactor ?? 0),
    cost: Number(record.cost ?? 0),
    purchaseCost: Number(record.purchaseCost ?? 0),
  }),
};
