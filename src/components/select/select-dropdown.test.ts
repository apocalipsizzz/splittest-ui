import { describe, expect, it } from 'vitest';

import { selectControlClassName } from './select-dropdown';

describe('selectControlClassName', () => {
  it('пустой триггер получает свой модификатор', () => {
    expect(
      selectControlClassName({
        kind: 'select__trigger',
        size: 'md',
        invalid: false,
        empty: true,
      }),
    ).toBe('input select__trigger select__trigger--empty');
  });

  it('поиск не получает модификатор триггера', () => {
    expect(
      selectControlClassName({
        kind: 'select__input',
        size: 'md',
        invalid: false,
      }),
    ).toBe('input select__input');
  });
});
