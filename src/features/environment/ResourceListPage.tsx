import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { App, Button, Card, Input, Popconfirm, Space, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  deleteResource,
  downloadResource,
  getResourceList,
  getResourceValues,
  uploadResourceScheme,
} from '@/services/environment';
import type { ApiRecord } from '@/types/api';
import { downloadBlob as saveBlob } from '@/utils/download';
import { CsvUploadModal } from './CsvUploadModal';
import { CurvePreview } from './CurvePreview';
import type { EnvironmentResourceDefinition } from './resource-definitions';

interface ResourceListPageProps {
  definition: EnvironmentResourceDefinition;
}

function getRecordName(record: ApiRecord) {
  return String(record.name ?? record.schemeName ?? record.modelName ?? '-');
}

function getRecordId(record: ApiRecord) {
  return record.id as number | string | undefined;
}

export function ResourceListPage({ definition }: ResourceListPageProps) {
  const { message } = App.useApp();
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<ApiRecord | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const listQuery = useQuery({
    queryKey: ['environment-resource-list', definition.key, page, keyword],
    queryFn: () =>
      getResourceList(definition.endpoint, {
        page,
        size: 10,
        [definition.searchField]: keyword || undefined,
      }),
  });

  const selectedId = selectedRecord ? getRecordId(selectedRecord) : undefined;

  const curveQuery = useQuery({
    queryKey: ['environment-resource-values', definition.key, selectedId],
    queryFn: () => getResourceValues(definition.endpoint, selectedId as number | string),
    enabled: definition.supportsCurvePreview && selectedId !== undefined,
  });

  const uploadMutation = useMutation({
    mutationFn: ({ schemeName, file }: { schemeName: string; file: File }) => {
      const formData = new FormData();
      formData.append('schemeName', schemeName);
      formData.append('file', file);
      return uploadResourceScheme(definition.endpoint, formData);
    },
    onSuccess: () => {
      message.success('上传成功');
      setUploadOpen(false);
      listQuery.refetch();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number | string) => deleteResource(definition.endpoint, id),
    onSuccess: () => {
      message.success('删除成功');
      setSelectedRecord(null);
      listQuery.refetch();
    },
  });

  const downloadMutation = useMutation({
    mutationFn: (record: ApiRecord) => downloadResource(definition.endpoint, getRecordId(record) as number | string),
    onSuccess: (blob, record) => {
      saveBlob(blob, `${getRecordName(record)}.csv`);
    },
  });

  const rows = useMemo(() => listQuery.data?.data?.list ?? [], [listQuery.data]);
  const total = listQuery.data?.data?.total ?? 0;
  const currentPage = listQuery.data?.data?.page ?? page;
  const pageSize = listQuery.data?.data?.size ?? 10;

  const columns: ColumnsType<ApiRecord> = [
    { title: '名称', dataIndex: 'name', render: (_, record) => getRecordName(record) },
    { title: '创建时间', dataIndex: 'createTime', render: value => value ? String(value) : '-' },
    {
      title: '操作',
      width: 180,
      render: (_, record) => {
        const id = getRecordId(record);
        return (
          <Space>
            {definition.supportsDownload ? (
              <Button type="link" size="small" disabled={id === undefined} onClick={() => downloadMutation.mutate(record)}>
                下载
              </Button>
            ) : null}
            <Popconfirm
              title="确认删除这条数据吗？"
              okText="删除"
              cancelText="取消"
              onConfirm={() => id !== undefined && deleteMutation.mutate(id)}
            >
              <Button danger type="link" size="small" disabled={id === undefined}>
                删除
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <section className="resource-page">
      <Card>
        <div className="resource-page__toolbar">
          <Input.Search
            allowClear
            placeholder={`搜索${definition.title}`}
            style={{ maxWidth: 320 }}
            onSearch={(value) => {
              setPage(1);
              setKeyword(value.trim());
            }}
          />
          <Space>
            <Button onClick={() => listQuery.refetch()}>刷新</Button>
            {definition.supportsCsvUpload ? (
              <Button type="primary" onClick={() => setUploadOpen(true)}>
                上传 CSV
              </Button>
            ) : null}
          </Space>
        </div>
        <Table
          rowKey={(record) => String(getRecordId(record) ?? getRecordName(record))}
          loading={listQuery.isLoading || deleteMutation.isPending}
          columns={columns}
          dataSource={rows}
          rowSelection={{
            type: 'radio',
            selectedRowKeys: selectedRecord ? [String(getRecordId(selectedRecord))] : [],
            onSelect: record => setSelectedRecord(record),
          }}
          pagination={{
            current: currentPage,
            pageSize,
            total,
            onChange: setPage,
          }}
        />
      </Card>

      {definition.supportsCurvePreview ? (
        <Card title="曲线预览" style={{ marginTop: 16 }}>
          <CurvePreview data={curveQuery.data?.data} loading={curveQuery.isLoading} unit={definition.chartUnit} />
        </Card>
      ) : null}

      {definition.supportsCsvUpload ? (
        <CsvUploadModal
          open={uploadOpen}
          title={definition.title}
          uploading={uploadMutation.isPending}
          onCancel={() => setUploadOpen(false)}
          onSubmit={values => uploadMutation.mutate(values)}
        />
      ) : null}
    </section>
  );
}
