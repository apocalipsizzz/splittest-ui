import {
  useId,
  type CSSProperties,
  type FC,
  type HTMLAttributes,
  type SVGProps,
} from 'react';

import { cn, when } from '@/lib/cn';
import './spinner.scss';

const spinnerPosition = {
  top: 'top',
  center: 'center',
} as const;

export type SpinnerPosition =
  (typeof spinnerPosition)[keyof typeof spinnerPosition];

export interface SpinnerProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'size' | 'position'
> {
  size?: number;
  position?: SpinnerPosition;
  /** Текст для скринридера. Виден только ему. */
  label?: string;
}

const DOTS = 8;

/**
 * Анимацию ведёт CSS, а не SMIL: `prefers-reduced-motion` тогда разбирает
 * браузер до первой отрисовки — без хука, без серверного снапшота и без
 * кадра с движением сразу после гидрации.
 */
const Dot = ({ index }: { index: number }) => (
  <g transform={`rotate(${index * (360 / DOTS)} 16 16)`}>
    <circle
      className="spinner__dot"
      style={{ '--spinner-dot-delay': `${index / DOTS}s` } as CSSProperties}
      cx="16"
      cy="3"
      r="3"
    />
  </g>
);

const svgProps: SVGProps<SVGSVGElement> = {
  'xmlns': 'http://www.w3.org/2000/svg',
  'viewBox': '0 0 32 32',
  'fill': 'var(--color-muted)',
  'aria-hidden': true,
};

export const Spinner: FC<SpinnerProps> = ({
  className,
  position = spinnerPosition.center,
  size = 64,
  label = 'Загрузка',
  ...props
}) => {
  const labelId = useId();

  return (
    <div
      {...props}
      // eslint-disable-next-line jsx-a11y/prefer-tag-over-role -- live region, не <output>
      role="status"
      aria-labelledby={labelId}
      className={cn(
        'spinner',
        className,
        when(position === spinnerPosition.top, 'spinner--top'),
      )}
    >
      <span id={labelId} className="spinner__label">
        {label}
      </span>
      <svg {...svgProps} width={size} height={size}>
        {Array.from({ length: DOTS }, (_, index) => (
          <Dot key={index} index={index} />
        ))}
      </svg>
    </div>
  );
};
