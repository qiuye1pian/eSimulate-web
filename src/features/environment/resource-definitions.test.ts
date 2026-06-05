import { describe, expect, it } from 'vitest';
import { getEnvironmentResourceDefinition } from './resource-definitions';
import { routeGroups } from '@/features/navigation/menu';

describe('environment resource definitions', () => {
  it('maps electric-load to the old backend load scheme endpoint', () => {
    const definition = getEnvironmentResourceDefinition('electric-load');

    expect(definition).toMatchObject({
      key: 'electric-load',
      title: '电负荷',
      endpoint: 'load/electric-load-schemes',
      searchField: 'schemeName',
      chartUnit: 'kW',
      supportsCsvUpload: true,
      supportsDownload: true,
      supportsCurvePreview: true,
    });
  });

  it('returns undefined for an unknown resource type', () => {
    expect(getEnvironmentResourceDefinition('unknown')).toBeUndefined();
  });

  it('has a definition for every environment menu route', () => {
    routeGroups.environment.forEach((route) => {
      const resourceType = route.replace('/environment/', '');

      expect(getEnvironmentResourceDefinition(resourceType)).toBeDefined();
    });
  });
});
