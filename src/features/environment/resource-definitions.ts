import type { EnvironmentEndpoint } from '@/services/environment';

export type EnvironmentResourceKey =
  | 'electric-load'
  | 'thermal-load'
  | 'grid-pricing'
  | 'wind'
  | 'water-flow'
  | 'sunlight'
  | 'temperature';

export interface EnvironmentResourceDefinition {
  key: EnvironmentResourceKey;
  title: string;
  endpoint: EnvironmentEndpoint;
  searchField: 'schemeName' | 'modelName';
  chartUnit?: string;
  supportsCsvUpload: boolean;
  supportsDownload: boolean;
  supportsCurvePreview: boolean;
}

export const environmentResourceDefinitions: Record<EnvironmentResourceKey, EnvironmentResourceDefinition> = {
  'electric-load': {
    key: 'electric-load',
    title: '电负荷',
    endpoint: 'load/electric-load-schemes',
    searchField: 'schemeName',
    chartUnit: 'kW',
    supportsCsvUpload: true,
    supportsDownload: true,
    supportsCurvePreview: true,
  },
  'thermal-load': {
    key: 'thermal-load',
    title: '热负荷',
    endpoint: 'load/thermal-load-schemes',
    searchField: 'schemeName',
    chartUnit: 'kW',
    supportsCsvUpload: true,
    supportsDownload: true,
    supportsCurvePreview: true,
  },
  'grid-pricing': {
    key: 'grid-pricing',
    title: '电网电价',
    endpoint: 'model/grid',
    searchField: 'modelName',
    chartUnit: '元/kWh',
    supportsCsvUpload: false,
    supportsDownload: false,
    supportsCurvePreview: false,
  },
  wind: {
    key: 'wind',
    title: '风力数据',
    endpoint: 'environment/wind-speed',
    searchField: 'schemeName',
    chartUnit: 'm/s',
    supportsCsvUpload: true,
    supportsDownload: true,
    supportsCurvePreview: true,
  },
  'water-flow': {
    key: 'water-flow',
    title: '水流数据',
    endpoint: 'environment/water-speed',
    searchField: 'schemeName',
    chartUnit: 'm/s',
    supportsCsvUpload: true,
    supportsDownload: true,
    supportsCurvePreview: true,
  },
  sunlight: {
    key: 'sunlight',
    title: '光照数据',
    endpoint: 'environment/sunlight',
    searchField: 'schemeName',
    chartUnit: 'W/m2',
    supportsCsvUpload: true,
    supportsDownload: true,
    supportsCurvePreview: true,
  },
  temperature: {
    key: 'temperature',
    title: '温度数据',
    endpoint: 'environment/temperature',
    searchField: 'schemeName',
    chartUnit: 'C',
    supportsCsvUpload: true,
    supportsDownload: true,
    supportsCurvePreview: true,
  },
};

export function getEnvironmentResourceDefinition(resourceType: string) {
  return environmentResourceDefinitions[resourceType as EnvironmentResourceKey];
}
