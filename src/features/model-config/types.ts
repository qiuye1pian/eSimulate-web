import type { ModelEndpoint } from '@/services/model-config';
import type { ApiRecord } from '@/types/api';

export interface ModelFieldDefinition<TValues extends object> {
  key: keyof TValues & string;
  recordKey: string;
  label: string;
  control?: 'number' | 'slider-number';
  unit?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  columnStart?: number;
  defaultValue?: number;
  readOnly?: boolean;
}

export interface ModelFormulaToken<TValues extends object = Record<string, unknown>> {
  text: string;
  fieldKey?: keyof TValues & string;
  className?: string;
}

export interface ModelFormulaRow<TValues extends object = Record<string, unknown>> {
  tokens: ModelFormulaToken<TValues>[];
}

export interface ModelFormulaDefinition<TValues extends object = Record<string, unknown>> {
  title: string;
  description?: string;
  rows: ModelFormulaRow<TValues>[];
}

export interface ModelDefinition<TValues extends object> {
  key: string;
  title: string;
  endpoint: ModelEndpoint;
  graphUnit?: string;
  graphType?: 'line' | 'solar-3d';
  graphFields?: (keyof TValues & string)[];
  formula?: ModelFormulaDefinition<TValues>;
  fields: ModelFieldDefinition<TValues>[];
  buildSavePayload: (id: number | string | null, values: TValues) => object;
  buildGraphPayload?: (values: TValues) => object;
  deriveValues?: (values: TValues) => Promise<Partial<TValues>>;
  validate?: (values: TValues) => string | undefined;
  mapRecordToValues: (record: ApiRecord) => TValues;
}
