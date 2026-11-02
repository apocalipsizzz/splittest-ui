import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type InputHTMLAttributes,
  type MouseEvent,
  type Ref,
} from 'react';
import { IMaskInput } from 'react-imask';

import { useFieldControl } from '@/components/field/field-context';
import type { InputSize } from '@/components/input';
import { IconCross } from '@/icons/icon-cross';
import { cn, when } from '@/lib/cn';
import '../input/input.scss';

export const PHONE_MASK = '+7 (000) 000-00-00';

/**
 * Плейсхолдер в виде маски: цифры маски заменяются на «_», литералы остаются.
 * Это атрибут placeholder, а не значение, поэтому required и FormData не меняются.
 */
export const maskPlaceholder = (mask: string) => mask.replace(/[09]/g, '_');

const assignRef = (
  ref: Ref<HTMLInputElement> | undefined,
  node: HTMLInputElement | null,
) => {
  if (typeof ref === 'function') {
    ref(node);
    return;
  }

  if (ref) ref.current = node;
};

/**
 * Прямая запись `input.value` обходит react-imask, поэтому значение пишем через
 * сеттер прототипа и шлём `input`: маска сама обновится и вызовет onAccept.
 */
const emitInputValue = (input: HTMLInputElement, next: string) => {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value',
  )?.set;

  setter?.call(input, next);
  input.dispatchEvent(new Event('input', { bubbles: true }));
};

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
 * Телефон на react-imask. Внутри `Field` берёт id, required и ошибку у поля,
 * а в `reportValue` отдаёт цифры, чтобы пустое значение считалось пустым.
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
    const field = useFieldControl();
    const reportValue = field?.reportValue;
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [uncontrolledFilled, setUncontrolledFilled] = useState(
      () => defaultValue !== undefined && defaultValue !== '',
    );
    const isInvalid = Boolean(error) || Boolean(field?.invalid);
    const hasValue = value !== undefined ? value !== '' : uncontrolledFilled;
    const canClear = clearable && !disabled && !readOnly && hasValue;
    const describedBy = [field?.describedBy, ariaDescribedBy]
      .filter(part => Boolean(part))
      .join(' ');

    const setRef = useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        assignRef(ref, node);
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
          inputRef={setRef}
          value={value}
          defaultValue={defaultValue}
          onAccept={handleAccept}
          disabled={disabled}
          readOnly={readOnly}
          {...(field ? { id: field.id } : { id })}
          {...(field?.required
            ? { 'required': true, 'aria-required': true }
            : {})}
          {...(isInvalid ? { 'aria-invalid': true } : {})}
          {...(describedBy ? { 'aria-describedby': describedBy } : {})}
          {...(field?.errorId ? { 'aria-errormessage': field.errorId } : {})}
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
