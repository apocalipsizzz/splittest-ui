import { describe, expect, it } from 'vitest';

import { defaultFilterOption, matchesQuery } from './filter-option';

describe('matchesQuery', () => {
  it('пустой запрос подходит ко всему', () => {
    expect(matchesQuery('Москва', '   ')).toBe(true);
  });

  it('ищет без регистра и считает ё и е одной буквой', () => {
    expect(matchesQuery('Ещё', 'еще')).toBe(true);
    expect(matchesQuery('Москва', 'МОС')).toBe(true);
  });

  it('понимает запрос в неправильной раскладке', () => {
    expect(matchesQuery('Москва', 'Vjcrdf')).toBe(true);
    expect(matchesQuery('Moscow', 'Ьщысщц')).toBe(true);
  });

  it('не совпадает с чужим текстом', () => {
    expect(matchesQuery('Казань', 'мос')).toBe(false);
  });
});

describe('defaultFilterOption', () => {
  it('смотрит и в keywords', () => {
    const option = { label: 'Т-Банк', keywords: ['Тинькофф', '044525974'] };

    expect(defaultFilterOption(option, 'тинь')).toBe(true);
    expect(defaultFilterOption(option, '0445')).toBe(true);
    expect(defaultFilterOption(option, 'сбер')).toBe(false);
  });
});
