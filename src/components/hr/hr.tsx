import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/cn';
import './hr.scss';

export interface HRProps extends Omit<
  HTMLAttributes<HTMLHRElement>,
  'children'
> {
  className?: string;
}

/** Горизонтальный разделитель. Отступы задаёт сам компонент, переопределяются через `className`. */
export const HR = ({ className, ...props }: HRProps) => (
  <hr {...props} className={cn('hr', className)} />
);
