import { describe, expect, it } from 'vitest';
import { routeGroups } from '@/features/navigation/menu';

describe('routeGroups', () => {
  it('contains core route groups for the phase-one scaffold', () => {
    expect(routeGroups.simulation).toContain('/simulation/scheme');
    expect(routeGroups.simulation).toContain('/simulation/optimization');
    expect(routeGroups.environment).toContain('/environment/electric-load');
    expect(routeGroups.environment).toContain('/environment/temperature');
    expect(routeGroups.model).toContain('/model/wind-power');
    expect(routeGroups.model).toContain('/model/thermal-storage');
    expect(routeGroups.system).toContain('/system/users');
  });
});
