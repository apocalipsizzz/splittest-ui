import type { HTMLAttributes, ReactNode } from 'react';

import { Button } from '@/components/button';
import { IconArrowLeft } from '@/icons/icon-arrow-left';
import { IconArrowRight } from '@/icons/icon-arrow-right';
import { cn, when } from '@/lib/cn';
import { useMediaQuery } from '@/lib/hooks/use-media-query';
import { getPaginationState } from './pagination-items';
import './pagination.scss';

/** Совпадает с `min-width(md)` в mixins: в `@media` токен не подставить. */
const WIDE_QUERY = '(min-width: 680px)';

/** Номеров по краям ряда: 1…8 … N на десктопе и 1…5 … N на мобилке. */
const WIDE_SIZE = 8;
const NARROW_SIZE = 5;

/** До стольких страниц мобильный ряд остаётся одной строкой без подписей. */
const FEW_PAGES = 5;

export interface PaginationProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'children'
> {
  /** Текущая страница, с 1. */
  page: number;
  /** Сколько всего страниц. Меньше 2 — компонент не рисуется. */
  pageCount: number;
  onPageChange: (page: number) => void;
  prevLabel?: ReactNode;
  nextLabel?: ReactNode;
  disabled?: boolean;
}

/**
 * Ряд номеров со стрелками. Раскладку и количество номеров компонент
 * выбирает сам по ширине экрана: от 680px — одна строка и восемь номеров,
 * уже — пять номеров строкой выше, а «Назад» и «Вперёд» по краям второй.
 * Меньше пяти страниц на мобилке — всё в одну строку, у шагов только стрелки.
 */
export function Pagination(props: PaginationProps) {
  const {
    page,
    pageCount,
    onPageChange,
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
    isWide ? WIDE_SIZE : NARROW_SIZE,
  );

  if (state.pageCount < 2) return null;

  const goTo = (next: number) => {
    if (disabled || next === state.page || next < 1 || next > state.pageCount) {
      return;
    }

    onPageChange(next);
  };

  return (
    <nav
      {...rest}
      className={cn(
        'pagination',
        when(state.pageCount < FEW_PAGES, 'pagination--few'),
        className,
      )}
      aria-label={ariaLabel}
    >
      <div className="pagination__row">
        {/*
          На краях шаги гасим через aria-disabled, а не нативный disabled:
          иначе клик по «Вперёд» на последней странице уносит фокус в body.
          Клики всё равно отсекает goTo.
        */}
        <Button
          variant="link"
          className="pagination__step"
          disabled={disabled}
          aria-disabled={state.page <= 1 || undefined}
          onClick={() => goTo(state.page - 1)}
        >
          <IconArrowLeft />
          <span className="pagination__step-label">{prevLabel}</span>
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
                  onClick={() => goTo(item.page)}
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
          aria-disabled={state.page >= state.pageCount || undefined}
          onClick={() => goTo(state.page + 1)}
        >
          <span className="pagination__step-label">{nextLabel}</span>
          <IconArrowRight />
        </Button>
      </div>
    </nav>
  );
}
