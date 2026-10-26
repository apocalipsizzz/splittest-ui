import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type MouseEventHandler,
  type ReactNode,
  type Ref,
} from 'react';

import { cn, when } from '../../lib/cn';
import styles from './button.module.scss';

interface ButtonStyleProps {
  outline?: boolean;
  /** В приложении по умолчанию true: левый паддинг под иконку. */
  withIcon?: boolean;
  fullWidth?: boolean;
  /** Визуальный вес ссылки (font-weight: 400), не тип элемента. */
  link?: boolean;
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

const styleKeys = [
  'outline',
  'withIcon',
  'fullWidth',
  'link',
  'className',
] as const;

const getClassName = ({
  withIcon = true,
  outline,
  className,
  fullWidth = false,
  link = false,
  disabled,
}: ButtonStyleProps & { disabled?: boolean }) =>
  cn(
    styles.button,
    className,
    when(outline, styles.outline),
    when(withIcon, styles.withIcon),
    when(fullWidth, styles.fullWidth),
    when(link, styles.link),
    when(disabled, styles.disabled),
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
