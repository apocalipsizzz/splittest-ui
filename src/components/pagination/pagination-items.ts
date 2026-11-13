export type PaginationItem =
  | { type: 'page'; page: number }
  | { type: 'ellipsis'; key: 'start' | 'end' };

export interface PaginationState {
  page: number;
  pageCount: number;
  items: PaginationItem[];
}

const pageItem = (value: number): PaginationItem => ({
  type: 'page',
  page: value,
});

/** Номера подряд, от `from` до `to` включительно. */
const run = (from: number, to: number): PaginationItem[] => {
  const items: PaginationItem[] = [];

  for (let value = from; value <= to; value += 1) {
    items.push(pageItem(value));
  }

  return items;
};

/**
 * Ряд всегда одной ширины — `size + 2` ячейки:
 * начало — `1…size`, «…», последняя;
 * конец — первая, «…», `size` последних;
 * середина — первая, «…», окно из `size - 2` номеров, «…», последняя.
 * Текущая страница при этом всегда внутри окна.
 */
const buildItems = (
  current: number,
  count: number,
  size: number,
): PaginationItem[] => {
  if (count <= size + 2) return run(1, count);

  if (current <= size - 1) {
    return [...run(1, size), { type: 'ellipsis', key: 'end' }, pageItem(count)];
  }

  if (current >= count - size + 2) {
    return [
      pageItem(1),
      { type: 'ellipsis', key: 'start' },
      ...run(count - size + 1, count),
    ];
  }

  const inner = size - 2;
  const from = current - Math.floor((inner - 1) / 2);

  return [
    pageItem(1),
    { type: 'ellipsis', key: 'start' },
    ...run(from, from + inner - 1),
    { type: 'ellipsis', key: 'end' },
    pageItem(count),
  ];
};

const whole = (value: number) =>
  Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;

/**
 * Номера для отрисовки. `size` — сколько номеров видно по краям ряда.
 * Меньше двух страниц — пустой список, компонент тогда ничего не рисует.
 */
export const getPaginationState = (
  current: number,
  pageCount: number,
  size: number,
): PaginationState => {
  const count = whole(pageCount);

  if (count < 2) return { page: 1, pageCount: count, items: [] };

  const value = Number.isFinite(current) ? Math.trunc(current) : 1;
  const safe = Math.min(count, Math.max(1, value));

  return { page: safe, pageCount: count, items: buildItems(safe, count, size) };
};
