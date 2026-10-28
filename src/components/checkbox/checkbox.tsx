import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';

import { useFieldControl } from '@/components/field/field-context';
import { cn, when } from '@/lib/cn';
import './checkbox.scss';

export interface CheckboxInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  /** Красная рамка. Внутри `Field` состоянием ошибки распоряжается он. */
  error?: boolean;
  /** «Выбрать все»: IDL `indeterminate`, React его атрибутом не прокидывает. */
  indeterminate?: boolean;
  /**
   * false — `pointer-events: none` на input (`checkbox__input--no-events`).
   * Клик по лейблу по-прежнему переключает.
   */
  clickable?: boolean;
}

const assignRef = (
  ref: Ref<HTMLInputElement> | null,
  node: HTMLInputElement | null,
) => {
  if (typeof ref === 'function') {
    ref(node);
    return;
  }

  if (ref) ref.current = node;
};

const mergeDescribedBy = (
  fromField: string | undefined,
  fromProps: string | undefined,
) => {
  const value = [fromField, fromProps].filter(part => Boolean(part)).join(' ');
  return value || undefined;
};

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
    const field = useFieldControl();
    const reportValue = field?.reportValue;
    const autoId = useId();
    const inputId = field?.id ?? id ?? autoId;
    const inputRef = useRef<HTMLInputElement>(null);
    const isInvalid = Boolean(error) || Boolean(field?.invalid);

    const setRef = useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        assignRef(ref, node);
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

    const describedBy = field
      ? mergeDescribedBy(field.describedBy, props['aria-describedby'])
      : undefined;

    const fieldAttrs: InputHTMLAttributes<HTMLInputElement> = {};

    if (field?.required) {
      fieldAttrs.required = true;
      fieldAttrs['aria-required'] = true;
    }

    if (isInvalid) fieldAttrs['aria-invalid'] = true;
    if (describedBy) fieldAttrs['aria-describedby'] = describedBy;
    if (field?.errorId) fieldAttrs['aria-errormessage'] = field.errorId;

    return (
      <div className={cn('checkbox', className)}>
        <input
          {...props}
          ref={setRef}
          type="checkbox"
          id={inputId}
          disabled={disabled}
          {...(checked !== undefined ? { checked } : {})}
          onChange={handleChange}
          className={cn(
            'checkbox__input',
            when(!clickable, 'checkbox__input--no-events'),
          )}
          {...fieldAttrs}
        />
        {label ? (
          <label className="checkbox__label" htmlFor={inputId}>
            {label}
          </label>
        ) : null}
      </div>
    );
  },
);
