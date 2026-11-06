import { FloatingTree, useFloatingParentNodeId } from '@floating-ui/react';
import type { ReactNode } from 'react';

/**
 * Корень дерева слоёв. Вложенный слой дерево не заводит: он уже внутри
 * `FloatingNode` родителя и регистрируется в том же дереве.
 * Общее дерево нужно, чтобы фокус и Escape не спорили между листами.
 */
export const FloatingLayerTree = (props: { children: ReactNode }) => {
  const parentId = useFloatingParentNodeId();
  if (parentId != null) return props.children;

  return <FloatingTree>{props.children}</FloatingTree>;
};
