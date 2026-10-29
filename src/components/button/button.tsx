import {
  cloneElement,
  Fragment,
  forwardRef,
  isValidElement,
  type ButtonHTMLAttributes,
  type ForwardedRef,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';

import { IconSpinner } from '@/icons/icon-spinner';
import { cn, when } from '@/lib/cn';
import { Slot } from '@/lib/slot';
import './button.scss';

export type ButtonVariant = 'default' | 'outline' | 'link' | 'image' | 'icon';
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
  asChild?: false;
  ref?: Ref<HTMLButtonElement> | ((element: HTMLElement | null) => void);
}

export interface ButtonAsChildProps
  extends
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>,
    ButtonStyleProps {
  asChild: true;
  children: ReactElement;
  ref?: Ref<HTMLElement> | ((element: HTMLElement | null) => void);
}

export type ButtonComponentProps = ButtonProps | ButtonAsChildProps;

interface ButtonComponent {
  (props: ButtonAsChildProps): ReactElement | null;
  (props: ButtonProps): ReactElement | null;
}

interface ChildElementProps {
  children?: ReactNode;
  className?: string;
  onClick?: MouseEventHandler<HTMLElement>;
}

const styleKeys = [
  'variant',
  'size',
  'fullWidth',
  'loading',
  'asChild',
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
  ref: ForwardedRef<HTMLElement>,
) {
  const { loading } = props;
  const className = getClassName(props);
  const { children, ref: propsRef, ...domProps } = omitStyleProps(props);
  const nodeRef = ref ?? propsRef;

  if (props.asChild) {
    if (!isValidElement(children) || children.type === Fragment) {
      throw new Error('Button с asChild ждёт ровно один React-элемент.');
    }

    const childProps = children.props as ChildElementProps;
    const { disabled, onClick, type, ...childDomProps } =
      domProps as ButtonHTMLAttributes<HTMLButtonElement>;
    const hostButton = children.type === 'button';
    const isBlocked = Boolean(disabled || loading);
    const handleClick: MouseEventHandler<HTMLElement> = event => {
      if (isBlocked) {
        event.preventDefault();
        return;
      }

      childProps.onClick?.(event);
      if (!event.defaultPrevented) {
        (onClick as MouseEventHandler<HTMLElement> | undefined)?.(event);
      }
    };

    const element = cloneElement(
      children,
      {},
      renderContent(childProps.children, loading),
    );

    return (
      <Slot
        {...childDomProps}
        className={className}
        ref={nodeRef}
        onClick={handleClick}
        {...(type !== undefined || hostButton
          ? { type: type ?? 'button' }
          : {})}
        {...(hostButton && isBlocked ? { disabled: true } : {})}
        {...(loading ? { 'aria-busy': true } : {})}
        {...(!hostButton && isBlocked ? { 'aria-disabled': true } : {})}
      >
        {element}
      </Slot>
    );
  }

  const content = renderContent(children, loading);

  const {
    type = 'button',
    disabled,
    onClick,
    ...buttonProps
  } = domProps as ButtonHTMLAttributes<HTMLButtonElement>;

  return (
    <button
      {...buttonProps}
      ref={nodeRef as Ref<HTMLButtonElement>}
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
