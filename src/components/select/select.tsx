import {
  FloatingNode,
  useFloatingNodeId,
  useMergeRefs,
} from '@floating-ui/react';
import {
  forwardRef,
  useId,
  useRef,
  useState,
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
} from './select-dropdown';
import { SelectValueInput } from './select-value-input';
import {
  createTypeaheadBuffer,
  handleListKeyDown,
  highlightedIndex,
  isPrintableKey,
  optionByPrefix,
  selectedEnabledIndex,
  type SelectOption,
} from './select-option';
import '../input/input.scss';
import './select.scss';

export type { SelectOption };

export interface SelectProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange' | 'defaultValue'
> {
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
  /** Текст пустого списка. */
  emptyText?: string;
  /** Открытие и закрытие списка. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Своя разметка пункта списка. `label` остаётся строкой: по нему идёт
   * поиск с клавиатуры.
   */
  renderOption?: (option: SelectOption) => ReactNode;
  /**
   * Своя разметка выбранного значения на кнопке.
   * Без неё кнопка показывает `label`.
   */
  renderValue?: (option: SelectOption) => ReactNode;
}

/**
 * Селект как в shadcn: кнопка открывает список в портале, у выбранного пункта галочка.
 * В форму значение уходит скрытым полем, без второго видимого списка.
 * Для поиска по пунктам есть `SelectSearch`.
 */
const SelectFrame = forwardRef<HTMLDivElement, SelectProps>(
  function SelectFrame(props, ref) {
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
      emptyText = 'Нет вариантов',
      onOpenChange,
      renderOption,
      renderValue,
      // aria-* уезжают на combobox, а не на корневой div: у div нет роли,
      // и имя на нём вспомогательные технологии не читают.
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      'aria-describedby': ariaDescribedBy,
      ...rest
    } = props;

    const listId = useId();
    const triggerRef = useRef<HTMLButtonElement>(null);
    const typeahead = useRef(createTypeaheadBuffer());
    const [open, setOpen] = useControllableState<boolean>(
      undefined,
      false,
      onOpenChange,
    );
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
    const highlighted = highlightedIndex(options, activeIndex);
    const nodeId = useFloatingNodeId();
    const dropdown = useSelectDropdown(open, setOpen, nodeId);
    const setTriggerRef = useMergeRefs([triggerRef, dropdown.setReference]);

    const closeList = () => {
      typeahead.current.reset();
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
      const query = typeahead.current.push(event.key);
      const from = open
        ? highlighted
        : selectedEnabledIndex(options, selectedValue) - 1;
      const next = optionByPrefix(options, query, from);
      if (next < 0) return;

      setActiveIndex(next);
      setOpen(true);
    };

    const handleValueFocus = () => {
      triggerRef.current?.focus();
    };

    return (
      <FloatingNode id={nodeId}>
        <div
          {...rest}
          ref={ref}
          data-state={open ? 'open' : 'closed'}
          className={cn('select', when(open, 'select--opened'), className)}
        >
          <button
            ref={setTriggerRef}
            type="button"
            role="combobox"
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
            onMouseDown={handleMouseDown}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            {...controlProps}
            id={id ?? field?.id}
            data-state={open ? 'open' : 'closed'}
            data-invalid={isInvalid || undefined}
            data-disabled={disabled || undefined}
            className={selectControlClassName({
              kind: 'select__trigger',
              size,
              invalid: isInvalid,
              empty: !selected,
            })}
          >
            <span className="select__value">
              {selected
                ? (renderValue?.(selected) ?? selected.label)
                : placeholder}
            </span>
            <IconDrop className="select__arrow" />
          </button>
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
            options={options}
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
            marked
          />
        </div>
      </FloatingNode>
    );
  },
);

export const Select = withFloatingLayer(SelectFrame, 'Select');
