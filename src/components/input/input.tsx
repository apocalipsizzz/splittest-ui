import { forwardRef, type InputHTMLAttributes } from 'react';

import { cn, when } from '../../lib/cn';
import './input.scss';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  recommended?: boolean;
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { type = 'text', recommended, error, className, disabled, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      disabled={disabled}
      aria-invalid={error || undefined}
      className={cn(
        'input',
        className,
        when(recommended, 'input--recommended'),
        when(error, 'input--error'),
      )}
      {...props}
    />
  );
});
