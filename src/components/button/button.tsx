import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type MouseEventHandler,
  type ReactNode,
  type Ref,
} from 'react';

import { IconArrowLeft } from '../../icons/icon-arrow-left';
import { IconArrowRight } from '../../icons/icon-arrow-right';
import { IconSpinner } from '../../icons/icon-spinner';
import { cn, when } from '../../lib/cn';
import './button.scss';

export type ButtonVariant = 'default' | 'outline' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonIcon = 'back' | 'forward';

interface ButtonStyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: ButtonIcon;
  loading?: boolean;
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
  'variant',
  'size',
  'fullWidth',
  'icon',
  'loading',
  'className',
] as const;

const iconSize = {
  sm: 16,
  md: 20,
  lg: 24,
} as const;

const getClassName = ({
  variant = 'default',
  size = 'md',
  fullWidth = false,
  loading = false,
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
    when(loading, 'button--loading'),
  );

const renderGlyph = (
  icon: ButtonIcon | undefined,
  loading: boolean | undefined,
  size: ButtonSize,
) => {
  const px = iconSize[size];

  if (loading) {
    return (
      <IconSpinner
        className="button__icon button__icon--spin"
        width={px}
        height={px}
      />
    );
  }

  if (icon === 'back') {
    return <IconArrowLeft className="button__icon" width={px} height={px} />;
  }

  if (icon === 'forward') {
    return <IconArrowRight className="button__icon" width={px} height={px} />;
  }

  return null;
};

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
  const size = props.size ?? 'md';
  const { icon, loading } = props;
  const className = getClassName(props);
  const { children, href, ...domProps } = omitStyleProps(props);
  const glyph = renderGlyph(icon, loading, size);
  const before = icon !== 'forward';
  const content = (
    <>
      {before ? glyph : null}
      {children}
      {before ? null : glyph}
    </>
  );

  if (typeof href === 'string') {
    const { onClick, ...anchorProps } =
      domProps as AnchorHTMLAttributes<HTMLAnchorElement>;

    const handleClick: MouseEventHandler<HTMLAnchorElement> = event => {
      if (loading) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
    };

    return (
      <a
        ref={ref as Ref<HTMLAnchorElement>}
        href={href}
        className={className}
        {...anchorProps}
        aria-busy={loading || undefined}
        aria-disabled={loading || undefined}
        onClick={handleClick}
      >
        {content}
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
    if (disabled || loading) return;
    onClick?.(event);
  };

  return (
    <button
      ref={ref as Ref<HTMLButtonElement>}
      className={className}
      type={type}
      disabled={disabled}
      {...buttonProps}
      aria-busy={loading || undefined}
      onClick={handleClick}
    >
      {content}
    </button>
  );
});
