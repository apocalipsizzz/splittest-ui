import { forwardRef, useId, type InputHTMLAttributes } from 'react';

import { cn, when } from '../../lib/cn';
import styles from './radio.module.scss';

export interface RadioInputProps extends InputHTMLAttributes<HTMLInputElement> {
  title?: string;
  error?: boolean;
}

export const RadioInput = forwardRef<HTMLInputElement, RadioInputProps>(
  function RadioInput(
    { id, className, title, error, disabled, ...props },
    ref,
  ) {
    const autoId = useId();
    const inputId = id ?? autoId;

    return (
      <div className={cn(styles.radio, className)}>
        <input
          ref={ref}
          type="radio"
          id={inputId}
          disabled={disabled}
          className={cn(styles.input, when(error, styles.error))}
          {...props}
        />
        {title ? (
          <label className={styles.label} htmlFor={inputId}>
            {title}
          </label>
        ) : null}
      </div>
    );
  },
);
