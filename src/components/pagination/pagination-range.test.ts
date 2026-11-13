import { describe, expect, it } from 'vitest';

import {
  getPaginationState,
  paginationRangeCompact,
  paginationRangeRegular,
  type PaginationItem,
  type PaginationRange,
} from './pagination-range';

const picture = (items: PaginationItem[]) =>
  items.map(item => (item.type === 'page' ? String(item.page) : '…')).join(' ');

const at = (page: number, pageCount: number, range?: PaginationRange) =>
  picture(getPaginationState(page, pageCount, range).items);

describe('getPaginationState', () => {
  it('прячет пагинацию, когда страниц меньше двух', () => {
    expect(getPaginationState(1, 1).items).toEqual([]);
    expect(getPaginationState(1, 0).pageCount).toBe(0);
    expect(getPaginationState(1, Number.NaN).items).toEqual([]);
    expect(getPaginationState(1, Number.POSITIVE_INFINITY).items).toEqual([]);
  });

  it('обрезает дробный pageCount и прижимает страницу к диапазону', () => {
    const low = getPaginationState(0, 10.9, paginationRangeCompact);
    expect(low.page).toBe(1);
    expect(low.pageCount).toBe(10);

    const high = getPaginationState(40, 10, paginationRangeCompact);
    expect(high.page).toBe(10);
    expect(at(Number.NaN, 10, paginationRangeCompact)).toBe('1 2 3 4 5 … 10');
  });

  it('на узком ряду показывает 1–5 … N, в середине окно ±1, в конце хвост', () => {
    expect(at(1, 99, paginationRangeCompact)).toBe('1 2 3 4 5 … 99');
    expect(at(4, 99, paginationRangeCompact)).toBe('1 2 3 4 5 … 99');
    expect(at(10, 99, paginationRangeCompact)).toBe('1 … 9 10 11 … 99');
    expect(at(99, 99, paginationRangeCompact)).toBe('1 … 95 96 97 98 99');
    expect(at(1, 7, paginationRangeCompact)).toBe('1 2 3 4 5 6 7');
  });

  it('на широком ряду показывает 1–8 … N и окно ±2', () => {
    expect(at(1, 99, paginationRangeRegular)).toBe('1 2 3 4 5 6 7 8 … 99');
    expect(at(6, 99, paginationRangeRegular)).toBe('1 2 3 4 5 6 7 8 … 99');
    expect(at(50, 99, paginationRangeRegular)).toBe('1 … 48 49 50 51 52 … 99');
    expect(at(99, 99, paginationRangeRegular)).toBe(
      '1 … 92 93 94 95 96 97 98 99',
    );
    expect(at(1, 10, paginationRangeRegular)).toBe('1 2 3 4 5 6 7 8 9 10');
  });

  it('без пропа range берёт широкий пресет', () => {
    expect(at(1, 99)).toBe('1 2 3 4 5 6 7 8 … 99');
  });

  it('не ставит многоточие между соседними номерами и чинит битый range', () => {
    const touching: PaginationRange = {
      showAllUntil: 0,
      headUntil: 0,
      headSize: 1,
      siblingCount: 50,
      tailFrom: 0,
    };

    expect(at(5, 10, touching)).toBe('1 2 3 4 5 6 7 8 9 10');
    expect(at(2, 10, { ...touching, siblingCount: 0 })).toBe('1 2 … 10');
    expect(at(9, 10, { ...touching, siblingCount: 0 })).toBe('1 … 9 10');

    const broken = {
      showAllUntil: Number.NaN,
      headUntil: 5,
      headSize: 0,
      siblingCount: 1.9,
      tailFrom: Number.POSITIVE_INFINITY,
    } as PaginationRange;

    expect(at(1, 99, broken)).toBe('1 … 99');
    expect(at(1, 30, { ...paginationRangeCompact, headUntil: -2 })).toBe(
      '1 2 … 30',
    );
  });
  it('держит текущую страницу в окне, даже когда range до неё не достаёт', () => {
    const shortTail: PaginationRange = {
      showAllUntil: 7,
      headUntil: 4,
      headSize: 5,
      siblingCount: 1,
      tailFrom: 1,
    };

    expect(at(18, 20, shortTail)).toBe('1 … 18 19 20');

    const shortHead: PaginationRange = {
      showAllUntil: 7,
      headUntil: 5,
      headSize: 1,
      siblingCount: 1,
      tailFrom: 4,
    };

    expect(at(3, 99, shortHead)).toBe('1 2 3 … 99');
  });

  it('отдаёт настоящий pageCount, когда рисовать нечего', () => {
    expect(getPaginationState(1, 1).pageCount).toBe(1);
    expect(getPaginationState(1, Number.NaN).pageCount).toBe(0);
    expect(getPaginationState(1, -5).pageCount).toBe(0);
  });

  it('строит длинный список без переполнения стека', () => {
    const all: PaginationRange = {
      showAllUntil: 200000,
      headUntil: 1,
      headSize: 1,
      siblingCount: 0,
      tailFrom: 0,
    };

    expect(getPaginationState(1, 200000, all).items).toHaveLength(200000);
  });
});
