import {
  FloatingFocusManager,
  FloatingNode,
  useDismiss,
  useFloating,
  useFloatingNodeId,
  useInteractions,
  useMergeRefs,
  useTransitionStatus,
} from '@floating-ui/react';
import {
  forwardRef,
  useId,
  useMemo,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';

import { Button } from '@/components/button';
import { IconClose } from '@/icons/icon-close';
import { cn, when } from '@/lib/cn';
import { FloatingLayerTree } from '@/lib/floating-layer';
import { useControllableState } from '@/lib/hooks/use-controllable-state';
import { useScrollLock } from '@/lib/hooks/use-scroll-lock';
import { PORTAL_SELECTOR, Portal, portalProps } from '@/lib/portal';
import './popup-sheet.scss';

/**
 * Порталы, которые принадлежат открытому листу: клик по ним не закрывает лист,
 * и `aria-hidden` для внешнего контента их не задевает.
 * Атрибут один на всю библиотеку (`data-portal` и старые data-*-portal).
 */
export const POPUP_SHEET_PORTAL_SELECTOR = PORTAL_SELECTOR;

/** Длительность transition в popup-sheet.scss: столько лист живёт после закрытия. */
const TRANSITION_DURATION = 300;

const insidePortal = (target: EventTarget | null) =>
  target instanceof Element &&
  Boolean(target.closest(POPUP_SHEET_PORTAL_SELECTOR));

export interface PopupSheetProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'title'
> {
  children: ReactNode;
  /** Управляемое состояние. Без него лист держит его сам, см. `defaultOpen`. */
  open?: boolean;
  /** Стартовое состояние неуправляемого листа. */
  defaultOpen?: boolean;
  /** Открытие и закрытие, в обоих режимах. */
  onOpenChange?: (open: boolean) => void;
  /** Только закрытие. Короткая форма `onOpenChange`. */
  onClose?: () => void;
  /** Заголовок листа, не атрибут `title`. */
  title?: string;
  /** Подпись кнопки закрытия для скринридера. */
  closeLabel?: string;
}

/**
 * Нижний лист. Модальный: пока открыт, фокус заперт внутри, остальная страница
 * скрыта от скринридера, скролл заблокирован. Закрытый лист в DOM не остаётся —
 * иначе его содержимое ловило бы Tab и читалось скринридером.
 */
const PopupSheetFrame = forwardRef<HTMLDivElement, PopupSheetProps>(
  function PopupSheetFrame(
    {
      children,
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      onClose,
      title,
      className,
      closeLabel = 'Закрыть',
      ...props
    },
    ref,
  ) {
    const titleId = useId();
    const nodeId = useFloatingNodeId();
    const sheetRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useControllableState(
      openProp,
      defaultOpen,
      onOpenChange,
    );
    const { refs, context } = useFloating({
      nodeId,
      open,
      onOpenChange: next => {
        setOpen(next);
        if (!next) onClose?.();
      },
    });
    // Лист держится в DOM, пока идёт анимация закрытия, и уходит после неё.
    const { isMounted, status } = useTransitionStatus(context, {
      duration: TRANSITION_DURATION,
    });
    // Escape и клик вне листа — на useDismiss. Вложенный слой в том же
    // дереве (селект, датапикер) закрывается сам: пока он открыт, лист
    // Escape не забирает. stopPropagation для этого больше не нужен.
    const dismiss = useDismiss(context, {
      outsidePressEvent: 'mousedown',
      outsidePress: event => !insidePortal(event.target),
    });
    const { getFloatingProps } = useInteractions([dismiss]);
    // Новый массив на каждый рендер пересоздаёт ref, сбрасывает floating-узел
    // и заново ставит начальный фокус — вложенный DatePicker его теряет.
    const setSheetRef = useMergeRefs(
      useMemo(() => [sheetRef, refs.setFloating, ref], [refs.setFloating, ref]),
    );

    const close = () => {
      setOpen(false);
      onClose?.();
    };
    // Крестик рисуем, только если листу есть куда сообщить о закрытии:
    // управляемый лист без единого колбэка закрыть нечем.
    const closable =
      openProp === undefined || Boolean(onOpenChange) || Boolean(onClose);

    useScrollLock(isMounted);

    if (!isMounted) return null;

    return (
      <FloatingNode id={nodeId}>
        <Portal>
          <FloatingFocusManager
            context={context}
            modal
            // Фокус на сам лист, а не на первый контрол: скринридер успевает
            // объявить роль и заголовок, дальше пользователь уходит внутрь Tab'ом.
            initialFocus={sheetRef}
            // Дропдауны селектов живут в своих порталах у body: без этого
            // markOthers пометил бы их aria-hidden вместе со всей страницей.
            getInsideElements={() =>
              Array.from(document.querySelectorAll(POPUP_SHEET_PORTAL_SELECTOR))
            }
          >
            <div
              ref={setSheetRef}
              {...getFloatingProps(props)}
              {...portalProps}
              // eslint-disable-next-line jsx-a11y/prefer-tag-over-role -- <dialog> без showModal() не даёт ни top layer, ни inert: модальность держит FloatingFocusManager
              role="dialog"
              aria-modal="true"
              tabIndex={-1}
              data-state={status === 'open' ? 'open' : 'closed'}
              {...(title ? { 'aria-labelledby': titleId } : {})}
              className={cn(
                'popup-sheet',
                className,
                when(status === 'open', 'popup-sheet--open'),
              )}
            >
              <div className="popup-sheet__inner">
                {title ? (
                  <h4 id={titleId} className="popup-sheet__title">
                    {title}
                  </h4>
                ) : null}
                <div className="popup-sheet__content">{children}</div>
                {closable ? (
                  <Button
                    className="popup-sheet__close"
                    variant="link"
                    onClick={close}
                    aria-label={closeLabel}
                  >
                    <IconClose />
                  </Button>
                ) : null}
              </div>
            </div>
          </FloatingFocusManager>
        </Portal>
      </FloatingNode>
    );
  },
);

export const PopupSheet = forwardRef<HTMLDivElement, PopupSheetProps>(
  function PopupSheet(props, ref) {
    return (
      <FloatingLayerTree>
        <PopupSheetFrame {...props} ref={ref} />
      </FloatingLayerTree>
    );
  },
);
