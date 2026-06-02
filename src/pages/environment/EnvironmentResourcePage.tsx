import { useParams } from 'react-router-dom';

const titles: Record<string, string> = {
  'electric-load': '电负荷',
  'thermal-load': '热负荷',
  'grid-pricing': '电网电价',
  wind: '风力数据',
  'water-flow': '水流数据',
  sunlight: '光照数据',
  temperature: '温度数据',
};

export function EnvironmentResourcePage() {
  const { resourceType = '' } = useParams();
  const title = titles[resourceType] ?? '环境数据';

  return (
    <section className="page-shell">
      <h1 className="page-shell__title">{title}</h1>
      <p className="page-shell__description">复刻旧版列表、搜索、上传、下载、删除和曲线预览能力。</p>
    </section>
  );
}
