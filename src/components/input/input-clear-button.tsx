import type { MouseEvent, RefObject } from 'react';

import { IconCross } from '@/icons/icon-cross';
import { emitInputValue } from '@/lib/emit-input-value';

interface InputClearButtonProps {
  inputRef: RefObject<HTMLInputElement | null>;
  label: string;
  onClear?: () => void;
}

const handleMouseDown = (event: MouseEvent<HTMLButtonElement>) => {
  // Иначе mousedown унесёт фокус с поля раньше click, и курсор пропадёт.
  event.preventDefault();
};

export function InputClearButton(props: InputClearButtonProps) {
  const { inputRef, label, onClear } = props;

  const handleClick = () => {
    const input = inputRef.current;
    if (!input) return;

    emitInputValue(input, '');
    onClear?.();
    input.focus();
  };

  return (
    <button
      type="button"
      className="input__clear"
      aria-label={label}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      <IconCross width={16} height={16} />
    </button>
  );
}
