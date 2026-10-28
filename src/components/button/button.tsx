import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ForwardedRef,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefAttributes,
} from 'react';

import { IconSpinner } from '@/icons/icon-spinner';
import { cn, when } from '@/lib/cn';
import './button.scss';

export type ButtonVariant = 'default' | 'outline' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonStyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
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

interface ButtonComponent {
  (
    props: ButtonLinkProps & RefAttributes<HTMLAnchorElement>,
  ): ReactElement | null;
  (props: ButtonProps & RefAttributes<HTMLButtonElement>): ReactElement | null;
}

const styleKeys = [
  'variant',
  'size',
  'fullWidth',
  'loading',
  'className',
] as const;

const getClassName = ({
  variant = 'default',
  size = 'md',
  fullWidth = false,
  loading = false,
  className,
}: ButtonStyleProps) =>
  cn(
    'button',
    className,
    when(variant !== 'default', `button--${variant}`),
    when(size !== 'md', `button--${size}`),
    when(fullWidth, 'button--full-width'),
    when(loading, 'button--loading'),
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

const renderContent = (children: ReactNode, loading?: boolean) => {
  if (!loading) return children;

  return (
    <>
      <span className="button__label">{children}</span>
      <span className="button__spinner">
        <IconSpinner className="button__icon--spin" />
      </span>
    </>
  );
};

// forwardRef остаётся: в React 18 ref ещё не обычный проп, peer — ^18.3 || ^19.
export const Button = forwardRef(function Button(
  props: ButtonComponentProps,
  ref: ForwardedRef<HTMLButtonElement | HTMLAnchorElement>,
) {
  const { loading } = props;
  const className = getClassName(props);
  const { children, href, ...domProps } = omitStyleProps(props);
  const content = renderContent(children, loading);

  if (typeof href === 'string') {
    const anchorProps = domProps as AnchorHTMLAttributes<HTMLAnchorElement>;
    const handleClick: MouseEventHandler<HTMLAnchorElement> = event => {
      event.preventDefault();
    };

    return (
      <a
        {...anchorProps}
        ref={ref as Ref<HTMLAnchorElement>}
        className={className}
        aria-busy={loading || undefined}
        // Ссылку нельзя выключить нативно: клик гасим, состояние объявляем.
        aria-disabled={loading || undefined}
        onClick={loading ? handleClick : anchorProps.onClick}
        href={href}
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

  return (
    <button
      {...buttonProps}
      ref={ref as Ref<HTMLButtonElement>}
      className={className}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      aria-busy={loading || undefined}
    >
      {content}
    </button>
  );
}) as ButtonComponent;
