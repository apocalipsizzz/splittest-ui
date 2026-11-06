import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';

import { useFieldControlProps } from '@/components/field/use-field-control-props';
import { cn, when } from '@/lib/cn';
import { composeRefs } from '@/lib/compose-refs';
import './checkbox.scss';

export interface CheckboxInputProps extends InputHTMLAttributes<HTMLInputElement> {
  /**
   * Текст рядом с квадратом. Имя инпута — `aria-labelledby` на этом тексте.
   * Клик по тексту переключает. Ссылка внутри остаётся ссылкой:
   * свои `target` и `rel`, Ctrl/⌘ и средняя кнопка не перехватываются.
   */
  label?: ReactNode;
  /** Красная рамка. Внутри `Field` состоянием ошибки распоряжается он. */
  error?: boolean;
  /** «Выбрать все»: IDL `indeterminate`, React его атрибутом не прокидывает. */
  indeterminate?: boolean;
  /**
   * false — `pointer-events: none` на квадрате (`checkbox__input--no-events`).
   * Клик по тексту по-прежнему переключает.
   */
  clickable?: boolean;
}

export const CheckboxInput = forwardRef<HTMLInputElement, CheckboxInputProps>(
  function CheckboxInput(
    {
      className,
      id,
      label,
      error,
      disabled,
      clickable = true,
      indeterminate = false,
      checked,
      onChange,
      ...props
    },
    ref,
  ) {
    const { field, isInvalid, controlProps } = useFieldControlProps({
      error,
      describedBy: [props['aria-describedby']],
    });
    const autoId = useId();
    // Свой id важнее id поля: несколько чекбоксов в одном Field иначе
    // получают один и тот же, и клик по любому лейблу бьёт в первый.
    const inputId = id ?? field?.id ?? autoId;
    const captionId = label ? `${inputId}-caption` : undefined;
    const inputRef = useRef<HTMLInputElement>(null);
    const reportValue = field?.reportValue;

    const setRef = useCallback(
      (node: HTMLInputElement | null) => {
        composeRefs(inputRef, ref)(node);
      },
      [ref],
    );

    useEffect(() => {
      if (inputRef.current) inputRef.current.indeterminate = indeterminate;
    }, [indeterminate]);

    // Field ждёт строку: отдаём то же, что ушло бы в FormData — 'on' или пусто.
    useEffect(() => {
      const node = inputRef.current;
      if (node) reportValue?.(node.checked ? 'on' : '');
    }, [checked, reportValue]);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      if (checked === undefined) {
        reportValue?.(event.target.checked ? 'on' : '');
      }
      onChange?.(event);
    };

    return (
      <div className={cn('checkbox', className)}>
        <label
          className={cn(
            'checkbox__box',
            when(!clickable, 'checkbox__box--no-events'),
          )}
          htmlFor={inputId}
        >
          <input
            {...props}
            ref={setRef}
            type="checkbox"
            id={inputId}
            disabled={disabled}
            {...(checked !== undefined ? { checked } : {})}
            {...(captionId ? { 'aria-labelledby': captionId } : {})}
            onChange={handleChange}
            className={cn(
              'checkbox__input',
              when(!clickable, 'checkbox__input--no-events'),
            )}
            {...controlProps}
            data-invalid={isInvalid || undefined}
            data-disabled={disabled || undefined}
          />
        </label>
        {label ? (
          <label id={captionId} className="checkbox__label" htmlFor={inputId}>
            {label}
          </label>
        ) : null}
      </div>
    );
  },
);
