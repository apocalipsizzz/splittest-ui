import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/cn';
import './field.scss';

export type FieldListProps = HTMLAttributes<HTMLDivElement>;

/**
 * Стопка полей с одинаковым отступом. Это не группа: для связанных полей
 * с общим вопросом используйте fieldset.
 */
export const FieldList = ({ className, ...props }: FieldListProps) => (
  <div {...props} className={cn('field__list', className)} />
);
