import { describe, expect, it } from 'vitest';

import { getPaginationState, type PaginationItem } from './pagination-items';

const picture = (items: PaginationItem[]) =>
  items.map(item => (item.type === 'page' ? String(item.page) : '…')).join(' ');

const WIDE = 8;
const NARROW = 5;

const at = (page: number, pageCount: number, size = WIDE) =>
  picture(getPaginationState(page, pageCount, size).items);

describe('getPaginationState', () => {
  it('на десктопе показывает восемь номеров, «…» и последнюю', () => {
    expect(at(1, 99)).toBe('1 2 3 4 5 6 7 8 … 99');
    expect(at(7, 99)).toBe('1 2 3 4 5 6 7 8 … 99');
  });

  it('в конце уводит «…» к началу', () => {
    expect(at(99, 99)).toBe('1 … 92 93 94 95 96 97 98 99');
    expect(at(93, 99)).toBe('1 … 92 93 94 95 96 97 98 99');
  });

  it('в середине держит окно вокруг текущей страницы', () => {
    expect(at(8, 99)).toBe('1 … 6 7 8 9 10 11 … 99');
    expect(at(50, 99)).toBe('1 … 48 49 50 51 52 53 … 99');
    expect(at(92, 99)).toBe('1 … 90 91 92 93 94 95 … 99');
  });

  it('на мобилке показывает пять номеров', () => {
    expect(at(1, 99, NARROW)).toBe('1 2 3 4 5 … 99');
    expect(at(5, 99, NARROW)).toBe('1 … 4 5 6 … 99');
    expect(at(50, 99, NARROW)).toBe('1 … 49 50 51 … 99');
    expect(at(99, 99, NARROW)).toBe('1 … 95 96 97 98 99');
  });

  it('рисует все номера, пока они влезают в ряд', () => {
    expect(at(1, 10)).toBe('1 2 3 4 5 6 7 8 9 10');
    expect(at(1, 11)).toBe('1 2 3 4 5 6 7 8 … 11');
    expect(at(1, 7, NARROW)).toBe('1 2 3 4 5 6 7');
    expect(at(1, 8, NARROW)).toBe('1 2 3 4 5 … 8');
  });

  it('держит ширину ряда и текущую страницу на любой позиции', () => {
    for (const size of [NARROW, WIDE]) {
      for (let pageCount = 2; pageCount <= 40; pageCount += 1) {
        for (let page = 1; page <= pageCount; page += 1) {
          const { items } = getPaginationState(page, pageCount, size);
          const numbers = items.flatMap(item =>
            item.type === 'page' ? [item.page] : [],
          );

          expect(
            numbers,
            `page ${page} из ${pageCount}, size ${size}`,
          ).toContain(page);
          expect(
            items,
            `ширина на ${page} из ${pageCount}, size ${size}`,
          ).toHaveLength(Math.min(pageCount, size + 2));
        }
      }
    }
  });

  it('прячет пагинацию, когда страниц меньше двух', () => {
    expect(getPaginationState(1, 1, WIDE).items).toEqual([]);
    expect(getPaginationState(1, 1, WIDE).pageCount).toBe(1);
    expect(getPaginationState(1, Number.NaN, WIDE).pageCount).toBe(0);
    expect(getPaginationState(1, Number.POSITIVE_INFINITY, WIDE).items).toEqual(
      [],
    );
    expect(getPaginationState(1, -5, WIDE).pageCount).toBe(0);
  });

  it('обрезает дробный pageCount и прижимает страницу к диапазону', () => {
    expect(getPaginationState(0, 10.9, WIDE).page).toBe(1);
    expect(getPaginationState(0, 10.9, WIDE).pageCount).toBe(10);
    expect(getPaginationState(40, 10, WIDE).page).toBe(10);
    expect(at(Number.NaN, 10, NARROW)).toBe('1 2 3 4 5 … 10');
  });

  it('на огромном списке ряд остаётся прежней длины', () => {
    expect(getPaginationState(1, 200000, WIDE).items).toHaveLength(10);
  });
});
