import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type InputHTMLAttributes,
  type MouseEvent,
} from 'react';
import { IMaskInput } from 'react-imask';

import { useFieldControlProps } from '@/components/field/use-field-control-props';
import type { InputSize } from '@/components/input';
import { IconCross } from '@/icons/icon-cross';
import { cn, when } from '@/lib/cn';
import { composeRefs } from '@/lib/compose-refs';
import { emitInputValue } from '@/lib/emit-input-value';
import '../input/input.scss';

/**
 * Российский номер. Первая цифра — `#`, не `0`: 7 и 8 в неё не входят.
 * Иначе набор «8999…» становится `+7 (899) 9…`, последняя цифра отрезается
 * и СМС уходит на другой номер. Набранная в начале 7 остаётся кодом страны.
 */
export const PHONE_MASK = '+7 (#00) 000-00-00';

/** Как в прежней маске: 0–6 и 9. 7 — код страны, 8 — междугородний префикс. */
const PHONE_DEFINITIONS = {
  '#': /[01234569]/,
};

/**
 * Плейсхолдер в виде маски: слоты цифр (`0`, `9`, `#`) заменяются на «_»,
 * литералы остаются. Это атрибут placeholder, а не значение, поэтому
 * required и FormData не меняются.
 */
export const maskPlaceholder = (mask: string) => mask.replace(/[09#]/g, '_');

export interface PhoneInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'type' | 'value' | 'defaultValue' | 'onChange'
> {
  /** Маска из react-imask. По умолчанию — российский номер. */
  mask?: string;
  /** По умолчанию показывает маску вроде «+7 (___) ___-__-__». */
  placeholder?: string;
  /** Маскированное значение, как в `input`. Пустая строка очищает поле. */
  value?: string;
  defaultValue?: string;
  size?: InputSize;
  error?: boolean;
  /** Крестик справа. Появляется, только когда в поле есть значение. */
  clearable?: boolean;
  clearLabel?: string;
  /** Вызывается после очистки крестиком; `onAccept` получит пустые значения. */
  onClear?: () => void;
  /** Вызывается на каждый ввод: `value` — с маской, `unmaskedValue` — только цифры. */
  onAccept?: (value: string, unmaskedValue: string) => void;
}

/**
 * Телефон на react-imask. Внутри `Field` берёт required и ошибку у поля.
 * Свой `id` важнее id поля. В `reportValue` уходят цифры, чтобы пустое
 * значение считалось пустым.
 */
export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  function PhoneInput(
    {
      mask = PHONE_MASK,
      placeholder = maskPlaceholder(mask),
      value,
      defaultValue,
      size = 'md',
      error,
      clearable = false,
      clearLabel = 'Очистить',
      onClear,
      className,
      id,
      disabled,
      readOnly,
      onAccept,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref,
  ) {
    const { field, isInvalid, controlProps } = useFieldControlProps({
      error,
      describedBy: [ariaDescribedBy],
    });
    const reportValue = field?.reportValue;
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [uncontrolledFilled, setUncontrolledFilled] = useState(
      () => defaultValue !== undefined && defaultValue !== '',
    );
    const hasValue = value !== undefined ? value !== '' : uncontrolledFilled;
    const canClear = clearable && !disabled && !readOnly && hasValue;

    const setRef = useCallback(
      (node: HTMLInputElement | null) => {
        composeRefs(inputRef, ref)(node);
      },
      [ref],
    );

    // Сброс снаружи (value='') не проходит через onAccept, поэтому сообщаем здесь.
    useEffect(() => {
      if (value === '') reportValue?.('');
    }, [value, reportValue]);

    const handleAccept = (
      nextValue: string,
      maskRef: { unmaskedValue: string },
    ) => {
      setUncontrolledFilled(maskRef.unmaskedValue !== '');
      reportValue?.(maskRef.unmaskedValue);
      onAccept?.(nextValue, maskRef.unmaskedValue);
    };

    const handleClearMouseDown = (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
    };

    const handleClear = () => {
      const input = inputRef.current;
      if (!input) return;

      emitInputValue(input, '');
      onClear?.();
      input.focus();
    };

    return (
      <div className="input__wrap">
        <IMaskInput
          {...props}
          type="tel"
          placeholder={placeholder}
          inputMode="tel"
          autoComplete="tel"
          mask={mask}
          {...(mask === PHONE_MASK ? { definitions: PHONE_DEFINITIONS } : {})}
          inputRef={setRef}
          value={value}
          defaultValue={defaultValue}
          onAccept={handleAccept}
          disabled={disabled}
          readOnly={readOnly}
          {...controlProps}
          id={id ?? field?.id}
          className={cn(
            'input',
            className,
            when(size !== 'md', `input--${size}`),
            when(isInvalid, 'input--error'),
            when(clearable && !disabled && !readOnly, 'input--clearable'),
          )}
        />
        {canClear ? (
          <button
            type="button"
            className="input__clear"
            aria-label={clearLabel}
            onMouseDown={handleClearMouseDown}
            onClick={handleClear}
          >
            <IconCross width={16} height={16} />
          </button>
        ) : null}
      </div>
    );
  },
);
