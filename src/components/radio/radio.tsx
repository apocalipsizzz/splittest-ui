import { forwardRef, useId, type InputHTMLAttributes } from 'react';

import { cn, when } from '../../lib/cn';
import './radio.scss';

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
      <div className={cn('radio', className, when(error, 'radio--error'))}>
        <input
          ref={ref}
          type="radio"
          id={inputId}
          disabled={disabled}
          className="radio__input"
          {...props}
        />
        {title ? (
          <label className="radio__label" htmlFor={inputId}>
            {title}
          </label>
        ) : null}
      </div>
    );
  },
);
