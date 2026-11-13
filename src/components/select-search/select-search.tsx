import {
  FloatingNode,
  useFloatingNodeId,
  useMergeRefs,
} from '@floating-ui/react';
import {
  forwardRef,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type FocusEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';

import type { InputSize } from '@/components/input';
import { IconDrop } from '@/icons/icon-drop';
import { cn, when } from '@/lib/cn';
import { withFloatingLayer } from '@/lib/floating-layer';
import { useControllableState } from '@/lib/hooks/use-controllable-state';
import {
  SelectDropdown,
  selectControlClassName,
  useSelectControl,
  useSelectDropdown,
} from '../select/select-dropdown';
import { SelectValueInput } from '../select/select-value-input';
import {
  handleListKeyDown,
  highlightedIndex,
  isPrintableKey,
  selectedEnabledIndex,
  type SelectOption,
} from '../select/select-option';
import { filterSelectOptions } from './filter-option';

const foundWord = (count: number) => {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return 'вариант';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return 'варианта';
  }
  return 'вариантов';
};

const formatFoundCount = (count: number) =>
  `Найдено ${count} ${foundWord(count)}`;
import '../input/input.scss';
import '../select/select.scss';
import './select-search.scss';

export interface SelectSearchOption extends SelectOption {
  /** Дополнительный текст для поиска: код, синоним. В списке не показывается. */
  keywords?: readonly string[];
}

export interface SelectSearchProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange' | 'defaultValue'
> {
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
  emptyText?: string;
  /**
   * Свой матч вместо поиска по подписи и `keywords`.
   * Пустой запрос сюда не приходит: список показывается целиком.
   */
  filterOption?: (option: SelectSearchOption, query: string) => boolean;
  /** Открытие и закрытие списка. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Своя разметка пункта. `label` при этом остаётся строкой: по нему идут
   * поиск и подпись в закрытом поле.
   */
  renderOption?: (option: SelectSearchOption) => ReactNode;
}

/**
 * Селект с поиском. Закрытое поле показывает подпись, открытое — запрос.
 * Ищет без регистра, «ё» = «е», и если строка набрана в другой раскладке.
 */
const SelectSearchFrame = forwardRef<HTMLDivElement, SelectSearchProps>(
  function SelectSearchFrame(props, ref) {
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
      onOpenChange,
      renderOption,
      id,
      // aria-* уезжают на combobox, а не на корневой div: у div нет роли,
      // и имя на нём вспомогательные технологии не читают.
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      'aria-describedby': ariaDescribedBy,
      ...rest
    } = props;

    const listId = useId();
    const inputRef = useRef<HTMLInputElement>(null);
    const [open, setOpen] = useControllableState<boolean>(
      undefined,
      false,
      onOpenChange,
    );
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const {
      selectedValue,
      setSelectedValue,
      field,
      isInvalid,
      controlProps,
      naming,
      selected,
    } = useSelectControl({
      items: options,
      value,
      defaultValue,
      error,
      describedBy: ariaDescribedBy,
      label: ariaLabel,
      labelledBy: ariaLabelledBy,
      placeholder,
    });
    const filtered = useMemo(
      () => filterSelectOptions(options, query, filterOption),
      [filterOption, options, query],
    );
    const highlighted = highlightedIndex(filtered, activeIndex);
    const nodeId = useFloatingNodeId();
    const dropdown = useSelectDropdown(
      open,
      next => {
        setOpen(next);
        if (!next) setQuery('');
      },
      nodeId,
    );
    const setRootRef = useMergeRefs(
      useMemo(() => [dropdown.setReference, ref], [dropdown.setReference, ref]),
    );

    const closeList = () => {
      setOpen(false);
      setQuery('');
    };

    const handleValueFocus = () => {
      inputRef.current?.focus();
    };

    const openList = (initialQuery: string) => {
      if (disabled) return;

      // Фильтр один — в useMemo выше. Пустой запрос оставляет options как есть,
      // поэтому индекс выбранного считается по ним. Непустой всегда стартует
      // с нуля: selectedEnabledIndex(filtered, null) давал то же самое.
      setQuery(initialQuery);
      setActiveIndex(
        initialQuery ? 0 : selectedEnabledIndex(options, selectedValue),
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
      <FloatingNode id={nodeId}>
        <div
          ref={setRootRef}
          {...dropdown.getReferenceProps(rest)}
          className={cn(
            'select',
            'select--search',
            when(open, 'select--opened'),
            className,
          )}
          data-state={open ? 'open' : 'closed'}
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
            {...naming.control}
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
            {...controlProps}
            id={id ?? field?.id}
            data-state={open ? 'open' : 'closed'}
            data-invalid={isInvalid || undefined}
            data-disabled={disabled || undefined}
            className={selectControlClassName({
              kind: 'select__input',
              size,
              invalid: isInvalid,
            })}
          />
          <IconDrop className="select__arrow" />
          <span
            className="select__status"
            aria-live="polite"
            aria-atomic="true"
          >
            {open && query ? formatFoundCount(filtered.length) : ''}
          </span>
          <SelectValueInput
            name={name}
            disabled={disabled}
            value={selectedValue}
            required={field?.required}
            onFocus={handleValueFocus}
          />
          <SelectDropdown
            open={open}
            listId={listId}
            options={filtered}
            selectedValue={selectedValue}
            highlighted={highlighted}
            emptyText={emptyText}
            accessibleName={naming.listLabel}
            labelId={naming.listLabelId}
            floatingStyles={dropdown.floatingStyles}
            setFloating={dropdown.setDropdownRef}
            getFloatingProps={dropdown.getFloatingProps}
            onHighlight={setActiveIndex}
            onSelect={selectOption}
            renderOption={renderOption}
          />
        </div>
      </FloatingNode>
    );
  },
);

export const SelectSearch = withFloatingLayer(
  SelectSearchFrame,
  'SelectSearch',
);
