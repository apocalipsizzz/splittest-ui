import type { ProgressHTMLAttributes } from 'react';

import { cn } from '@/lib/cn';
import './progress.scss';

export interface ProgressProps extends Omit<
  ProgressHTMLAttributes<HTMLProgressElement>,
  'value'
> {
  /** Доля от `max`. Без подписи: имя задаёт `aria-label` или `<label>`. */
  value: number;
  max?: number;
}

/** Полоска без текста и раскладки. Цвета: `--progress-track` и `--progress-value`. */
export const Progress = ({
  className,
  value,
  max = 100,
  ...props
}: ProgressProps) => (
  <progress
    {...props}
    className={cn('progress', className)}
    max={max}
    value={value}
  />
);
