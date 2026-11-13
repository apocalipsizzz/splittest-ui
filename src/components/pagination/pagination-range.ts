export interface PaginationRange {
  /** Показать все номера, если страниц не больше этого числа. */
  showAllUntil: number;
  /**
   * «Начало», пока текущая страница не больше этого номера.
   * «Конец», когда она дальше, чем `pageCount - headUntil`.
   */
  headUntil: number;
  /** В «начале»: страницы 1…headSize, затем … и последняя. */
  headSize: number;
  /** В середине: текущая ± siblingCount, по краям 1 … и … последняя. */
  siblingCount: number;
  /** В «конце» первая видимая страница хвоста: `pageCount - tailFrom`. */
  tailFrom: number;
}

/** Узкий макет: 1 2 3 4 5 … N. */
export const paginationRangeCompact: PaginationRange = {
  showAllUntil: 7,
  headUntil: 4,
  headSize: 5,
  siblingCount: 1,
  tailFrom: 4,
};

/** Широкий макет: 1 2 3 4 5 6 7 8 … N. */
export const paginationRangeRegular: PaginationRange = {
  showAllUntil: 10,
  headUntil: 6,
  headSize: 8,
  siblingCount: 2,
  tailFrom: 7,
};

export type PaginationItem =
  | { type: 'page'; page: number }
  | { type: 'ellipsis'; key: 'start' | 'end' };

export interface PaginationState {
  page: number;
  pageCount: number;
  items: PaginationItem[];
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const whole = (value: number, fallback: number) => {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(0, Math.floor(value));
};

const normalizeRange = (range: PaginationRange): PaginationRange => ({
  showAllUntil: whole(range.showAllUntil, paginationRangeRegular.showAllUntil),
  headUntil: whole(range.headUntil, paginationRangeRegular.headUntil),
  headSize: Math.max(1, whole(range.headSize, paginationRangeRegular.headSize)),
  siblingCount: whole(range.siblingCount, paginationRangeRegular.siblingCount),
  tailFrom: whole(range.tailFrom, paginationRangeRegular.tailFrom),
});

/**
 * Окно страниц плюс первая и последняя, если до них есть разрыв.
 * Соседние номера без «…». Текущая страница всегда внутри окна: у своего
 * `range` окно может до неё не доехать, и тогда пропал бы и номер, и
 * `aria-current`. Номера пишем сразу в `items`: окно бывает во весь
 * `pageCount`, а `push(...pages)` на длинном списке падает по стеку.
 */
const joinWindow = (
  start: number,
  end: number,
  count: number,
  current: number,
): PaginationItem[] => {
  const from = clamp(Math.min(Math.floor(start), current), 1, count);
  const to = clamp(Math.max(Math.floor(end), current), from, count);
  const items: PaginationItem[] = [];

  if (from > 1) {
    items.push({ type: 'page', page: 1 });
    if (from > 2) items.push({ type: 'ellipsis', key: 'start' });
  }

  for (let page = from; page <= to; page += 1) {
    items.push({ type: 'page', page });
  }

  if (to < count) {
    if (to < count - 1) items.push({ type: 'ellipsis', key: 'end' });
    items.push({ type: 'page', page: count });
  }

  return items;
};

const buildItems = (
  current: number,
  count: number,
  range: PaginationRange,
): PaginationItem[] => {
  if (count <= range.showAllUntil) return joinWindow(1, count, count, current);

  if (current <= range.headUntil) {
    return joinWindow(1, Math.min(range.headSize, count), count, current);
  }

  if (current > count - range.headUntil) {
    return joinWindow(count - range.tailFrom, count, count, current);
  }

  return joinWindow(
    current - range.siblingCount,
    current + range.siblingCount,
    count,
    current,
  );
};

/**
 * Номера для отрисовки. Меньше двух страниц — пустой список,
 * компонент в этом случае ничего не рисует.
 */
export const getPaginationState = (
  page: number,
  pageCount: number,
  range: PaginationRange = paginationRangeRegular,
): PaginationState => {
  if (!Number.isFinite(pageCount) || pageCount < 2) {
    return { page: 1, pageCount: whole(pageCount, 0), items: [] };
  }

  const count = Math.floor(pageCount);
  const current = clamp(Number.isFinite(page) ? Math.trunc(page) : 1, 1, count);

  return {
    page: current,
    pageCount: count,
    items: buildItems(current, count, normalizeRange(range)),
  };
};
