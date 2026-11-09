import { describe, expect, it } from 'vitest';

import { cn, when } from './cn';

describe('cn', () => {
  it('склеивает строки и числа, пропуская falsy-значения (включая 0)', () => {
    expect(cn('a', 0, '', null, undefined, false, 'b', 3)).toBe('a b 3');
  });

  it('раскрывает вложенные массивы', () => {
    expect(cn(['a', ['b', [false, 'c']]], 'd')).toBe('a b c d');
  });

  it('берёт ключи словаря с истинным значением', () => {
    expect(cn({ on: true, off: false, nil: null, x: true })).toBe('on x');
  });

  it('возвращает пустую строку без аргументов', () => {
    expect(cn()).toBe('');
  });
});

describe('when', () => {
  it('отдаёт класс только при включённом флаге и непустом классе', () => {
    expect(when(true, 'active')).toBe('active');
    expect(when(false, 'active')).toBe(false);
    expect(when(undefined, 'active')).toBe(false);
    expect(when(true, undefined)).toBe(false);
    expect(when(true, '')).toBe(false);
  });
});
