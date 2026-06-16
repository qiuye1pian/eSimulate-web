import type { ModelEndpoint } from '@/services/model-config';
import type { ApiRecord } from '@/types/api';

export interface ModelFieldDefinition<TValues extends object> {
  key: keyof TValues & string;
  recordKey: string;
  label: string;
  unit?: string;
  min?: number;
  max?: number;
  defaultValue?: number;
}

export interface ModelDefinition<TValues extends object> {
  key: string;
  title: string;
  endpoint: ModelEndpoint;
  graphUnit?: string;
  graphFields?: (keyof TValues & string)[];
  fields: ModelFieldDefinition<TValues>[];
  buildSavePayload: (id: number | string | null, values: TValues) => object;
  buildGraphPayload?: (values: TValues) => object;
  validate?: (values: TValues) => string | undefined;
  mapRecordToValues: (record: ApiRecord) => TValues;
}
