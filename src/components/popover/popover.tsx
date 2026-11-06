import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingNode,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useFloatingNodeId,
  useInteractions,
  useMergeRefs,
  useRole,
  type Placement,
} from '@floating-ui/react';
import {
  forwardRef,
  isValidElement,
  useMemo,
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';

import { Button } from '@/components/button';
import { IconClose } from '@/icons/icon-close';
import { cn } from '@/lib/cn';
import { FloatingLayerTree } from '@/lib/floating-layer';
import { useControllableState } from '@/lib/hooks/use-controllable-state';
import { PORTAL_SELECTOR, Portal, portalProps } from '@/lib/portal';
import { Slot } from '@/lib/slot';
import './popover.scss';

/** Порталы внутри popover (селекты и т.п.) — клик по ним не закрывает панель */
export const POPOVER_PORTAL_SELECTOR = PORTAL_SELECTOR;

export const POPOVER_MIN_WIDTH = 280;
export const POPOVER_MAX_WIDTH = 360;

export type PopoverPlacement = Extract<
  Placement,
  'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end'
>;

export interface PopoverProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'title'
> {
  /** Управляемое состояние. Без него панель держит его сама, см. `defaultOpen`. */
  open?: boolean;
  /** Стартовое состояние неуправляемой панели. */
  defaultOpen?: boolean;
  /** Якорь: одна кнопка или другой элемент */
  trigger: ReactElement;
  children: ReactNode;
  /** Открытие и закрытие, в обоих режимах. */
  onOpenChange?: (open: boolean) => void;
  /** Только закрытие. Короткая форма `onOpenChange`. */
  onClose?: () => void;
  /** Заголовок панели, не атрибут `title`. */
  title?: string;
  contentClassName?: string;
  triggerClassName?: string;
  /** Сторона якоря: по умолчанию панель **над** кнопкой (`top-start`, как Popup `--bottom` в app) */
  placement?: PopoverPlacement;
  /** Минимальная ширина панели, px (не уже якоря) */
  minWidth?: number;
  /** Максимальная ширина панели, px */
  maxWidth?: number;
  /** Подпись кнопки закрытия для скринридера. */
  closeLabel?: string;
}

const flipPlacementsFor = (preferred: PopoverPlacement): Placement[] => {
  const topFirst: Placement[] = [
    'top-start',
    'top',
    'top-end',
    'bottom-start',
    'bottom',
    'bottom-end',
  ];
  const bottomFirst: Placement[] = [
    'bottom-start',
    'bottom',
    'bottom-end',
    'top-start',
    'top',
    'top-end',
  ];
  const order = preferred.startsWith('top') ? topFirst : bottomFirst;

  return [preferred, ...order.filter(side => side !== preferred)];
};

const PopoverFrame = forwardRef<HTMLDivElement, PopoverProps>(
  function PopoverFrame(
    {
      open: openProp,
      defaultOpen = false,
      trigger,
      children,
      onOpenChange,
      onClose,
      title,
      className,
      contentClassName,
      triggerClassName,
      placement = 'top-start',
      minWidth = POPOVER_MIN_WIDTH,
      maxWidth = POPOVER_MAX_WIDTH,
      closeLabel = 'Закрыть',
      style,
      ...props
    },
    ref,
  ) {
    const [open, setOpen] = useControllableState(
      openProp,
      defaultOpen,
      onOpenChange,
    );

    const handleOpenChange = (next: boolean) => {
      setOpen(next);
      if (!next) onClose?.();
    };

    const panelSizeStyle = {
      '--popover-min-width': `${minWidth}px`,
      '--popover-max-width': `${maxWidth}px`,
    } as CSSProperties;

    const nodeId = useFloatingNodeId();
    const { refs, floatingStyles, context } = useFloating({
      nodeId,
      open,
      onOpenChange: handleOpenChange,
      placement,
      strategy: 'fixed',
      whileElementsMounted: autoUpdate,
      middleware: [
        offset(8),
        flip({
          fallbackPlacements: flipPlacementsFor(placement),
          padding: 8,
          boundary: 'clippingAncestors',
        }),
        shift({ padding: 8 }),
      ],
    });

    const dismiss = useDismiss(context, {
      outsidePress: event => {
        const target = event.target as HTMLElement | null;
        if (target?.closest(POPOVER_PORTAL_SELECTOR)) return false;
        return true;
      },
    });
    const role = useRole(context, { role: 'dialog' });
    // Клик по якорю переключает только неуправляемую панель. У управляемой
    // открытием распоряжается потребитель — его обработчик на триггере
    // остаётся единственным, поведение не меняется.
    const click = useClick(context, { enabled: openProp === undefined });
    const { getReferenceProps, getFloatingProps } = useInteractions([
      dismiss,
      role,
      click,
    ]);
    const setPanelRef = useMergeRefs(
      // eslint-disable-next-line react/refs -- setFloating это ref-callback, не чтение current
      useMemo(() => [refs.setFloating, ref], [refs.setFloating, ref]),
    );

    if (!isValidElement(trigger)) {
      throw new Error('Popover: trigger — один React-элемент.');
    }

    const handleCloseClick = () => {
      handleOpenChange(false);
    };

    return (
      <FloatingNode id={nodeId}>
        <Slot
          ref={refs.setReference}
          className={cn('popover-trigger', triggerClassName)}
          {...getReferenceProps({
            'aria-expanded': open,
            'aria-haspopup': 'dialog' as const,
          })}
        >
          {trigger}
        </Slot>
        {open ? (
          <Portal>
            <FloatingFocusManager context={context} modal={false}>
              <div
                {...getFloatingProps(props)}
                {...portalProps}
                ref={setPanelRef}
                data-state="open"
                className={cn('popover', className)}
                style={{ ...style, ...floatingStyles, ...panelSizeStyle }}
              >
                <div className={cn('popover__inner', contentClassName)}>
                  {title ? <h4 className="popover__title">{title}</h4> : null}
                  <div className="popover__content">{children}</div>
                  <Button
                    className="popover__close"
                    variant="link"
                    type="button"
                    onClick={handleCloseClick}
                    aria-label={closeLabel}
                  >
                    <IconClose />
                  </Button>
                </div>
              </div>
            </FloatingFocusManager>
          </Portal>
        ) : null}
      </FloatingNode>
    );
  },
);

export const Popover = forwardRef<HTMLDivElement, PopoverProps>(
  function Popover(props, ref) {
    return (
      <FloatingLayerTree>
        <PopoverFrame {...props} ref={ref} />
      </FloatingLayerTree>
    );
  },
);
