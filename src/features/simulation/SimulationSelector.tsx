import { useMemo, useState } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Checkbox, Input, List, Pagination, Space, Tag } from 'antd';
import { getResourceList, type EnvironmentEndpoint } from '@/services/environment';
import { getModelList, type ModelEndpoint } from '@/services/model-config';
import type { ApiRecord } from '@/types/api';
import {
  getRecordDisplayName,
  getRecordId,
  type SimulationEnvironmentDefinition,
  type SimulationLoadDefinition,
  type SimulationModelDefinition,
} from './simulation-utils';

type SelectorDefinition = SimulationLoadDefinition | SimulationEnvironmentDefinition | SimulationModelDefinition;

interface SimulationSelectorProps {
  definition: SelectorDefinition;
  selectedRecords: ApiRecord[];
  onChange: (records: ApiRecord[]) => void;
}

function isModelDefinition(definition: SelectorDefinition): definition is SimulationModelDefinition {
  return 'requiresQuantity' in definition;
}

export function SimulationSelector({ definition, selectedRecords, onChange }: SimulationSelectorProps) {
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [keyword, setKeyword] = useState('');

  const listQuery = useQuery({
    queryKey: ['simulation-selector', definition.key, page, keyword],
    queryFn: () => {
      const query = {
        page,
        size: 8,
        [definition.searchField]: keyword || undefined,
      };
      if (isModelDefinition(definition) && definition.key !== 'grid-pricing') {
        return getModelList(definition.endpoint as ModelEndpoint, query);
      }
      return getResourceList(definition.endpoint as EnvironmentEndpoint, query);
    },
  });

  const selectedIds = useMemo(
    () => new Set(selectedRecords.map(record => getRecordId(record)).filter(id => id !== undefined)),
    [selectedRecords],
  );
  const rows = listQuery.data?.data.list ?? [];
  const total = listQuery.data?.data.total ?? 0;
  const currentPage = listQuery.data?.data.page ?? page;
  const pageSize = listQuery.data?.data.size ?? 8;

  const toggleRecord = (record: ApiRecord, checked: boolean) => {
    const id = getRecordId(record);
    if (id === undefined) {
      return;
    }
    if (checked) {
      const exists = selectedRecords.some(item => getRecordId(item) === id);
      onChange(exists ? selectedRecords : [...selectedRecords, record]);
      return;
    }
    onChange(selectedRecords.filter(item => getRecordId(item) !== id));
  };

  return (
    <section className="simulation-selector">
      <div className="simulation-selector__heading">
        <div>
          <strong>{definition.title}</strong>
          <span>{selectedRecords.length ? `已选 ${selectedRecords.length} 项` : '未选择'}</span>
        </div>
        <Tag bordered={false}>{total} 条</Tag>
      </div>

      <Space.Compact block className="simulation-selector__search">
        <Input
          allowClear
          value={searchText}
          prefix={<SearchOutlined />}
          placeholder={`搜索${definition.title}`}
          onChange={event => setSearchText(event.target.value)}
          onPressEnter={() => {
            setPage(1);
            setKeyword(searchText.trim());
          }}
        />
      </Space.Compact>

      <List
        className="simulation-selector__list"
        loading={listQuery.isLoading}
        dataSource={rows}
        locale={{ emptyText: '暂无可选数据' }}
        renderItem={(record) => {
          const id = getRecordId(record);
          const checked = id !== undefined && selectedIds.has(id);
          return (
            <List.Item onClick={() => toggleRecord(record, !checked)}>
              <Checkbox checked={checked} disabled={id === undefined}>
                <div className="simulation-selector__record">
                  <strong>{getRecordDisplayName(record)}</strong>
                </div>
              </Checkbox>
            </List.Item>
          );
        }}
      />

      <div className="simulation-selector__footer">
        {total > 0 ? (
          <Pagination
            simple
            current={currentPage}
            pageSize={pageSize}
            total={total}
            onChange={setPage}
          />
        ) : <span />}
        <span>共 {total} 条</span>
      </div>
    </section>
  );
}
