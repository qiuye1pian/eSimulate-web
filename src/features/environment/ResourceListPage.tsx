import { useMemo, useState } from 'react';
import { DeleteOutlined, DownloadOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { App, Button, Empty, Input, List, Pagination, Popconfirm, Space, Tag } from 'antd';
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
    onError: (error) => {
      message.error(error instanceof Error ? error.message : '上传失败');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number | string) => deleteResource(definition.endpoint, id),
    onSuccess: () => {
      message.success('删除成功');
      setSelectedRecord(null);
      listQuery.refetch();
    },
    onError: (error) => {
      message.error(error instanceof Error ? error.message : '删除失败');
    },
  });

  const downloadMutation = useMutation({
    mutationFn: (record: ApiRecord) => downloadResource(definition.endpoint, getRecordId(record) as number | string),
    onSuccess: (blob, record) => {
      saveBlob(blob, `${getRecordName(record)}.csv`);
    },
    onError: (error) => {
      message.error(error instanceof Error ? error.message : '下载失败');
    },
  });

  const rows = useMemo(() => listQuery.data?.data?.list ?? [], [listQuery.data]);
  const total = listQuery.data?.data?.total ?? 0;
  const currentPage = listQuery.data?.data?.page ?? page;
  const pageSize = listQuery.data?.data?.size ?? 10;

  return (
    <section className="resource-workspace">
      <aside className="resource-workspace__catalog">
        <div className="model-panel-heading">
          <div>
            <span className="model-panel-heading__eyebrow">RESOURCE CATALOG</span>
            <h2>{definition.title}方案</h2>
          </div>
          <Tag bordered={false}>{total} 条</Tag>
        </div>

        <Space.Compact className="model-catalog-search" block>
          <Input.Search
            allowClear
            prefix={<SearchOutlined />}
            placeholder={`搜索${definition.title}`}
            onSearch={(value) => {
              setPage(1);
              setKeyword(value.trim());
            }}
          />
        </Space.Compact>

        <List
          className="resource-catalog-list"
          loading={listQuery.isLoading || deleteMutation.isPending}
          dataSource={rows}
          locale={{ emptyText: '暂无方案数据' }}
          renderItem={(record) => {
            const id = getRecordId(record);
            const selected = selectedRecord && getRecordId(selectedRecord) === id;
            const name = getRecordName(record);

            return (
              <List.Item
                className={selected ? 'resource-catalog-list__selected' : undefined}
                actions={[
                  definition.supportsDownload ? (
                    <Button
                      key="download"
                      aria-label={`下载${name}`}
                      type="text"
                      icon={<DownloadOutlined />}
                      loading={downloadMutation.isPending}
                      disabled={id === undefined}
                      onClick={(event) => {
                        event.stopPropagation();
                        downloadMutation.mutate(record);
                      }}
                    />
                  ) : null,
                  <Popconfirm
                    key="delete"
                    title="确认删除这条数据吗？"
                    okText="删除"
                    cancelText="取消"
                    onConfirm={() => id !== undefined && deleteMutation.mutate(id)}
                  >
                    <Button
                      danger
                      aria-label={`删除${name}`}
                      type="text"
                      icon={<DeleteOutlined />}
                      disabled={id === undefined}
                      onClick={event => event.stopPropagation()}
                    />
                  </Popconfirm>,
                ].filter(Boolean)}
                onClick={() => setSelectedRecord(record)}
              >
                <div className="model-catalog-item">
                  <span className="model-catalog-item__status" />
                  <div>
                    <strong>{name}</strong>
                    <span>{selected ? '正在预览' : '点击预览曲线'}</span>
                  </div>
                </div>
              </List.Item>
            );
          }}
        />

        <div className="model-catalog-footer">
          {total > 0 ? (
            <Pagination
              simple
              current={currentPage}
              pageSize={pageSize}
              total={total}
              onChange={setPage}
            />
          ) : <span />}
          <span>共 {total} 条记录</span>
        </div>
      </aside>

      <main className="resource-workspace__main">
        <div className="model-panel-heading model-panel-heading--inline">
          <div>
            <span className="model-panel-heading__eyebrow">CURVE PREVIEW</span>
            <h2>{selectedRecord ? getRecordName(selectedRecord) : `${definition.title}曲线`}</h2>
          </div>
          <div className="model-panel-heading__actions">
            <Button icon={<ReloadOutlined />} onClick={() => listQuery.refetch()}>
              刷新列表
            </Button>
            {definition.supportsCsvUpload ? (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setUploadOpen(true)}>
                上传 CSV
              </Button>
            ) : null}
          </div>
        </div>

        {definition.supportsCurvePreview ? (
          <div className="resource-curve-panel">
            <CurvePreview data={curveQuery.data?.data} loading={curveQuery.isLoading} unit={definition.chartUnit} />
          </div>
        ) : (
          <Empty description="当前资源暂无曲线预览" />
        )}
      </main>

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
