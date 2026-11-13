import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
} from 'react';

import { useFieldControlProps } from '@/components/field/use-field-control-props';
import { cn, when } from '@/lib/cn';
import { composeRefs } from '@/lib/compose-refs';
import { InputClearButton } from './input-clear-button';
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
  /** Без `div.input__wrap`. Крестик от этой обёртки и позиционируется, с `noWrap` он не рисуется. */
  noWrap?: boolean;
  clearLabel?: string;
  onClear?: () => void;
}

const toInputValue = (value: InputHTMLAttributes<HTMLInputElement>['value']) =>
  value == null ? '' : String(value);

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    type = 'text',
    size = 'md',
    recommended,
    error,
    clearable = false,
    noWrap = false,
    clearLabel = 'Очистить',
    onClear,
    className,
    disabled,
    readOnly,
    value,
    defaultValue,
    onChange,
    id,
    ...props
  },
  ref,
) {
  const { field, isInvalid, controlProps } = useFieldControlProps({
    error,
    describedBy: [props['aria-describedby']],
  });
  const reportValue = field?.reportValue;
  const inputRef = useRef<HTMLInputElement>(null);
  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState(() =>
    toInputValue(defaultValue),
  );
  const current = isControlled ? toInputValue(value) : uncontrolledValue;

  const setRef = useCallback(
    (node: HTMLInputElement | null) => {
      composeRefs(inputRef, ref)(node);
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

  const canClear =
    clearable && !noWrap && !disabled && !readOnly && current !== '';
  // Свой id важнее id поля: несколько инпутов в одном Field иначе получают один и тот же.
  const inputId = id ?? field?.id;

  const input = (
    <input
      {...props}
      ref={setRef}
      type={type}
      disabled={disabled}
      readOnly={readOnly}
      {...(isControlled ? { value } : { defaultValue })}
      onChange={handleChange}
      {...controlProps}
      id={inputId}
      data-invalid={isInvalid || undefined}
      data-disabled={disabled || undefined}
      className={cn(
        'input',
        className,
        when(size !== 'md', `input--${size}`),
        when(recommended, 'input--recommended'),
        when(isInvalid, 'input--error'),
        when(
          clearable && !noWrap && !disabled && !readOnly,
          'input--clearable',
        ),
      )}
    />
  );

  if (noWrap) return input;

  return (
    <div className="input__wrap">
      {input}
      {canClear ? (
        <InputClearButton
          inputRef={inputRef}
          label={clearLabel}
          onClear={onClear}
        />
      ) : null}
    </div>
  );
});
