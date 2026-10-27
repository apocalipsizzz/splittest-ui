import { forwardRef, useId, type InputHTMLAttributes } from 'react';

import { cn, when } from '../../lib/cn';
import './checkbox.scss';

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
      <div className={cn('checkbox', className, when(hide, 'checkbox--hide'))}>
        <input
          ref={ref}
          type="checkbox"
          id={inputId}
          disabled={disabled}
          className={cn(
            'checkbox__input',
            when(!withCursor, 'checkbox__input--no-events'),
          )}
          {...props}
        />
        {title ? (
          <label className="checkbox__label" htmlFor={inputId}>
            {title.replaceAll('-', '–')}
          </label>
        ) : null}
      </div>
    );
  },
);
