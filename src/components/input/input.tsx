import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type MouseEvent,
  type Ref,
} from 'react';

import { useFieldControl } from '@/components/field/field-context';
import { IconCross } from '@/icons/icon-cross';
import { cn, when } from '@/lib/cn';
import './input.scss';

export type InputSize = 'sm' | 'md' | 'lg';

/** Нативный `size` (ширина в символах) занят размером контрола: высоты как у `Button`. */
export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size'
> {
  size?: InputSize;
  recommended?: boolean;
  error?: boolean;
  /** Крестик справа. Появляется, только когда в поле есть значение. */
  clearable?: boolean;
  clearLabel?: string;
  onClear?: () => void;
}

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

const toInputValue = (value: InputHTMLAttributes<HTMLInputElement>['value']) =>
  value == null ? '' : String(value);

/**
 * Прямая запись `input.value` обновляет value-tracker React, и onChange не стреляет.
 * Сеттер прототипа трекер не трогает.
 */
const emitInputValue = (input: HTMLInputElement, next: string) => {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value',
  )?.set;

  setter?.call(input, next);
  input.dispatchEvent(new Event('input', { bubbles: true }));
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    type = 'text',
    size = 'md',
    recommended,
    error,
    clearable = false,
    clearLabel = 'Очистить',
    onClear,
    className,
    disabled,
    readOnly,
    value,
    defaultValue,
    onChange,
    ...props
  },
  ref,
) {
  const field = useFieldControl();
  const reportValue = field?.reportValue;
  const inputRef = useRef<HTMLInputElement>(null);
  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState(() =>
    toInputValue(defaultValue),
  );
  const current = isControlled ? toInputValue(value) : uncontrolledValue;
  const isInvalid = Boolean(error) || Boolean(field?.invalid);
  const describedBy = [field?.describedBy, props['aria-describedby']]
    .filter(part => Boolean(part))
    .join(' ');

  const setRef = useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node;
      assignRef(ref, node);
    },
    [ref],
  );

  useEffect(() => {
    const form = inputRef.current?.form;
    if (!form || isControlled) return;

    // reset всплывает от form вверх и до инпута не доходит
    const handleReset = () => {
      setUncontrolledValue(toInputValue(defaultValue));
    };

    form.addEventListener('reset', handleReset);
    return () => form.removeEventListener('reset', handleReset);
  }, [isControlled, defaultValue]);

  useEffect(() => {
    reportValue?.(current);
  }, [current, reportValue]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setUncontrolledValue(event.target.value);
    onChange?.(event);
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

  const canClear = clearable && !disabled && !readOnly && current !== '';

  return (
    <div className="input__wrap">
      <input
        {...props}
        ref={setRef}
        type={type}
        disabled={disabled}
        readOnly={readOnly}
        {...(isControlled ? { value } : { defaultValue })}
        onChange={handleChange}
        {...(isInvalid ? { 'aria-invalid': true } : {})}
        {...(field ? { id: field.id } : {})}
        {...(field?.required
          ? { 'required': true, 'aria-required': true }
          : {})}
        {...(describedBy ? { 'aria-describedby': describedBy } : {})}
        {...(field?.errorId ? { 'aria-errormessage': field.errorId } : {})}
        className={cn(
          'input',
          className,
          when(size !== 'md', `input--${size}`),
          when(recommended, 'input--recommended'),
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
});
