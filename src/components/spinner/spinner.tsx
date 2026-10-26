import type { FC, SVGProps } from 'react';

import { cn, when } from '../../lib/cn';
import styles from './spinner.module.scss';

const spinnerPosition = {
  top: 'top',
  center: 'center',
} as const;

export type SpinnerPosition =
  (typeof spinnerPosition)[keyof typeof spinnerPosition];

export interface SpinnerProps {
  className?: string;
  position?: SpinnerPosition;
}

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

const Dot = ({ begin, rotate }: { begin: string; rotate: number }) => (
  <circle transform={`rotate(${rotate} 16 16)`} cx="16" cy="3" r="0">
    <animate
      attributeName="r"
      values="0;3;0;0"
      dur="1s"
      repeatCount="indefinite"
      begin={begin}
      keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8"
      calcMode="spline"
    />
  </circle>
);

const svgProps: SVGProps<SVGSVGElement> = {
  'xmlns': 'http://www.w3.org/2000/svg',
  'viewBox': '0 0 32 32',
  'width': 64,
  'height': 64,
  'fill': '#ecebeb',
  'aria-hidden': true,
};

export const Spinner: FC<SpinnerProps> = ({
  className,
  position = spinnerPosition.center,
}) => (
  <div
    className={cn(
      styles.spinner,
      className,
      when(position === spinnerPosition.top, styles.top),
    )}
  >
    <svg {...svgProps}>
      {dotDelays.map((begin, index) => (
        <Dot key={begin} begin={begin} rotate={index * 45} />
      ))}
    </svg>
  </div>
);
