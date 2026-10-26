import { forwardRef, type TextareaHTMLAttributes } from 'react';

import { cn, when } from '../../lib/cn';
import styles from './textarea.module.scss';

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
      <div className={styles.wrap}>
        <textarea
          ref={ref}
          className={cn(
            styles.textarea,
            className,
            when(recommended, styles['textarea--recommended']),
            when(error, styles['textarea--error']),
          )}
          value={value}
          maxLength={maxLength}
          aria-invalid={error || undefined}
          {...props}
        />
        {maxLength && !hideCounter ? (
          <span className={styles.counter}>Максимум {maxLength} символов</span>
        ) : null}
      </div>
    );
  },
);
