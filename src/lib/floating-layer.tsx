import { FloatingTree, useFloatingParentNodeId } from '@floating-ui/react';
import {
  forwardRef,
  type ForwardRefExoticComponent,
  type PropsWithoutRef,
  type ReactNode,
  type RefAttributes,
} from 'react';

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

type FrameComponent<T, P> = ForwardRefExoticComponent<
  PropsWithoutRef<P> & RefAttributes<T>
>;

/**
 * Дерево слоёв вокруг кадра. Новый слой оборачивается здесь:
 * вложенный вызов дерево не заводит, это решает `FloatingLayerTree`.
 * Имя передаётся явно: `function.name` у потребителя без `keep_names`
 * схлопывается, и в DevTools остаётся `t`.
 */
export const withFloatingLayer = <T, P>(
  Frame: FrameComponent<T, P>,
  displayName: string,
) => {
  const Wrapped = forwardRef<T, P>(function FloatingLayer(props, ref) {
    return (
      <FloatingLayerTree>
        <Frame {...props} ref={ref} />
      </FloatingLayerTree>
    );
  });

  Wrapped.displayName = displayName;
  return Wrapped;
};
