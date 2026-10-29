import {
  forwardRef,
  isValidElement,
  type CSSProperties,
  type ElementType,
  type ForwardedRef,
  type MouseEventHandler,
  type ReactNode,
  type Ref,
} from 'react';

import { cn } from './cn';

interface SlotProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: MouseEventHandler<HTMLElement>;
  disabled?: boolean;
  [key: string]: unknown;
}

type AnyHandler = (...args: unknown[]) => void;

const isHandlerKey = (key: string) => /^on[A-Z]/.test(key);

const asHandler = (value: unknown): AnyHandler | undefined => {
  if (typeof value !== 'function') return undefined;
  return value as AnyHandler;
};

const asClassName = (value: unknown) => {
  if (typeof value === 'string' || typeof value === 'number')
    return String(value);
  return undefined;
};

const asStyle = (value: unknown): CSSProperties | undefined => {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    return undefined;
  return value as CSSProperties;
};

const isPrevented = (event: unknown) =>
  typeof event === 'object' &&
  event !== null &&
  'defaultPrevented' in event &&
  event.defaultPrevented === true;

const composeHandlers = (childHandler: unknown, slotHandler: unknown) => {
  const child = asHandler(childHandler);
  const slot = asHandler(slotHandler);
  if (!child) return slot;
  if (!slot) return child;

  return (...args: unknown[]) => {
    child(...args);
    if (!isPrevented(args[0])) slot(...args);
  };
};

const warnsOnRefRead = (getter: PropertyDescriptor['get']) => {
  if (!getter || !('isReactWarning' in getter)) return false;
  return Boolean((getter as { isReactWarning?: boolean }).isReactWarning);
};

const readRef = (source: object): Ref<HTMLElement> | undefined => {
  if (!('ref' in source)) return undefined;
  const value = (source as { ref?: Ref<HTMLElement> | null }).ref;
  return value ?? undefined;
};

// React 18 кладёт ref на элемент, React 19 — в props. Геттер-заглушка
// ругается при чтении «не той» стороны, поэтому берём ту, что без предупреждения.
const getElementRef = (element: object) => {
  const props =
    'props' in element && element.props && typeof element.props === 'object'
      ? element.props
      : {};
  const propsGetter = Object.getOwnPropertyDescriptor(props, 'ref')?.get;
  if (warnsOnRefRead(propsGetter)) return readRef(element);

  const elementGetter = Object.getOwnPropertyDescriptor(element, 'ref')?.get;
  if (warnsOnRefRead(elementGetter)) return readRef(props);

  return readRef(props) ?? readRef(element);
};

const mergeProps = (
  childProps: Record<string, unknown>,
  slotProps: SlotProps,
) => {
  const merged: Record<string, unknown> = { ...slotProps };

  for (const key of Object.keys(childProps)) {
    if (key === 'ref') continue;

    const childValue = childProps[key];
    const slotValue = slotProps[key];

    if (key === 'className') continue;

    if (key === 'style') {
      merged.style = { ...asStyle(slotValue), ...asStyle(childValue) };
      continue;
    }

    if (key === 'onClick') continue;

    if (isHandlerKey(key)) {
      merged[key] = composeHandlers(childValue, slotValue);
      continue;
    }

    if (
      (key === 'disabled' && slotProps.disabled) ||
      (key === 'aria-busy' && slotProps['aria-busy']) ||
      (key === 'aria-disabled' && slotProps['aria-disabled'])
    ) {
      continue;
    }

    merged[key] = childValue;
  }

  const className = cn(
    asClassName(slotProps.className),
    asClassName(childProps.className),
  );
  if (className) merged.className = className;
  if (slotProps.onClick) merged.onClick = slotProps.onClick;

  return merged;
};

const attachRef = (
  ref: ForwardedRef<HTMLElement> | Ref<HTMLElement> | undefined,
  node: HTMLElement | null,
) => {
  if (typeof ref === 'function') return ref(node);
  if (ref) ref.current = node;
  return undefined;
};

/** Сливает пропы в единственного ребёнка, без своего DOM-узла. Как Radix Slot. */
export const Slot = forwardRef(function Slot(
  props: SlotProps,
  slotRef: ForwardedRef<HTMLElement>,
) {
  const { children, ...slotProps } = props;

  if (!isValidElement(children)) {
    throw new Error('Button с asChild ждёт ровно один React-элемент.');
  }

  const childProps = children.props as Record<string, unknown>;
  const childRef = getElementRef(children);
  const Comp = children.type as ElementType;
  const merged = mergeProps(childProps, slotProps);

  return (
    <Comp
      {...merged}
      ref={(node: HTMLElement | null) => {
        const slotCleanup = attachRef(slotRef, node);
        const childCleanup = attachRef(childRef, node);
        if (
          typeof slotCleanup !== 'function' &&
          typeof childCleanup !== 'function'
        ) {
          return undefined;
        }

        return () => {
          if (typeof slotCleanup === 'function') slotCleanup();
          else attachRef(slotRef, null);
          if (typeof childCleanup === 'function') childCleanup();
          else attachRef(childRef, null);
        };
      }}
    />
  );
});
