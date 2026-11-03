import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingPortal,
  offset,
  shift,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
  type Placement,
} from '@floating-ui/react';
import { isValidElement, type CSSProperties, type ReactElement, type ReactNode } from 'react';

import { Button } from '@/components/button';
import { IconClose } from '@/icons/icon-close';
import { cn } from '@/lib/cn';
import './popover.scss';

/** Порталы внутри popover (селекты и t.п.) — клик по ним не закрывает панель */
export const POPOVER_PORTAL_SELECTOR = '[data-popover-portal]';

export const POPOVER_MIN_WIDTH = 280;
export const POPOVER_MAX_WIDTH = 360;

export type PopoverPlacement = Extract<
  Placement,
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
>;

export interface PopoverProps {
  open: boolean;
  /** Якорь: одна кнопка или другой элемент */
  trigger: ReactElement;
  children: ReactNode;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  title?: string;
  className?: string;
  contentClassName?: string;
  triggerClassName?: string;
  /** Сторона якоря: по умолчанию панель **над** кнопкой (`top-start`, как Popup `--bottom` в app) */
  placement?: PopoverPlacement;
  /** Минимальная ширина панели, px (не уже якоря) */
  minWidth?: number;
  /** Максимальная ширина панели, px */
  maxWidth?: number;
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

export const Popover = ({
  open,
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
}: PopoverProps) => {
  const handleOpenChange = (next: boolean) => {
    onOpenChange?.(next);
    if (!next) onClose?.();
  };

  const panelSizeStyle = {
    '--popover-min-width': `${minWidth}px`,
    '--popover-max-width': `${maxWidth}px`,
  } as CSSProperties;

  const { refs, floatingStyles, context } = useFloating({
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
  const { getReferenceProps, getFloatingProps } = useInteractions([
    dismiss,
    role,
  ]);

  if (!isValidElement(trigger)) {
    throw new Error('Popover: trigger — один React-элемент.');
  }

  const handleCloseClick = () => {
    handleOpenChange(false);
  };

  return (
    <>
      <span
        ref={refs.setReference}
        className={cn('popover-trigger', triggerClassName)}
        {...getReferenceProps({
          'aria-expanded': open,
          'aria-haspopup': 'dialog' as const,
        })}
      >
        {trigger}
      </span>
      {open ? (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <div
              ref={refs.setFloating}
              className={cn('popover', className)}
              style={{ ...floatingStyles, ...panelSizeStyle }}
              {...getFloatingProps()}
            >
              <div className={cn('popover__inner', contentClassName)}>
                {title ? <h4 className="popover__title">{title}</h4> : null}
                <div className="popover__content">{children}</div>
                <Button
                  className="popover__close"
                  variant="link"
                  type="button"
                  onClick={handleCloseClick}
                  aria-label="Закрыть"
                >
                  <IconClose />
                </Button>
              </div>
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      ) : null}
    </>
  );
};
