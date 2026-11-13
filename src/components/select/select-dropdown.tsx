import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type HTMLProps,
  type MouseEvent,
  type ReactNode,
} from 'react';
import {
  autoUpdate,
  flip,
  offset,
  shift,
  size as floatingSize,
  useDismiss,
  useFloating,
  useInteractions,
} from '@floating-ui/react';

import { useFieldControlProps } from '@/components/field/use-field-control-props';
import type { InputSize } from '@/components/input';
import { IconIndicatorTick } from '@/icons/icon-indicator-tick';
import { cn, when } from '@/lib/cn';
import { Portal, portalProps } from '@/lib/portal';
import { type SelectOption } from './select-option';

export const useSelectValue = (
  value: string | null | undefined,
  defaultValue: string | null,
) => {
  const isControlled = value !== undefined;
  const [uncontrolled, setUncontrolled] = useState<string | null>(defaultValue);
  const selectedValue = isControlled ? (value ?? null) : uncontrolled;

  const setSelectedValue = (next: string) => {
    if (!isControlled) setUncontrolled(next);
  };

  return { selectedValue, setSelectedValue };
};

export const useSelectField = (
  selectedValue: string | null,
  error?: boolean,
  describedBy?: string,
) => {
  // required на кнопке и на поле поиска не проверяет выбор: его держит value-инпут.
  const control = useFieldControlProps({
    error,
    nativeRequired: false,
    describedBy: [describedBy],
  });
  const reportValue = control.field?.reportValue;

  useEffect(() => {
    reportValue?.(selectedValue ?? '');
  }, [reportValue, selectedValue]);

  return control;
};

interface SelectNamingOptions {
  /** `aria-label` потребителя. */
  label?: string;
  /** `aria-labelledby` потребителя. */
  labelledBy?: string;
  placeholder: string;
  /** id лейбла поля, если контрол внутри `Field`. */
  fieldLabelId?: string;
  /** Внутри `Field` имя кнопке даёт `<label htmlFor>`, плейсхолдер туда не идёт. */
  insideField: boolean;
}

/**
 * Имя для combobox и для списка. `aria-*` потребителя важнее умолчаний:
 * иначе заданное снаружи имя молча проигрывало бы плейсхолдеру. Атрибуты
 * садятся на combobox, а не на корневой `div`, — у `div` нет роли, и
 * `aria-label` на нём вспомогательные технологии игнорируют.
 */
export const selectNaming = (options: SelectNamingOptions) => {
  const { label, labelledBy, placeholder, fieldLabelId, insideField } = options;
  const resolvedLabel =
    label ?? (labelledBy || insideField ? undefined : placeholder);

  return {
    control: {
      ...(resolvedLabel ? { 'aria-label': resolvedLabel } : {}),
      ...(labelledBy ? { 'aria-labelledby': labelledBy } : {}),
    },
    /** Список ссылается на тот же лейбл, что и кнопка. */
    listLabelId: labelledBy ?? fieldLabelId,
    listLabel: label ?? placeholder,
  };
};

interface SelectControlOptions<T extends { value: string }> {
  items: readonly T[];
  value?: string | null;
  defaultValue?: string | null;
  error?: boolean;
  describedBy?: string;
  label?: string;
  labelledBy?: string;
  placeholder: string;
}

type SelectControlClassOptions = {
  size: InputSize;
  invalid: boolean;
} & (
  | {
      kind: 'select__trigger';
      /** Приглушённый плейсхолдер. У поиска своего модификатора нет. */
      empty?: boolean;
    }
  | { kind: 'select__input' }
);

export const selectControlClassName = (options: SelectControlClassOptions) => {
  const { kind, size, invalid } = options;
  const empty = kind === 'select__trigger' && options.empty;

  return cn(
    'input',
    kind,
    when(empty, `${kind}--empty`),
    when(size !== 'md', `input--${size}`),
    when(invalid, 'input--error'),
  );
};

/** Значение, поле и имя combobox — общее у `Select` и `SelectSearch`. */
export const useSelectControl = <T extends { value: string }>(
  options: SelectControlOptions<T>,
) => {
  const {
    items,
    value,
    defaultValue = null,
    error,
    describedBy,
    label,
    labelledBy,
    placeholder,
  } = options;
  const { selectedValue, setSelectedValue } = useSelectValue(
    value,
    defaultValue,
  );
  const fieldState = useSelectField(selectedValue, error, describedBy);
  const naming = selectNaming({
    label,
    labelledBy,
    placeholder,
    fieldLabelId: fieldState.field?.labelId,
    insideField: Boolean(fieldState.field),
  });
  const selected = items.find(item => item.value === selectedValue) ?? null;

  return {
    selectedValue,
    setSelectedValue,
    field: fieldState.field,
    isInvalid: fieldState.isInvalid,
    controlProps: fieldState.controlProps,
    naming,
    selected,
  };
};

export const useSelectDropdown = (
  open: boolean,
  onOpenChange: (open: boolean) => void,
  nodeId?: string,
) => {
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const { refs, floatingStyles, context } = useFloating({
    nodeId,
    open,
    onOpenChange,
    placement: 'bottom-start',
    strategy: 'fixed',
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(4),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      floatingSize({
        padding: 8,
        apply({ rects, elements, availableHeight }) {
          elements.floating.style.width = `${rects.reference.width}px`;
          if (availableHeight > 0) {
            elements.floating.style.maxHeight = `${Math.min(availableHeight, 280)}px`;
          }
        },
      }),
    ],
  });
  const dismiss = useDismiss(context, {
    escapeKey: false,
    outsidePressEvent: 'mousedown',
  });
  const { getReferenceProps, getFloatingProps } = useInteractions([dismiss]);

  const setDropdownRef = (node: HTMLDivElement | null) => {
    dropdownRef.current = node;
    refs.setFloating(node);
  };

  const containsTarget = (target: EventTarget | null) =>
    target instanceof Node && Boolean(dropdownRef.current?.contains(target));

  return {
    setReference: refs.setReference,
    floatingStyles,
    getReferenceProps,
    getFloatingProps,
    setDropdownRef,
    containsTarget,
  };
};

interface SelectDropdownProps {
  open: boolean;
  listId: string;
  options: readonly SelectOption[];
  selectedValue: string | null;
  highlighted: number;
  emptyText: string;
  accessibleName?: string;
  labelId?: string;
  floatingStyles: CSSProperties;
  setFloating: (node: HTMLDivElement | null) => void;
  getFloatingProps: (
    userProps?: HTMLProps<HTMLDivElement>,
  ) => HTMLAttributes<HTMLElement>;
  onHighlight: (index: number) => void;
  onSelect: (option: SelectOption) => void;
  /** Своя разметка пункта вместо подписи. */
  renderOption?: (option: SelectOption) => ReactNode;
  /** Галочка у выбранного пункта, как в shadcn Select. */
  marked?: boolean;
}

export const SelectDropdown = (props: SelectDropdownProps) => {
  const {
    open,
    listId,
    options,
    selectedValue,
    highlighted,
    emptyText,
    accessibleName,
    labelId,
    floatingStyles,
    setFloating,
    getFloatingProps,
    onHighlight,
    onSelect,
    renderOption,
    marked = false,
  } = props;
  const optionRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    if (!open || highlighted < 0) return;
    const option = optionRefs.current[highlighted];
    if (typeof option?.scrollIntoView !== 'function') return;
    option.scrollIntoView({ block: 'nearest' });
  }, [highlighted, open]);

  // Список отфильтровали — в хвосте массива остались бы узлы, которых уже нет.
  useEffect(() => {
    optionRefs.current.length = options.length;
  }, [options.length]);

  if (!open) return null;

  const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <Portal>
      <div
        ref={setFloating}
        className="select__dropdown"
        {...portalProps}
        {...getFloatingProps({ onMouseDown: handleMouseDown })}
        style={floatingStyles}
      >
        {/* listbox, не select: нативный список не умеет ни портал, ни свою разметку пункта */}
        <div
          id={listId}
          role="listbox"
          aria-label={labelId ? undefined : accessibleName}
          aria-labelledby={labelId}
        >
          {options.length === 0 ? (
            <div className="select__empty">{emptyText}</div>
          ) : (
            options.map((option, index) => (
              <div
                key={option.value}
                ref={node => {
                  optionRefs.current[index] = node;
                }}
                id={`${listId}-option-${index}`}
                role="option"
                tabIndex={-1}
                aria-selected={option.value === selectedValue}
                aria-disabled={option.disabled || undefined}
                data-highlighted={index === highlighted || undefined}
                data-selected={option.value === selectedValue || undefined}
                data-disabled={option.disabled || undefined}
                className={cn(
                  'select__option',
                  when(marked, 'select__option--marked'),
                  when(index === highlighted, 'select__option--active'),
                  when(
                    option.value === selectedValue,
                    'select__option--selected',
                  ),
                  when(option.disabled, 'select__option--disabled'),
                )}
                onMouseEnter={() => {
                  if (!option.disabled) onHighlight(index);
                }}
                onMouseDown={event => {
                  if (event.button !== 0) return;
                  onSelect(option);
                }}
                // Выбор делает mousedown: он успевает до blur поля.
                // Клик нужен для того, что mousedown не шлёт, —
                // `element.click()` и активация в мобильных скринридерах.
                // detail > 0 бывает только у клика после указателя.
                onClick={event => {
                  if (event.detail !== 0) return;
                  onSelect(option);
                }}
              >
                {marked ? (
                  <span className="select__mark">
                    {option.value === selectedValue ? (
                      <IconIndicatorTick width={16} height={16} />
                    ) : null}
                  </span>
                ) : null}
                {renderOption ? renderOption(option) : option.label}
              </div>
            ))
          )}
        </div>
      </div>
    </Portal>
  );
};
