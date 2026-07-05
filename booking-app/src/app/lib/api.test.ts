import { describe, expect, it } from 'vitest';
import { apiUrl } from './api';

describe('apiUrl', () => {
  it('builds API URLs with the default local Docker prefix', () => {
    expect(apiUrl('/admin/settings')).toBe(
      'http://localhost:3500/test-app-api/admin/settings'
    );
  });

  it('normalizes paths without a leading slash', () => {
    expect(apiUrl('statistics/appointments-by-date')).toBe(
      'http://localhost:3500/test-app-api/statistics/appointments-by-date'
    );
  });
});
