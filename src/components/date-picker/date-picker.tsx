import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';

import { Button } from '@/components/button';
import { Input } from '@/components/input';
import '../input/input.scss';
import { IconCalendar } from '@/icons/icon-calendar';
import { IconCorrect } from '@/icons/icon-correct';
import { cn } from '@/lib/cn';
import { WheelColumn } from './wheel-column';
import './date-picker.scss';

const MONTH_NAMES = [
  'январь',
  'февраль',
  'март',
  'апрель',
  'май',
  'июнь',
  'июль',
  'август',
  'сентябрь',
  'октябрь',
  'ноябрь',
  'декабрь',
];

// В дате пишется родительный падеж: «15 марта 1990».
const MONTH_NAMES_GENITIVE = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];

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

const formatDate = (date: Date) =>
  `${date.getDate()} ${MONTH_NAMES_GENITIVE[date.getMonth()]} ${date.getFullYear()}`;

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

export interface DatePickerProps {
  value?: Date | null;
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
  /** Заголовок окна выбора. */
  title?: string;
  error?: boolean;
  className?: string;
}

/**
 * Выбор даты: поле открывает нижний лист с выбором дня, месяца и года.
 * Поле только для чтения с клавиатуры, поэтому `required` из `Field` и
 * нативная проверка формы работают, а телефонная клавиатура не открывается.
 */
export const DatePicker = ({
  value,
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
}: DatePickerProps) => {
  const [today] = useState(() => new Date());
  const [open, setOpen] = useState(false);
  const maxBirth = maxAllowedDate(minAge, today);
  const lastYear = Math.min(
    maxYear ?? today.getFullYear(),
    maxBirth.getFullYear(),
  );
  const [draft, setDraft] = useState<DateParts>(() =>
    clampParts(partsOf(value ?? maxBirth), maxBirth),
  );
  const triggerRef = useRef<HTMLInputElement>(null);
  const sheetRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  const years = range(Math.min(minYear, draft.year), lastYear);
  const days = range(1, daysInMonth(draft.year, draft.month));

  // iOS: без position: fixed фон прокручивается под открытым листом.
  useEffect(() => {
    if (!open) return;

    const { position, top, width } = document.body.style;
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    sheetRef.current
      ?.querySelector<HTMLElement>('[role="spinbutton"]')
      ?.focus();

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return;

      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.position = position;
      document.body.style.top = top;
      document.body.style.width = width;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  const openSheet = () => {
    if (disabled) return;

    setDraft(clampParts(partsOf(value ?? maxBirth), maxBirth));
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const updateDraft = (patch: Partial<DateParts>) => {
    setDraft(prev => clampParts({ ...prev, ...patch }, maxBirth));
  };

  const apply = () => {
    onChange?.(toDate(draft));
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
    <div className={cn('date-picker', className)}>
      <Input
        ref={triggerRef}
        className="date-picker__trigger"
        value={value ? formatDate(value) : ''}
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

      {open
        ? createPortal(
            <div className="date-picker__layer">
              <button
                type="button"
                className="date-picker__mask"
                aria-label="Закрыть"
                onClick={close}
              />
              <dialog
                ref={sheetRef}
                open
                aria-modal="true"
                aria-labelledby={titleId}
                className="date-picker__sheet"
              >
                <h2 id={titleId} className="date-picker__title">
                  {title}
                </h2>
                <div className="date-picker__columns">
                  <div className="date-picker__column">
                    <span className="date-picker__caption">День</span>
                    <WheelColumn
                      label="День"
                      items={days.map(day => ({
                        value: day,
                        label: String(day),
                      }))}
                      value={draft.day}
                      onChange={day => updateDraft({ day })}
                    />
                  </div>
                  <div className="date-picker__column">
                    <span className="date-picker__caption">Месяц</span>
                    <WheelColumn
                      label="Месяц"
                      items={MONTH_NAMES.map((month, index) => ({
                        value: index + 1,
                        label: month,
                      }))}
                      value={draft.month}
                      onChange={month => updateDraft({ month })}
                    />
                  </div>
                  <div className="date-picker__column">
                    <span className="date-picker__caption">Год</span>
                    <WheelColumn
                      label="Год"
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
                    Применить
                  </Button>
                  <Button variant="link" onClick={close}>
                    Отмена
                  </Button>
                </div>
              </dialog>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
};
