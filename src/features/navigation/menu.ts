import type { MenuProps } from 'antd';

type MenuItem = Required<MenuProps>['items'][number];

export const routeGroups = {
  simulation: ['/simulation/scheme', '/simulation/optimization'],
  environment: [
    '/environment/electric-load',
    '/environment/thermal-load',
    '/environment/grid-pricing',
    '/environment/wind',
    '/environment/water-flow',
    '/environment/sunlight',
    '/environment/temperature',
  ],
  model: [
    '/model/wind-power',
    '/model/photovoltaic',
    '/model/hydropower',
    '/model/battery',
    '/model/solar-thermal',
    '/model/gas-boiler',
    '/model/thermal-power-unit',
    '/model/cogeneration',
    '/model/pumped-storage',
    '/model/thermal-storage',
  ],
  system: ['/system/users', '/system/roles'],
} as const;

export function getOpenMenuKeys(pathname: string) {
  return Object.entries(routeGroups)
    .filter(([, routes]) => (routes as readonly string[]).includes(pathname))
    .map(([key]) => key);
}

export const mainMenuItems: MenuItem[] = [
  {
    key: 'simulation',
    label: '仿真计算',
    children: [
      { key: '/simulation/scheme', label: '方案仿真' },
      { key: '/simulation/optimization', label: '寻优计算' },
    ],
  },
  {
    key: 'environment',
    label: '环境与负荷',
    children: [
      { key: '/environment/electric-load', label: '电负荷' },
      { key: '/environment/thermal-load', label: '热负荷' },
      { key: '/environment/grid-pricing', label: '电网电价' },
      { key: '/environment/wind', label: '风力数据' },
      { key: '/environment/water-flow', label: '水流数据' },
      { key: '/environment/sunlight', label: '光照数据' },
      { key: '/environment/temperature', label: '温度数据' },
    ],
  },
  {
    key: 'model',
    label: '模型配置',
    children: [
      { key: '/model/wind-power', label: '风电' },
      { key: '/model/photovoltaic', label: '光伏' },
      { key: '/model/hydropower', label: '小水电' },
      { key: '/model/battery', label: '电储能' },
      { key: '/model/solar-thermal', label: '太阳能集热' },
      { key: '/model/gas-boiler', label: '燃气锅炉' },
      { key: '/model/thermal-power-unit', label: '火电机组' },
      { key: '/model/cogeneration', label: '热电联产' },
      { key: '/model/pumped-storage', label: '抽水蓄能' },
      { key: '/model/thermal-storage', label: '热储能' },
    ],
  },
  {
    key: 'system',
    label: '系统管理',
    children: [
      { key: '/system/users', label: '用户管理' },
      { key: '/system/roles', label: '角色管理' },
    ],
  },
];
