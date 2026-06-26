import { useParams } from 'react-router-dom';
import { Result } from 'antd';
import { GridPricingPage } from '@/features/environment/GridPricingPage';
import { ResourceListPage } from '@/features/environment/ResourceListPage';
import { getEnvironmentResourceDefinition } from '@/features/environment/resource-definitions';

export function EnvironmentResourcePage() {
  const { resourceType = '' } = useParams();
  const definition = getEnvironmentResourceDefinition(resourceType);

  if (!definition) {
    return <Result status="404" title="环境资源不存在" subTitle="请从左侧菜单选择一个有效的环境或负荷资源。" />;
  }

  return (
    <section className="page-shell">
      <h1 className="page-shell__title">{definition.title}</h1>
      <p className="page-shell__description">
        {definition.key === 'grid-pricing'
          ? '维护购电电价、碳排放因子和电价方案列表。'
          : '列表、搜索、上传、下载、删除和曲线预览使用同一套资源模板。'}
      </p>
      {definition.key === 'grid-pricing' ? <GridPricingPage /> : <ResourceListPage definition={definition} />}
    </section>
  );
}
