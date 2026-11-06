import type { KeyboardEvent } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export const firstEnabledIndex = (options: readonly SelectOption[]) =>
  options.findIndex(option => !option.disabled);

export const highlightedIndex = (
  options: readonly SelectOption[],
  activeIndex: number,
) => {
  const activeOption = options[activeIndex];
  return activeOption && !activeOption.disabled
    ? activeIndex
    : firstEnabledIndex(options);
};

export const selectedEnabledIndex = (
  options: readonly SelectOption[],
  value: string | null,
) => {
  const index = options.findIndex(
    option => option.value === value && !option.disabled,
  );
  return index >= 0 ? index : 0;
};

const moveEnabledIndex = (
  options: readonly SelectOption[],
  from: number,
  step: 1 | -1,
) => {
  const start = from < 0 ? (step === 1 ? -1 : options.length) : from;

  for (
    let index = start + step;
    index >= 0 && index < options.length;
    index += step
  ) {
    if (!options[index]?.disabled) return index;
  }

  return from >= 0 && !options[from]?.disabled ? from : -1;
};

export const isPrintableKey = (event: KeyboardEvent) =>
  event.key.length === 1 &&
  event.key !== ' ' &&
  !event.ctrlKey &&
  !event.metaKey &&
  !event.altKey;

/** Пауза typeahead: «мо» ищет префикс, а не две отдельные буквы. Как у Radix и APG. */
export const TYPEAHEAD_TIMEOUT = 500;

const PAGE_STEP = 10;

export interface TypeaheadBuffer {
  push: (char: string, time?: number) => string;
  reset: () => void;
}

/** Буфер набора. Следующий символ позже `timeout` мс начинает строку заново. */
export const createTypeaheadBuffer = (
  timeout = TYPEAHEAD_TIMEOUT,
): TypeaheadBuffer => {
  let query = '';
  let last = 0;

  return {
    push(char, time = Date.now()) {
      if (query && time - last > timeout) query = '';
      last = time;
      query += char;
      return query;
    },
    reset() {
      query = '';
      last = 0;
    },
  };
};

const normalizeTypeahead = (value: string) =>
  value.toLowerCase().replace(/ё/g, 'е');

/**
 * Первый включённый пункт, чья подпись начинается с `query`, с обходом списка.
 * `after` — индекс, после которого искать.
 * Один символ и повтор того же символа пропускают текущий пункт.
 * Более длинный запрос включает текущий: первая буква уже поставила курсор на него.
 */
export const optionByPrefix = (
  options: readonly SelectOption[],
  query: string,
  after: number,
) => {
  const chars = Array.from(query);
  const repeated = chars.length > 1 && chars.every(char => char === chars[0]);
  const needle = normalizeTypeahead(repeated ? (chars[0] ?? '') : query);
  if (!needle || options.length === 0) return -1;

  // after < 0 — курсора ещё нет, длинный запрос начинается с первого пункта.
  const start = repeated || chars.length === 1 ? after : Math.max(after, 0) - 1;

  for (let step = 1; step <= options.length; step += 1) {
    const index = (start + step + options.length) % options.length;
    const option = options[index];
    if (!option || option.disabled) continue;
    if (normalizeTypeahead(option.label).startsWith(needle)) return index;
  }

  return -1;
};

const moveEnabledBy = (
  options: readonly SelectOption[],
  from: number,
  delta: number,
) => {
  const step: 1 | -1 = delta > 0 ? 1 : -1;
  let index = from;
  let left = Math.abs(delta);

  while (left > 0) {
    const next = moveEnabledIndex(
      options,
      index < 0 ? (step === 1 ? -1 : options.length) : index,
      step,
    );
    if (next < 0 || next === index) break;
    index = next;
    left -= 1;
  }

  return index;
};

/** Стрелки, Home/End, PageUp/PageDown, Enter и Escape открытого списка. */
export const handleListKeyDown = (
  event: KeyboardEvent,
  options: readonly SelectOption[],
  highlighted: number,
  onHighlight: (index: number) => void,
  onSelect: (option: SelectOption) => void,
  onClose: () => void,
) => {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    onHighlight(
      moveEnabledIndex(
        options,
        highlighted,
        event.key === 'ArrowDown' ? 1 : -1,
      ),
    );
    return true;
  }

  if (event.key === 'Home') {
    event.preventDefault();
    onHighlight(moveEnabledIndex(options, -1, 1));
    return true;
  }

  if (event.key === 'End') {
    event.preventDefault();
    onHighlight(moveEnabledIndex(options, options.length, -1));
    return true;
  }

  if (event.key === 'PageDown' || event.key === 'PageUp') {
    event.preventDefault();
    onHighlight(
      moveEnabledBy(
        options,
        highlighted,
        event.key === 'PageDown' ? PAGE_STEP : -PAGE_STEP,
      ),
    );
    return true;
  }

  if (event.key === 'Enter') {
    event.preventDefault();
    const option = options[highlighted];
    if (option && !option.disabled) onSelect(option);
    return true;
  }

  if (event.key === 'Escape') {
    event.preventDefault();
    onClose();
    return true;
  }

  return false;
};
