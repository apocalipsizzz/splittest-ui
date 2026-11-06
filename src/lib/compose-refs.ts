import type { Ref } from 'react';

/** Сводит function-ref и object-ref. `null` снимает предыдущий узел. */
export const assignRef = <T>(
  ref: Ref<T> | null | undefined,
  node: T | null,
) => {
  if (typeof ref === 'function') {
    ref(node);
    return;
  }

  if (ref) ref.current = node;
};

/** Один callback для нескольких ref: внутренний узел и ref снаружи. */
export const composeRefs =
  <T>(...refs: Array<Ref<T> | null | undefined>) =>
  (node: T | null) => {
    refs.forEach(item => {
      assignRef(item, node);
    });
  };
