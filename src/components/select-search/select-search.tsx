import {
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';

import type { InputSize } from '@/components/input';
import { IconDrop } from '@/icons/icon-drop';
import { cn, when } from '@/lib/cn';
import {
  SelectDropdown,
  selectControlProps,
  useSelectDropdown,
  useSelectField,
  useSelectValue,
} from '../select/select-dropdown';
import {
  handleListKeyDown,
  highlightedIndex,
  isPrintableKey,
  selectedEnabledIndex,
  type SelectOption,
} from '../select/select-option';
import { filterSelectOptions } from './filter-option';
import '../input/input.scss';
import '../select/select.scss';
import './select-search.scss';

export interface SelectSearchOption extends SelectOption {
  /** Дополнительный текст для поиска: код, синоним. В списке не показывается. */
  keywords?: readonly string[];
}

export interface SelectSearchProps {
  options: readonly SelectSearchOption[];
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string) => void;
  /** Текст в закрытом поле, пока ничего не выбрано. */
  placeholder?: string;
  /** Текст в поле, когда список открыт и запрос пустой. */
  searchPlaceholder?: string;
  disabled?: boolean;
  error?: boolean;
  /** Имя для FormData: уходит `value` выбранного пункта, не подпись. */
  name?: string;
  size?: InputSize;
  className?: string;
  emptyText?: string;
  /**
   * Свой матч вместо поиска по подписи и `keywords`.
   * Пустой запрос сюда не приходит: список показывается целиком.
   */
  filterOption?: (option: SelectSearchOption, query: string) => boolean;
  id?: string;
}

/**
 * Селект с поиском. Закрытое поле показывает подпись, открытое — запрос.
 * Ищет без регистра, «ё» = «е», и если строка набрана в другой раскладке.
 */
export const SelectSearch = (props: SelectSearchProps) => {
  const {
    options,
    value,
    defaultValue = null,
    onChange,
    placeholder = 'Выберите',
    searchPlaceholder = 'Поиск',
    disabled = false,
    error,
    name,
    size = 'md',
    className,
    emptyText = 'Ничего не найдено',
    filterOption,
    id,
  } = props;

  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
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
  const filtered = useMemo(
    () => filterSelectOptions(options, query, filterOption),
    [filterOption, options, query],
  );
  const highlighted = highlightedIndex(filtered, activeIndex);
  const dropdown = useSelectDropdown(open, next => {
    setOpen(next);
    if (!next) setQuery('');
  });

  const closeList = () => {
    setOpen(false);
    setQuery('');
  };

  const openList = (initialQuery: string) => {
    if (disabled) return;

    const next = filterSelectOptions(options, initialQuery, filterOption);
    setQuery(initialQuery);
    setActiveIndex(
      selectedEnabledIndex(next, initialQuery ? null : selectedValue),
    );
    setOpen(true);
  };

  const selectOption = (option: SelectOption) => {
    if (option.disabled) return;

    setSelectedValue(option.value);
    onChange?.(option.value);
    closeList();
    inputRef.current?.focus();
  };

  const handleMouseDown = (event: MouseEvent<HTMLInputElement>) => {
    if (disabled || open) return;
    event.preventDefault();
    openList('');
    inputRef.current?.focus();
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    if (dropdown.containsTarget(event.relatedTarget)) return;
    closeList();
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    if (!open) {
      const label = selected?.label ?? '';
      if (next === label) return;

      const added = next.startsWith(label) ? next.slice(label.length) : next;
      openList(added);
      return;
    }

    setQuery(next);
    setActiveIndex(0);
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    if (open || disabled) return;

    event.preventDefault();
    openList(event.clipboardData.getData('text'));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (!open) {
      if (
        event.key === 'ArrowDown' ||
        event.key === 'ArrowUp' ||
        event.key === ' ' ||
        event.key === 'Backspace'
      ) {
        event.preventDefault();
        openList('');
        return;
      }

      if (isPrintableKey(event)) {
        event.preventDefault();
        openList(event.key);
      }
      return;
    }

    handleListKeyDown(
      event,
      filtered,
      highlighted,
      setActiveIndex,
      selectOption,
      closeList,
    );
  };

  return (
    <div
      ref={dropdown.setReference}
      className={cn(
        'select',
        'select--search',
        when(open, 'select--opened'),
        className,
      )}
      {...dropdown.getReferenceProps()}
    >
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-autocomplete="list"
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
        autoComplete="off"
        spellCheck={false}
        placeholder={open ? searchPlaceholder : placeholder}
        value={open ? query : (selected?.label ?? '')}
        onMouseDown={handleMouseDown}
        onBlur={handleBlur}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        {...selectControlProps(field, isInvalid, describedBy, id)}
        className={cn(
          'input',
          'select__input',
          when(size !== 'md', `input--${size}`),
          when(isInvalid, 'input--error'),
        )}
      />
      <IconDrop className="select__arrow" />
      {name ? (
        <input
          type="hidden"
          name={name}
          value={selectedValue ?? ''}
          disabled={disabled}
        />
      ) : null}
      <SelectDropdown
        open={open}
        listId={listId}
        options={filtered}
        selectedValue={selectedValue}
        highlighted={highlighted}
        emptyText={emptyText}
        accessibleName={placeholder}
        labelId={field?.labelId}
        floatingStyles={dropdown.floatingStyles}
        setFloating={dropdown.setDropdownRef}
        getFloatingProps={dropdown.getFloatingProps}
        onHighlight={setActiveIndex}
        onSelect={selectOption}
      />
    </div>
  );
};
