import { describe, expect, it } from 'vitest';

import {
  createTypeaheadBuffer,
  optionByPrefix,
  TYPEAHEAD_TIMEOUT,
  type SelectOption,
} from './select-option';

const OPTIONS: SelectOption[] = [
  { value: 'msk', label: 'Москва' },
  { value: 'muc', label: 'Мюнхен' },
  { value: 'kzn', label: 'Казань', disabled: true },
  { value: 'spb', label: 'Санкт-Петербург' },
];

describe('typeahead', () => {
  it('склеивает символы внутри паузы и сбрасывает после неё', () => {
    const buffer = createTypeaheadBuffer(TYPEAHEAD_TIMEOUT);

    expect(buffer.push('м', 0)).toBe('м');
    expect(buffer.push('о', 400)).toBe('мо');
    expect(buffer.push('е', 400 + TYPEAHEAD_TIMEOUT + 1)).toBe('е');
    buffer.reset();
    expect(buffer.push('с', 5_000)).toBe('с');
  });

  it('длинный префикс включает текущий пункт, повтор буквы — следующий', () => {
    expect(optionByPrefix(OPTIONS, 'м', -1)).toBe(0);
    expect(optionByPrefix(OPTIONS, 'мо', 0)).toBe(0);
    expect(optionByPrefix(OPTIONS, 'мю', 0)).toBe(1);
    expect(optionByPrefix(OPTIONS, 'мм', 0)).toBe(1);
    expect(optionByPrefix(OPTIONS, 'е', 0)).toBe(-1);
  });
});
