import { useParams } from 'react-router-dom';

const titles: Record<string, string> = {
  'wind-power': '风电',
  photovoltaic: '光伏',
  hydropower: '小水电',
  battery: '电储能',
  'solar-thermal': '太阳能集热',
  'gas-boiler': '燃气锅炉',
  'thermal-power-unit': '火电机组',
  cogeneration: '热电联产',
  'pumped-storage': '抽水蓄能',
  'thermal-storage': '热储能',
};

export function ModelConfigPage() {
  const { modelType = '' } = useParams();
  const title = titles[modelType] ?? '模型配置';

  return (
    <section className="page-shell">
      <h1 className="page-shell__title">{title}</h1>
      <p className="page-shell__description">复刻旧版模型列表、参数表单、新增、删除、保存和图形预览能力。</p>
    </section>
  );
}
