import { forwardRef, type TextareaHTMLAttributes } from 'react';

import { cn, when } from '../../lib/cn';
import './textarea.scss';

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  recommended?: boolean;
  error?: boolean;
  /** В приложении проп называется `noMaxMoty`. */
  hideCounter?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  function TextArea(
    {
      maxLength,
      value = '',
      recommended,
      error,
      hideCounter = false,
      className,
      ...props
    },
    ref,
  ) {
    return (
      <div className="textarea__wrap">
        <textarea
          ref={ref}
          className={cn(
            'textarea',
            className,
            when(recommended, 'textarea--recommended'),
            when(error, 'textarea--error'),
          )}
          value={value}
          maxLength={maxLength}
          aria-invalid={error || undefined}
          {...props}
        />
        {maxLength && !hideCounter ? (
          <span className="textarea__counter">
            Максимум {maxLength} символов
          </span>
        ) : null}
      </div>
    );
  },
);
