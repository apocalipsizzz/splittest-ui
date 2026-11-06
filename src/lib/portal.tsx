import { FloatingPortal } from '@floating-ui/react';
import type { ReactNode } from 'react';

/**
 * Один корень для всего, что библиотека рисует у body.
 * Старые атрибуты остаются: их уже ищут селекторы и разметка приложения.
 * Клик по такому узлу не закрывает родительские Popover и PopupSheet,
 * и `aria-hidden` модалки его не задевает.
 */
export const portalProps = {
  'data-portal': '',
  'data-popover-portal': '',
  'data-popup-portal': '',
  'data-popup-sheet-portal': '',
} as const;

export const PORTAL_SELECTOR =
  '[data-portal],[data-popover-portal],[data-popup-portal],[data-popup-sheet-portal]';

export const Portal = (props: { children: ReactNode }) => (
  <FloatingPortal>{props.children}</FloatingPortal>
);
