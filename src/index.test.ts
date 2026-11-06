import { describe, expect, it } from 'vitest';

import { cn, filterSelectOptions, Slot, useFieldControl } from './index';

describe('публичный шов', () => {
  it('отдаёт cn, Slot, useFieldControl и filterSelectOptions', () => {
    expect(cn('a', false, 'b')).toBe('a b');
    expect(filterSelectOptions([{ label: 'Москва' }], 'мос')).toEqual([
      { label: 'Москва' },
    ]);
    expect(typeof Slot).toBe('object');
    expect(typeof useFieldControl).toBe('function');
  });
});
