import type { KeyboardEvent } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export const firstEnabledIndex = (options: readonly SelectOption[]) =>
  options.findIndex(option => !option.disabled);

export const highlightedIndex = (
  options: readonly SelectOption[],
  activeIndex: number,
) => {
  const activeOption = options[activeIndex];
  return activeOption && !activeOption.disabled
    ? activeIndex
    : firstEnabledIndex(options);
};

export const selectedEnabledIndex = (
  options: readonly SelectOption[],
  value: string | null,
) => {
  const index = options.findIndex(
    option => option.value === value && !option.disabled,
  );
  return index >= 0 ? index : 0;
};

const moveEnabledIndex = (
  options: readonly SelectOption[],
  from: number,
  step: 1 | -1,
) => {
  const start = from < 0 ? (step === 1 ? -1 : options.length) : from;

  for (
    let index = start + step;
    index >= 0 && index < options.length;
    index += step
  ) {
    if (!options[index]?.disabled) return index;
  }

  return from >= 0 && !options[from]?.disabled ? from : -1;
};

export const isPrintableKey = (event: KeyboardEvent) =>
  event.key.length === 1 &&
  event.key !== ' ' &&
  !event.ctrlKey &&
  !event.metaKey &&
  !event.altKey;

/** Стрелки, Home/End, Enter и Escape открытого списка. */
export const handleListKeyDown = (
  event: KeyboardEvent,
  options: readonly SelectOption[],
  highlighted: number,
  onHighlight: (index: number) => void,
  onSelect: (option: SelectOption) => void,
  onClose: () => void,
) => {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    onHighlight(
      moveEnabledIndex(
        options,
        highlighted,
        event.key === 'ArrowDown' ? 1 : -1,
      ),
    );
    return true;
  }

  if (event.key === 'Home') {
    event.preventDefault();
    onHighlight(moveEnabledIndex(options, -1, 1));
    return true;
  }

  if (event.key === 'End') {
    event.preventDefault();
    onHighlight(moveEnabledIndex(options, options.length, -1));
    return true;
  }

  if (event.key === 'Enter') {
    event.preventDefault();
    const option = options[highlighted];
    if (option && !option.disabled) onSelect(option);
    return true;
  }

  if (event.key === 'Escape') {
    event.preventDefault();
    event.stopPropagation();
    onClose();
    return true;
  }

  return false;
};
