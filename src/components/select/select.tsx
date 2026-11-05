import { useMergeRefs } from '@floating-ui/react';
import {
  useId,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';

import type { InputSize } from '@/components/input';
import { IconDrop } from '@/icons/icon-drop';
import { cn, when } from '@/lib/cn';
import {
  SelectDropdown,
  useSelectDropdown,
  useSelectField,
  useSelectValue,
} from './select-dropdown';
import {
  handleListKeyDown,
  highlightedIndex,
  isPrintableKey,
  selectedEnabledIndex,
  type SelectOption,
} from './select-option';
import '../input/input.scss';
import './select.scss';

export type { SelectOption };

export interface SelectProps {
  options: readonly SelectOption[];
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string) => void;
  /** Текст на кнопке, пока ничего не выбрано. */
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  /** Имя для FormData: уходит `value` выбранного пункта, не подпись. */
  name?: string;
  size?: InputSize;
  className?: string;
  id?: string;
}

const optionByPrefix = (
  options: readonly SelectOption[],
  char: string,
  from: number,
) => {
  const needle = char.toLowerCase().replace(/ё/g, 'е');
  const ordered = [...options.slice(from + 1), ...options.slice(0, from + 1)];
  const match = ordered.find(option => {
    const label = option.label.toLowerCase().replace(/ё/g, 'е');
    return !option.disabled && label.startsWith(needle);
  });

  return match ? options.indexOf(match) : -1;
};

/**
 * Селект как в shadcn: кнопка открывает список в портале, у выбранного пункта галочка.
 * В форму значение уходит скрытым полем, без второго видимого списка.
 * Для поиска по пунктам есть `SelectSearch`.
 */
export const Select = (props: SelectProps) => {
  const {
    options,
    value,
    defaultValue = null,
    onChange,
    placeholder = 'Выберите',
    disabled = false,
    error,
    name,
    size = 'md',
    className,
    id,
  } = props;

  const listId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const { selectedValue, setSelectedValue } = useSelectValue(
    value,
    defaultValue,
  );
  const { field, isInvalid, describedBy } = useSelectField(
    selectedValue,
    error,
  );
  const selected =
    options.find(option => option.value === selectedValue) ?? null;
  const highlighted = highlightedIndex(options, activeIndex);
  const dropdown = useSelectDropdown(open, setOpen);
  const setTriggerRef = useMergeRefs([triggerRef, dropdown.setReference]);

  const closeList = () => {
    setOpen(false);
  };

  const openList = () => {
    if (disabled || open) return;
    setActiveIndex(selectedEnabledIndex(options, selectedValue));
    setOpen(true);
  };

  const selectOption = (option: SelectOption) => {
    if (option.disabled) return;

    setSelectedValue(option.value);
    onChange?.(option.value);
    closeList();
    triggerRef.current?.focus();
  };

  const handleMouseDown = (event: MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;

    event.preventDefault();
    if (open) {
      closeList();
      return;
    }

    setActiveIndex(selectedEnabledIndex(options, selectedValue));
    setOpen(true);
    triggerRef.current?.focus();
  };

  const handleBlur = (event: FocusEvent<HTMLButtonElement>) => {
    if (dropdown.containsTarget(event.relatedTarget)) return;
    closeList();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (open) {
      const handled = handleListKeyDown(
        event,
        options,
        highlighted,
        setActiveIndex,
        selectOption,
        closeList,
      );
      if (handled) return;

      if (event.key === ' ') {
        event.preventDefault();
        const option = options[highlighted];
        if (option && !option.disabled) selectOption(option);
        return;
      }
    } else if (
      event.key === 'ArrowDown' ||
      event.key === 'ArrowUp' ||
      event.key === 'Enter' ||
      event.key === ' '
    ) {
      event.preventDefault();
      openList();
      return;
    }

    if (!isPrintableKey(event)) return;

    event.preventDefault();
    const from = open
      ? highlighted
      : selectedEnabledIndex(options, selectedValue) - 1;
    const next = optionByPrefix(options, event.key, from);
    if (next < 0) return;

    setActiveIndex(next);
    setOpen(true);
  };

  const handleValueFocus = () => {
    triggerRef.current?.focus();
  };

  return (
    <div className={cn('select', when(open, 'select--opened'), className)}>
      <button
        ref={setTriggerRef}
        type="button"
        role="combobox"
        id={field?.id ?? id}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? listId : undefined}
        aria-activedescendant={
          open && highlighted >= 0
            ? `${listId}-option-${highlighted}`
            : undefined
        }
        aria-label={field ? undefined : placeholder}
        disabled={disabled}
        onMouseDown={handleMouseDown}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        {...(isInvalid ? { 'aria-invalid': true } : {})}
        {...(field?.required ? { 'aria-required': true } : {})}
        {...(describedBy ? { 'aria-describedby': describedBy } : {})}
        {...(field?.errorId ? { 'aria-errormessage': field.errorId } : {})}
        className={cn(
          'input',
          'select__trigger',
          when(!selected, 'select__trigger--empty'),
          when(size !== 'md', `input--${size}`),
          when(isInvalid, 'input--error'),
        )}
      >
        <span className="select__value">{selected?.label ?? placeholder}</span>
        <IconDrop className="select__arrow" />
      </button>
      <input
        className="select__value-input"
        name={name}
        disabled={disabled}
        tabIndex={-1}
        aria-hidden
        value={selectedValue ?? ''}
        onChange={() => {}}
        onFocus={handleValueFocus}
        {...(field?.required ? { required: true } : {})}
      />
      <SelectDropdown
        open={open}
        listId={listId}
        options={options}
        selectedValue={selectedValue}
        highlighted={highlighted}
        emptyText="Нет вариантов"
        accessibleName={placeholder}
        labelId={field?.labelId}
        floatingStyles={dropdown.floatingStyles}
        setFloating={dropdown.setDropdownRef}
        getFloatingProps={dropdown.getFloatingProps}
        onHighlight={setActiveIndex}
        onSelect={selectOption}
        marked
      />
    </div>
  );
};
