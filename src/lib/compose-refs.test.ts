import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { assignRef, composeRefs } from './compose-refs';

describe('composeRefs', () => {
  it('пишет узел и в function-ref, и в object-ref', () => {
    const node = document.createElement('input');
    const objectRef = createRef<HTMLInputElement>();
    const fn = vi.fn<(value: HTMLInputElement | null) => void>();

    composeRefs(objectRef, fn)(node);

    expect(objectRef.current).toBe(node);
    expect(fn).toHaveBeenCalledWith(node);

    assignRef(objectRef, null);
    expect(objectRef.current).toBeNull();
  });
});
