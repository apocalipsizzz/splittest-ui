import { useEffect, useRef, type ReactNode } from 'react';

import { Button } from '@/components/button';
import { IconClose } from '@/icons/icon-close';
import { cn, when } from '@/lib/cn';
import './popup-sheet.scss';

/** Селектор порталов внутри sheet: клик по ним не вызывает onClose */
export const POPUP_SHEET_PORTAL_SELECTOR = '[data-popup-sheet-portal]';

export interface PopupSheetProps {
  children: ReactNode;
  open: boolean;
  onClose?: () => void;
  title?: string;
  className?: string;
  positionVertical?: 'top' | 'bottom' | 'center';
}

export const PopupSheet = ({
  children,
  open,
  onClose,
  title,
  className,
}: PopupSheetProps) => {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const popupElement = popupRef.current;
      const isInsidePopup = popupElement?.contains(target);
      const isInsidePortalSelect = target?.closest(POPUP_SHEET_PORTAL_SELECTOR);

      if (!isInsidePopup && !isInsidePortalSelect && onClose) {
        onClose();
        document.body.style.overflow = '';
      }
    };

    const handleDocumentKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onClose) {
        onClose();
        document.body.style.overflow = '';
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('keydown', handleDocumentKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('keydown', handleDocumentKeyDown);
    };
  }, [open, onClose]);

  return (
    <div
      className={cn('popup-sheet', className, when(open, 'popup-sheet--open'))}
    >
      <div ref={popupRef} className="popup-sheet__inner">
        {title ? <h4 className="popup-sheet__title">{title}</h4> : null}
        <div className="popup-sheet__content">{children}</div>
        {onClose ? (
          <Button
            className="popup-sheet__close"
            variant="link"
            onClick={onClose}
            aria-label="Закрыть"
          >
            <IconClose />
          </Button>
        ) : null}
      </div>
    </div>
  );
};
