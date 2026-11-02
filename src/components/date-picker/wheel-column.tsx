import {
  useEffect,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';

import { cn, when } from '@/lib/cn';
import './wheel-column.scss';

export const WHEEL_ITEM_HEIGHT = 40;
const VISIBLE_ROWS = 5;
/** Пауза после последнего scroll-события, по которой считаем колесо остановленным. */
const SETTLE_DELAY = 120;

export interface WheelItem {
  value: number;
  label: string;
}

export interface WheelColumnProps {
  /** Подпись для вспомогательных технологий. */
  label: string;
  items: WheelItem[];
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

const clamp = (index: number, max: number) => Math.min(Math.max(index, 0), max);

/**
 * Колесо с прокруткой и snap. Выбранный пункт — тот, что посередине окна.
 * Колесо мыши, тач и стрелки меняют значение, клик по пункту выбирает его.
 */
export const WheelColumn = ({
  label,
  items,
  value,
  onChange,
  className,
}: WheelColumnProps) => {
  const listRef = useRef<HTMLDivElement>(null);
  const settleTimer = useRef<number | undefined>(undefined);
  const frame = useRef<number | undefined>(undefined);
  const scrolling = useRef(false);
  // Обработчики из таймера видят актуальные значения, а не замыкание на момент скролла.
  const latest = useRef({ items, value, onChange });
  useEffect(() => {
    latest.current = { items, value, onChange };
  });

  const index = Math.max(
    0,
    items.findIndex(item => item.value === value),
  );
  const selected = items[index];

  // Значение пришло снаружи или список сократился: докручиваем колесо.
  // Во время жеста пользователя не трогаем, иначе колесо дёргается под пальцем.
  useEffect(() => {
    const node = listRef.current;
    if (!node || scrolling.current) return;

    const target = index * WHEEL_ITEM_HEIGHT;
    if (Math.abs(node.scrollTop - target) > 1) node.scrollTop = target;
  }, [index, items.length]);

  useEffect(
    () => () => {
      window.clearTimeout(settleTimer.current);
      if (frame.current !== undefined)
        window.cancelAnimationFrame(frame.current);
    },
    [],
  );

  // Выбор идёт за прокруткой, а не после остановки: тап по «Применить» во время
  // инерции не должен отстать от того, что видно на колесе.
  const reportPosition = () => {
    frame.current = undefined;
    const node = listRef.current;
    const { items: list, value: current, onChange: emit } = latest.current;
    if (!node || list.length === 0) return;

    const item =
      list[
        clamp(Math.round(node.scrollTop / WHEEL_ITEM_HEIGHT), list.length - 1)
      ];
    if (item && item.value !== current) emit(item.value);
  };

  const handleScroll = () => {
    scrolling.current = true;
    window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(() => {
      scrolling.current = false;
    }, SETTLE_DELAY);

    if (frame.current === undefined) {
      frame.current = window.requestAnimationFrame(reportPosition);
    }
  };

  const select = (next: number) => {
    const item = items[next];
    if (!item || next === index) return;
    onChange(item.value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const steps: Record<string, number> = {
      ArrowUp: index - 1,
      ArrowDown: index + 1,
      PageUp: index - VISIBLE_ROWS,
      PageDown: index + VISIBLE_ROWS,
      Home: 0,
      End: items.length - 1,
    };

    const next = steps[event.key];
    if (next === undefined) return;

    event.preventDefault();
    select(clamp(next, items.length - 1));
  };

  const spacer = (
    <div
      className="wheel__spacer"
      style={{ height: WHEEL_ITEM_HEIGHT * Math.floor(VISIBLE_ROWS / 2) }}
      aria-hidden
    />
  );

  return (
    <div
      className="wheel-frame"
      style={
        { '--wheel-item-height': `${WHEEL_ITEM_HEIGHT}px` } as CSSProperties
      }
    >
      <div
        ref={listRef}
        // У колеса нет нативного тега; spinbutton — ближайшая роль с aria-valuenow.
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
        role="spinbutton"
        aria-label={label}
        aria-valuemin={items[0]?.value}
        aria-valuemax={items.at(-1)?.value}
        aria-valuenow={selected?.value}
        aria-valuetext={selected?.label}
        tabIndex={0}
        className={cn('wheel', className)}
        style={{ height: WHEEL_ITEM_HEIGHT * VISIBLE_ROWS }}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
      >
        {spacer}
        {items.map((item, i) => (
          <button
            key={item.value}
            type="button"
            tabIndex={-1}
            className={cn(
              'wheel__item',
              when(i === index, 'wheel__item--active'),
            )}
            style={{ height: WHEEL_ITEM_HEIGHT }}
            onClick={() => select(i)}
          >
            {item.label}
          </button>
        ))}
        {spacer}
      </div>
    </div>
  );
};
