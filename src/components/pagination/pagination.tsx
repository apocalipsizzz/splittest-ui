import type { HTMLAttributes, ReactNode } from 'react';

import { Button } from '@/components/button';
import { IconArrowLeft } from '@/icons/icon-arrow-left';
import { IconArrowRight } from '@/icons/icon-arrow-right';
import { cn, when } from '@/lib/cn';
import { useMediaQuery } from '@/lib/hooks/use-media-query';
import {
  getPaginationState,
  paginationRangeCompact,
  paginationRangeRegular,
  type PaginationRange,
} from './pagination-range';
import './pagination.scss';

export type PaginationLayout = 'responsive' | 'inline' | 'stacked';
export type PaginationRangePreset = 'compact' | 'regular';

/** Совпадает с `min-width(md)` в mixins: в `@media` токен не подставить. */
const WIDE_QUERY = '(min-width: 680px)';

export interface PaginationProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'children'
> {
  /** Текущая страница, с 1. */
  page: number;
  /** Сколько всего страниц. Меньше 2 — компонент не рисуется. */
  pageCount: number;
  onPageChange: (page: number) => void;
  /**
   * Какие номера видны.
   * `compact` — узкий ряд (1–5 … N), `regular` — широкий (1–8 … N).
   * Без пропа `responsive` само выбирает по ширине, `inline` берёт regular,
   * `stacked` — compact. Свой объект — те же поля, что у пресетов.
   */
  range?: PaginationRangePreset | PaginationRange;
  /**
   * `responsive` — окно по ширине экрана: до 680px compact, дальше regular.
   * `inline` — всегда regular. `stacked` — номера всегда сверху и compact.
   * От пяти страниц номера уезжают наверх и у `responsive`, и у `inline`,
   * когда сам компонент уже 680px: иначе ряд с подписями не влезает.
   */
  layout?: PaginationLayout;
  prevLabel?: ReactNode;
  nextLabel?: ReactNode;
  disabled?: boolean;
}

const resolveRange = (
  range: PaginationProps['range'],
  layout: PaginationLayout,
  isWide: boolean,
): PaginationRange => {
  if (range && typeof range === 'object') return range;
  if (range === 'compact') return paginationRangeCompact;
  if (range === 'regular') return paginationRangeRegular;
  if (layout === 'stacked') return paginationRangeCompact;
  if (layout === 'inline') return paginationRangeRegular;
  return isWide ? paginationRangeRegular : paginationRangeCompact;
};

export function Pagination(props: PaginationProps) {
  const {
    page,
    pageCount,
    onPageChange,
    range,
    layout = 'responsive',
    prevLabel = 'Назад',
    nextLabel = 'Вперёд',
    className,
    disabled = false,
    'aria-label': ariaLabel = 'Страницы',
    ...rest
  } = props;

  const isWide = useMediaQuery(WIDE_QUERY);
  const state = getPaginationState(
    page,
    pageCount,
    resolveRange(range, layout, isWide),
  );

  if (state.pageCount < 2) return null;

  // Подписи не влезают в узкий ряд, когда страниц мало: остаются стрелки.
  const showStepLabel = state.pageCount >= 5;
  const stepName = (label: ReactNode, fallback: string) =>
    typeof label === 'string' || typeof label === 'number'
      ? String(label)
      : fallback;

  const handlePage = (next: number) => {
    if (disabled || next === state.page || next < 1 || next > state.pageCount) {
      return;
    }

    onPageChange(next);
  };

  // На краях шаги гасим через aria-disabled, а не нативный disabled: иначе
  // клик по «Вперёд» на последней странице уносит фокус в body. Клики всё
  // равно отсекает handlePage.
  const atStart = state.page <= 1;
  const atEnd = state.page >= state.pageCount;

  return (
    <nav
      {...rest}
      className={cn(
        'pagination',
        `pagination--${layout}`,
        when(showStepLabel, 'pagination--labeled'),
        className,
      )}
      aria-label={ariaLabel}
    >
      <div className="pagination__row">
        <Button
          variant="link"
          className="pagination__step"
          disabled={disabled}
          aria-disabled={atStart || undefined}
          aria-label={showStepLabel ? undefined : stepName(prevLabel, 'Назад')}
          onClick={() => handlePage(state.page - 1)}
        >
          <IconArrowLeft />
          {showStepLabel ? prevLabel : null}
        </Button>
        <ul className="pagination__list">
          {state.items.map(item =>
            item.type === 'ellipsis' ? (
              <li key={item.key} aria-hidden="true">
                <span className="pagination__ellipsis">...</span>
              </li>
            ) : (
              // Текущая страница остаётся кнопкой: после клика по номеру
              // фокус должен остаться на нём, а не улететь в body.
              <li key={item.page}>
                <button
                  type="button"
                  className={cn(
                    'pagination__page',
                    when(item.page === state.page, 'pagination__page--current'),
                  )}
                  disabled={disabled}
                  aria-current={item.page === state.page ? 'page' : undefined}
                  onClick={() => handlePage(item.page)}
                >
                  {item.page}
                </button>
              </li>
            ),
          )}
        </ul>
        <Button
          variant="link"
          className="pagination__step"
          disabled={disabled}
          aria-disabled={atEnd || undefined}
          aria-label={showStepLabel ? undefined : stepName(nextLabel, 'Вперёд')}
          onClick={() => handlePage(state.page + 1)}
        >
          {showStepLabel ? nextLabel : null}
          <IconArrowRight />
        </Button>
      </div>
    </nav>
  );
}
