import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type TextareaHTMLAttributes,
} from 'react';

import {
  joinDescribedBy,
  useFieldControlProps,
} from '@/components/field/use-field-control-props';
import { cn, when } from '@/lib/cn';
import { composeRefs } from '@/lib/compose-refs';
import './textarea.scss';

export type TextAreaSize = 'sm' | 'md' | 'lg';

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  size?: TextAreaSize;
  recommended?: boolean;
  error?: boolean;
  /** Счётчик остатка при `maxLength`. `false` — то, что в приложении было `noMaxMoty`. */
  counter?: boolean;
  /** Текст счётчика. `left` — сколько символов ещё можно ввести. */
  counterLabel?: (left: number, max: number) => string;
}

const defaultCounterLabel = (left: number, max: number) =>
  `Осталось ${left} из ${max} символов`;

const toTextValue = (
  value: TextareaHTMLAttributes<HTMLTextAreaElement>['value'],
) => (value == null ? '' : String(value));

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  function TextArea(
    {
      maxLength,
      value,
      size = 'md',
      recommended,
      error,
      counter = true,
      counterLabel = defaultCounterLabel,
      className,
      id,
      onChange,
      defaultValue,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref,
  ) {
    const autoId = useId();
    const { field, isInvalid, controlProps } = useFieldControlProps({ error });
    const reportValue = field?.reportValue;
    const textareaId = id ?? field?.id ?? autoId;
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [length, setLength] = useState(0);
    const withCounter = maxLength !== undefined && counter;
    // Счётчик стоит между ошибкой поля и своим aria-describedby.
    const describedBy = joinDescribedBy(
      field?.describedBy,
      withCounter ? `${textareaId}-counter` : undefined,
      ariaDescribedBy,
    );

    const setRef = useCallback(
      (node: HTMLTextAreaElement | null) => {
        composeRefs(textareaRef, ref)(node);
      },
      [ref],
    );

    /**
     * Длину счётчик читает из DOM — одинаково для `value` и `defaultValue`,
     * включая автозаполнение. Тот же проход отдаёт показанную строку в Field.
     */
    useEffect(() => {
      const node = textareaRef.current;
      if (!node) return;

      if (withCounter) setLength(node.value.length);
      reportValue?.(node.value);
    }, [reportValue, value, withCounter]);

    // reset всплывает от form вверх и до textarea не доходит.
    useEffect(() => {
      const form = textareaRef.current?.form;
      if (!form || value !== undefined) return;

      const handleReset = () => {
        const next = toTextValue(defaultValue);
        if (withCounter) setLength(next.length);
        reportValue?.(next);
      };

      form.addEventListener('reset', handleReset);
      return () => form.removeEventListener('reset', handleReset);
    }, [defaultValue, reportValue, value, withCounter]);

    const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
      if (withCounter) setLength(event.target.value.length);
      if (value === undefined) reportValue?.(event.target.value);
      onChange?.(event);
    };

    const counterId = withCounter ? `${textareaId}-counter` : undefined;

    return (
      <div className="textarea__wrap">
        <textarea
          {...props}
          ref={setRef}
          id={textareaId}
          className={cn(
            'textarea',
            className,
            when(size !== 'md', `textarea--${size}`),
            when(recommended, 'textarea--recommended'),
            when(isInvalid, 'textarea--error'),
          )}
          {...(value !== undefined ? { value } : { defaultValue })}
          maxLength={maxLength}
          onChange={handleChange}
          {...controlProps}
          data-invalid={isInvalid || undefined}
          data-disabled={props.disabled || undefined}
          {...(describedBy ? { 'aria-describedby': describedBy } : {})}
        />
        {withCounter ? (
          <span id={counterId} className="textarea__counter">
            {counterLabel(
              Math.max(0, (maxLength ?? 0) - length),
              maxLength ?? 0,
            )}
          </span>
        ) : null}
      </div>
    );
  },
);
