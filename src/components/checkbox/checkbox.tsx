import { forwardRef, useId, type InputHTMLAttributes } from 'react';

import { cn, when } from '../../lib/cn';
import styles from './checkbox.module.scss';

export interface CheckboxInputProps extends InputHTMLAttributes<HTMLInputElement> {
  title?: string;
  hide?: boolean;
  withCursor?: boolean;
}

export const CheckboxInput = forwardRef<HTMLInputElement, CheckboxInputProps>(
  function CheckboxInput(
    { className, id, title, hide, disabled, withCursor = true, ...props },
    ref,
  ) {
    const autoId = useId();
    const inputId = id ?? autoId;

    return (
      <div className={cn(styles.checkbox, className, when(hide, styles.hide))}>
        <input
          ref={ref}
          type="checkbox"
          id={inputId}
          disabled={disabled}
          className={cn(styles.input, when(!withCursor, styles.noEvents))}
          {...props}
        />
        {title ? (
          <label className={styles.label} htmlFor={inputId}>
            {title.replaceAll('-', '–')}
          </label>
        ) : null}
      </div>
    );
  },
);
