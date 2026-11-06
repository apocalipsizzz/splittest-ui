import { describe, expect, it, vi } from 'vitest';

import { emitInputValue } from './emit-input-value';

describe('emitInputValue', () => {
  it('пишет value через прототип и шлёт input', () => {
    const input = document.createElement('input');
    const onInput = vi.fn<(event: Event) => void>();
    input.addEventListener('input', onInput);

    emitInputValue(input, 'abc');

    expect(input).toHaveValue('abc');
    expect(onInput).toHaveBeenCalledOnce();
  });
});
