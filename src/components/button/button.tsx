import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type MouseEventHandler,
  type ReactNode,
  type Ref,
} from 'react';

import { cn, when } from '../../lib/cn';
import './button.scss';

export type ButtonVariant = 'default' | 'outline' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonStyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
  children?: ReactNode;
}

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonStyleProps {
  href?: undefined;
}

export interface ButtonLinkProps
  extends
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>,
    ButtonStyleProps {
  href: string;
}

export type ButtonComponentProps = ButtonProps | ButtonLinkProps;

const styleKeys = ['variant', 'size', 'fullWidth', 'className'] as const;

const getClassName = ({
  variant = 'default',
  size = 'md',
  fullWidth = false,
  className,
  disabled,
}: ButtonStyleProps & { disabled?: boolean }) =>
  cn(
    'button',
    className,
    `button--${variant}`,
    `button--${size}`,
    when(fullWidth, 'button--full-width'),
    when(disabled, 'button--disabled'),
  );

const omitStyleProps = <T extends ButtonStyleProps>(
  props: T,
): Omit<T, (typeof styleKeys)[number]> => {
  const next: Record<string, unknown> = {};
  const skipped = new Set<string>(styleKeys);

  for (const [key, value] of Object.entries(props)) {
    if (!skipped.has(key)) next[key] = value;
  }

  return next as Omit<T, (typeof styleKeys)[number]>;
};

export const Button = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonComponentProps
>(function Button(props, ref) {
  const className = getClassName(props);
  const { children, href, ...domProps } = omitStyleProps(props);

  if (typeof href === 'string') {
    return (
      <a
        ref={ref as Ref<HTMLAnchorElement>}
        href={href}
        className={className}
        {...(domProps as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </a>
    );
  }

  const {
    type = 'button',
    disabled,
    onClick,
    ...buttonProps
  } = domProps as ButtonHTMLAttributes<HTMLButtonElement>;

  const handleClick: MouseEventHandler<HTMLButtonElement> = event => {
    if (disabled) return;
    onClick?.(event);
  };

  return (
    <button
      ref={ref as Ref<HTMLButtonElement>}
      className={className}
      type={type}
      disabled={disabled}
      onClick={handleClick}
      {...buttonProps}
    >
      {children}
    </button>
  );
});
