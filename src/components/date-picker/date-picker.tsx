import {
  FloatingFocusManager,
  FloatingNode,
  useDismiss,
  useFloating,
  useFloatingNodeId,
  useInteractions,
} from '@floating-ui/react';
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
} from 'react';

import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { IconCalendar } from '@/icons/icon-calendar';
import { IconCorrect } from '@/icons/icon-correct';
import { cn } from '@/lib/cn';
import { FloatingLayerTree } from '@/lib/floating-layer';
import { useControllableState } from '@/lib/hooks/use-controllable-state';
import { Portal, portalProps } from '@/lib/portal';
import '../input/input.scss';
import { useScrollLock } from '@/lib/hooks/use-scroll-lock';
import { WheelColumn } from './wheel-column';
import './date-picker.scss';

/** Именительный: «март». `month: 'long'` без дня. */
const monthList = (locale: string) => {
  const format = new Intl.DateTimeFormat(locale, { month: 'long' });
  return Array.from({ length: 12 }, (_, month) =>
    format.format(new Date(2000, month, 1)),
  );
};

/**
 * Родительный: «марта». День в шаблоне заставляет Intl просклонять месяц,
 * из частей берётся только месяц.
 */
const genitiveMonth = (date: Date, locale: string) =>
  new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long' })
    .formatToParts(date)
    .find(part => part.type === 'month')?.value ?? '';

/** Месяц здесь 1–12, как в календаре, а не индекс массива. */
interface DateParts {
  day: number;
  month: number;
  year: number;
}

const daysInMonth = (year: number, month: number) =>
  new Date(year, month, 0).getDate();

const partsOf = (date: Date): DateParts => ({
  day: date.getDate(),
  month: date.getMonth() + 1,
  year: date.getFullYear(),
});

const toDate = ({ day, month, year }: DateParts) =>
  new Date(year, month - 1, day);

const pad = (value: number) => String(value).padStart(2, '0');

const toIsoDate = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const formatDate = (date: Date, locale: string) =>
  `${date.getDate()} ${genitiveMonth(date, locale)} ${date.getFullYear()}`;

/** Сегодня минус `minAge` лет. 29 февраля в невисокосном году уходит на 28-е. */
const maxAllowedDate = (minAge: number, today: Date) => {
  const year = today.getFullYear() - minAge;
  const month = today.getMonth();
  const day = Math.min(today.getDate(), daysInMonth(year, month + 1));
  return new Date(year, month, day);
};

/** Подрезает день под длину месяца и не даёт выбрать дату позже максимальной. */
const clampParts = (parts: DateParts, max: Date): DateParts => {
  const next = {
    ...parts,
    day: Math.min(parts.day, daysInMonth(parts.year, parts.month)),
  };

  return toDate(next) > max ? partsOf(max) : next;
};

const range = (from: number, to: number) =>
  from > to ? [] : Array.from({ length: to - from + 1 }, (_, i) => from + i);

export interface DatePickerProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange' | 'defaultValue' | 'title'
> {
  /** Управляемое значение. Без него дату держит сам компонент, см. `defaultValue`. */
  value?: Date | null;
  /** Стартовая дата неуправляемого поля. */
  defaultValue?: Date | null;
  onChange?: (date: Date) => void;
  /** Самый ранний год в списке. */
  minYear?: number;
  /** Самый поздний год в списке. По умолчанию — текущий. */
  maxYear?: number;
  /** Минимальный возраст: позже сегодня минус столько лет выбрать нельзя. 0 — без ограничения. */
  minAge?: number;
  disabled?: boolean;
  /** Имя для FormData: уходит дата в формате `YYYY-MM-DD`. */
  name?: string;
  /** Текст в поле, пока дата не выбрана. */
  placeholder?: string;
  /** Заголовок окна выбора, не атрибут `title`. */
  title?: string;
  error?: boolean;
  /** Локаль названий месяцев. Родительный падеж берёт `Intl.DateTimeFormat`. */
  locale?: string;
  dayLabel?: string;
  monthLabel?: string;
  yearLabel?: string;
  applyLabel?: string;
  cancelLabel?: string;
}

/**
 * Выбор даты: поле открывает нижний лист с выбором дня, месяца и года.
 * Поле только для чтения с клавиатуры, поэтому `required` из `Field` и
 * нативная проверка формы работают, а телефонная клавиатура не открывается.
 */
const DatePickerFrame = forwardRef<HTMLDivElement, DatePickerProps>(
  function DatePickerFrame(
    {
      value: valueProp,
      defaultValue = null,
      onChange,
      minYear = 1930,
      maxYear,
      minAge = 0,
      disabled = false,
      name,
      placeholder = 'Выберите дату',
      title = 'Выберите дату',
      error,
      className,
      locale = 'ru',
      dayLabel = 'День',
      monthLabel = 'Месяц',
      yearLabel = 'Год',
      applyLabel = 'Применить',
      cancelLabel = 'Отмена',
      ...props
    },
    ref,
  ) {
    const [value, setValue] = useControllableState<Date | null>(
      valueProp,
      defaultValue,
      next => {
        if (next) onChange?.(next);
      },
    );
    // «Сегодня» пересчитывается на каждом открытии: во вкладке, дожившей до
    // полуночи, minAge иначе считался бы от вчерашней даты.
    const [today, setToday] = useState(() => new Date());
    const months = useMemo(() => monthList(locale), [locale]);
    const [open, setOpen] = useState(false);
    const maxBirth = maxAllowedDate(minAge, today);
    const lastYear = Math.min(
      maxYear ?? today.getFullYear(),
      maxBirth.getFullYear(),
    );
    const [draft, setDraft] = useState<DateParts>(() =>
      clampParts(partsOf(value ?? maxBirth), maxBirth),
    );
    const focusOnMount = useRef(false);
    const sheetRef = useRef<HTMLDivElement | null>(null);
    const titleId = useId();
    const nodeId = useFloatingNodeId();
    const { refs, context } = useFloating({
      nodeId,
      open,
      onOpenChange: next => {
        if (!next) setOpen(false);
      },
    });
    // Ловушка фокуса — у менеджера. Он же через rAF возвращает фокус внешнему
    // листу, и дерево это не отменяет. Пока слой открыт, чужой focusin
    // возвращаем на лист — без второго кадра.
    const dismiss = useDismiss(context, {
      outsidePressEvent: 'mousedown',
    });
    const { getFloatingProps } = useInteractions([dismiss]);
    const { setFloating, setReference } = refs;
    const setSheetRef = useCallback(
      (node: HTMLDivElement | null) => {
        setFloating(node);
        sheetRef.current = node;
        if (!node || !focusOnMount.current) return;
        focusOnMount.current = false;
        node.focus();
      },
      [setFloating],
    );

    const years = range(Math.min(minYear, draft.year), lastYear);
    const days = range(1, daysInMonth(draft.year, draft.month));

    useScrollLock(open);

    useEffect(() => {
      if (!open) return;

      const handleFocusIn = (event: FocusEvent) => {
        const sheet = sheetRef.current;
        const target = event.target;
        if (!sheet || !(target instanceof Node) || sheet.contains(target))
          return;
        sheet.focus();
      };

      document.addEventListener('focusin', handleFocusIn);
      return () => document.removeEventListener('focusin', handleFocusIn);
    }, [open]);

    const openSheet = () => {
      if (disabled) return;

      const now = new Date();
      const limit = maxAllowedDate(minAge, now);
      setToday(now);
      setDraft(clampParts(partsOf(value ?? limit), limit));
      focusOnMount.current = true;
      setOpen(true);
    };

    const close = () => {
      setOpen(false);
    };

    const updateDraft = (patch: Partial<DateParts>) => {
      setDraft(prev => clampParts({ ...prev, ...patch }, maxBirth));
    };

    const apply = () => {
      setValue(toDate(draft));
      close();
    };

    // Текст не вводится: поле только выбирает дату через лист.
    const handleTriggerKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Tab') return;

      event.preventDefault();
      if (
        event.key === 'Enter' ||
        event.key === ' ' ||
        event.key === 'ArrowDown'
      ) {
        openSheet();
      }
    };

    return (
      <FloatingNode id={nodeId}>
        <div
          {...props}
          ref={ref}
          data-state={open ? 'open' : 'closed'}
          className={cn('date-picker', className)}
        >
          <Input
            ref={setReference}
            className="date-picker__trigger"
            value={value ? formatDate(value, locale) : ''}
            onChange={() => {}}
            onClick={openSheet}
            onKeyDown={handleTriggerKeyDown}
            onPaste={event => event.preventDefault()}
            inputMode="none"
            autoComplete="off"
            aria-haspopup="dialog"
            aria-expanded={open}
            placeholder={placeholder}
            disabled={disabled}
            error={error}
          />
          <IconCalendar className="date-picker__icon" aria-hidden />
          {name ? (
            <input
              type="hidden"
              name={name}
              value={value ? toIsoDate(value) : ''}
            />
          ) : null}

          {open ? (
            <Portal>
              <div className="date-picker__layer" {...portalProps}>
                {/*
                  Вуаль только для указателя: от скринридера она скрыта, а лист
                  закрывается Escape и кнопкой «Отмена». Кнопкой её делать
                  нельзя — это лишняя полноэкранная остановка в табуляции.
                  useDismiss сюда не достаёт: вуаль лежит в том же портале,
                  что и лист, и для него не «снаружи».
                */}
                {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events -- aria-hidden, дублирует Escape и «Отмена» */}
                <div
                  className="date-picker__mask"
                  aria-hidden="true"
                  onClick={close}
                />
                <FloatingFocusManager context={context} modal initialFocus={-1}>
                  <div
                    {...getFloatingProps()}
                    ref={setSheetRef}
                    // eslint-disable-next-line jsx-a11y/prefer-tag-over-role -- <dialog> без showModal() не модален: ловушку держит FloatingFocusManager
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={titleId}
                    tabIndex={-1}
                    data-state="open"
                    className="date-picker__sheet"
                  >
                    <h2 id={titleId} className="date-picker__title">
                      {title}
                    </h2>
                    <div className="date-picker__columns">
                      <div className="date-picker__column">
                        <span className="date-picker__caption">{dayLabel}</span>
                        <WheelColumn
                          label={dayLabel}
                          items={days.map(day => ({
                            value: day,
                            label: String(day),
                          }))}
                          value={draft.day}
                          onChange={day => updateDraft({ day })}
                        />
                      </div>
                      <div className="date-picker__column">
                        <span className="date-picker__caption">
                          {monthLabel}
                        </span>
                        <WheelColumn
                          label={monthLabel}
                          items={months.map((month, index) => ({
                            value: index + 1,
                            label: month,
                          }))}
                          value={draft.month}
                          onChange={month => updateDraft({ month })}
                        />
                      </div>
                      <div className="date-picker__column">
                        <span className="date-picker__caption">
                          {yearLabel}
                        </span>
                        <WheelColumn
                          label={yearLabel}
                          items={years.map(year => ({
                            value: year,
                            label: String(year),
                          }))}
                          value={draft.year}
                          onChange={year => updateDraft({ year })}
                        />
                      </div>
                    </div>
                    <div className="date-picker__actions">
                      <Button onClick={apply}>
                        <IconCorrect />
                        {applyLabel}
                      </Button>
                      <Button variant="link" onClick={close}>
                        {cancelLabel}
                      </Button>
                    </div>
                  </div>
                </FloatingFocusManager>
              </div>
            </Portal>
          ) : null}
        </div>
      </FloatingNode>
    );
  },
);

export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(
  function DatePicker(props, ref) {
    return (
      <FloatingLayerTree>
        <DatePickerFrame {...props} ref={ref} />
      </FloatingLayerTree>
    );
  },
);
