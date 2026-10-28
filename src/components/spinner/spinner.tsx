import {
  useId,
  useSyncExternalStore,
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

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

const subscribeReducedMotion = (onChange: () => void) => {
  if (typeof window.matchMedia !== 'function') return () => {};

  const media = window.matchMedia(reducedMotionQuery);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
};

const prefersReducedMotion = () =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia(reducedMotionQuery).matches;

// ponytail: сервер всегда false — гидрация не расходится, но первый кадр после неё может мигнуть SMIL, пока клиент не прочитает matchMedia. Апгрейд: Sec-CH-Prefers-Reduced-Motion.
const prefersReducedMotionServer = () => false;

const dotDelays = [
  '0s',
  '0.125s',
  '0.25s',
  '0.375s',
  '0.5s',
  '0.625s',
  '0.75s',
  '0.875s',
] as const;

const Dot = ({
  begin,
  rotate,
  reduced,
}: {
  begin: string;
  rotate: number;
  reduced: boolean;
}) => (
  <circle
    transform={`rotate(${rotate} 16 16)`}
    cx="16"
    cy="3"
    r={reduced ? 3 : 0}
  >
    {reduced ? null : (
      <animate
        attributeName="r"
        values="0;3;0;0"
        dur="1s"
        repeatCount="indefinite"
        begin={begin}
        keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8"
        calcMode="spline"
      />
    )}
  </circle>
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
  const reduced = useSyncExternalStore(
    subscribeReducedMotion,
    prefersReducedMotion,
    prefersReducedMotionServer,
  );

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
        {dotDelays.map((begin, index) => (
          <Dot
            key={begin}
            begin={begin}
            rotate={index * 45}
            reduced={reduced}
          />
        ))}
      </svg>
    </div>
  );
};
