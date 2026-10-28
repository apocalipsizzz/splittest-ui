import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type Ref,
  type TextareaHTMLAttributes,
} from 'react';

import { useFieldControl } from '@/components/field/field-context';
import { cn, when } from '@/lib/cn';
import './textarea.scss';

export type TextAreaSize = 'sm' | 'md' | 'lg';

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  size?: TextAreaSize;
  recommended?: boolean;
  error?: boolean;
  /** Счётчик остатка при `maxLength`. `false` — то, что в приложении было `noMaxMoty`. */
  counter?: boolean;
}

const assignRef = (
  ref: Ref<HTMLTextAreaElement> | undefined,
  node: HTMLTextAreaElement | null,
) => {
  if (typeof ref === 'function') {
    ref(node);
    return;
  }

  if (ref) ref.current = node;
};

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  function TextArea(
    {
      maxLength,
      value,
      size = 'md',
      recommended,
      error,
      counter = true,
      className,
      id,
      onChange,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref,
  ) {
    const autoId = useId();
    const field = useFieldControl();
    const reportValue = field?.reportValue;
    const textareaId = field?.id ?? id ?? autoId;
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [length, setLength] = useState(0);
    const withCounter = maxLength !== undefined && counter;
    const isInvalid = Boolean(error) || Boolean(field?.invalid);

    const setRef = useCallback(
      (node: HTMLTextAreaElement | null) => {
        textareaRef.current = node;
        assignRef(ref, node);
      },
      [ref],
    );

    /**
     * ponytail: длину счётчик читает из DOM — одинаково для `value` и `defaultValue`,
     * включая автозаполнение. Потолок: reset формы в неконтролируемом режиме счётчик
     * не слышит и догоняет на следующем вводе; апгрейд — слушать `reset`, как `Input`.
     * Тот же проход отдаёт показанную строку в Field.
     */
    useEffect(() => {
      const node = textareaRef.current;
      if (!node) return;

      if (withCounter) setLength(node.value.length);
      reportValue?.(node.value);
    }, [reportValue, value, withCounter]);

    const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
      if (withCounter) setLength(event.target.value.length);
      if (value === undefined) reportValue?.(event.target.value);
      onChange?.(event);
    };

    const counterId = withCounter ? `${textareaId}-counter` : undefined;
    const describedBy = [field?.describedBy, counterId, ariaDescribedBy]
      .filter(part => Boolean(part))
      .join(' ');

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
          {...(value !== undefined ? { value } : {})}
          maxLength={maxLength}
          onChange={handleChange}
          {...(isInvalid ? { 'aria-invalid': true } : {})}
          {...(field?.required
            ? { 'required': true, 'aria-required': true }
            : {})}
          {...(describedBy ? { 'aria-describedby': describedBy } : {})}
          {...(field?.errorId ? { 'aria-errormessage': field.errorId } : {})}
        />
        {withCounter ? (
          <span id={counterId} className="textarea__counter">
            Осталось {Math.max(0, (maxLength ?? 0) - length)} из {maxLength}{' '}
            символов
          </span>
        ) : null}
      </div>
    );
  },
);
