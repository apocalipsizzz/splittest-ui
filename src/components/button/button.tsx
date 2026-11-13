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

export type ButtonVariant =
  | 'default'
  | 'outline'
  | 'link'
  | 'destructive'
  | 'image'
  | 'icon';
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

const getClassName = (
  variant: ButtonVariant,
  size: ButtonSize,
  fullWidth: boolean,
  loading: boolean,
  className?: string,
) =>
  cn(
    'button',
    className,
    when(variant !== 'default', `button--${variant}`),
    when(size !== 'md', `button--${size}`),
    when(fullWidth, 'button--full-width'),
    when(loading, 'button--loading'),
  );

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
  const {
    variant = 'default',
    size = 'md',
    fullWidth = false,
    loading = false,
    asChild,
    className: classNameProp,
    children,
    ref: propsRef,
    ...domProps
  } = props;
  const className = getClassName(
    variant,
    size,
    fullWidth,
    loading,
    classNameProp,
  );
  const nodeRef = ref ?? propsRef;

  if (asChild) {
    if (!isValidElement(children) || children.type === Fragment) {
      throw new Error('Button с asChild ждёт ровно один React-элемент.');
    }

    const childProps = children.props as ChildElementProps;
    const { disabled, onClick, type, ...childDomProps } =
      domProps as ButtonHTMLAttributes<HTMLButtonElement>;
    const hostButton = children.type === 'button';
    const isBlocked = Boolean(disabled || loading);
    // Нативный disabled — только по явному пропу. На loading браузер унёс бы
    // фокус в body, и объявлять aria-busy стало бы некому.
    const nativelyDisabled = hostButton && Boolean(disabled);
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

    // Клик ребёнка уже внутри handleClick. Слот склеивает оба onClick,
    // поэтому сырой обработчик на элемент не кладём — иначе он сработает дважды.
    const element = cloneElement(
      children as ReactElement<ChildElementProps>,
      { onClick: undefined },
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
        {...(nativelyDisabled ? { disabled: true } : {})}
        {...(loading ? { 'aria-busy': true } : {})}
        {...(isBlocked && !nativelyDisabled ? { 'aria-disabled': true } : {})}
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

  /**
   * `loading` не ставит нативный `disabled`: браузер снимает фокус с
   * выключенного контрола и уносит его в body — клавиатурный пользователь
   * после отправки формы оказывается в начале документа, а `aria-busy`
   * объявлять уже некому. Поэтому гасим клик сами, как в ветке `asChild`
   * и в `Pagination`, а состояние отдаём через `aria-disabled` + `aria-busy`.
   *
   * Оба атрибута уходят условным спредом, а не `aria-busy={loading ||
   * undefined}`: атрибут после спреда затирал бы значение потребителя —
   * `Pagination` гасит `aria-disabled` шаги на краях списка.
   */
  const handleClick: MouseEventHandler<HTMLButtonElement> = event => {
    if (loading) {
      event.preventDefault();
      return;
    }

    onClick?.(event);
  };

  return (
    <button
      {...buttonProps}
      ref={nodeRef as Ref<HTMLButtonElement>}
      className={className}
      type={type}
      disabled={disabled}
      onClick={handleClick}
      {...(loading ? { 'aria-busy': true } : {})}
      {...(loading && !disabled ? { 'aria-disabled': true } : {})}
    >
      {content}
    </button>
  );
}) as ButtonComponent;
