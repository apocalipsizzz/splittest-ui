import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type HTMLProps,
  type MouseEvent,
} from 'react';
import {
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  shift,
  size as floatingSize,
  useDismiss,
  useFloating,
  useInteractions,
} from '@floating-ui/react';

import { useFieldControl } from '@/components/field/field-context';
import { IconIndicatorTick } from '@/icons/icon-indicator-tick';
import { cn, when } from '@/lib/cn';
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
) => {
  const field = useFieldControl();
  const reportValue = field?.reportValue;
  const isInvalid = Boolean(error) || Boolean(field?.invalid);
  const describedBy = [field?.describedBy].filter(Boolean).join(' ');

  useEffect(() => {
    reportValue?.(selectedValue ?? '');
  }, [reportValue, selectedValue]);

  return { field, isInvalid, describedBy };
};

export const selectControlProps = (
  field: ReturnType<typeof useSelectField>['field'],
  isInvalid: boolean,
  describedBy: string,
  id?: string,
): HTMLAttributes<HTMLInputElement> => ({
  id: field?.id ?? id,
  ...(isInvalid ? { 'aria-invalid': true } : {}),
  ...(field?.required ? { 'required': true, 'aria-required': true } : {}),
  ...(describedBy ? { 'aria-describedby': describedBy } : {}),
  ...(field?.errorId ? { 'aria-errormessage': field.errorId } : {}),
});

export const useSelectDropdown = (
  open: boolean,
  onOpenChange: (open: boolean) => void,
) => {
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const { refs, floatingStyles, context } = useFloating({
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
    marked = false,
  } = props;
  const optionRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    if (!open || highlighted < 0) return;
    const option = optionRefs.current[highlighted];
    if (typeof option?.scrollIntoView !== 'function') return;
    option.scrollIntoView({ block: 'nearest' });
  }, [highlighted, open]);

  if (!open) return null;

  const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <FloatingPortal>
      <div
        ref={setFloating}
        className="select__dropdown"
        data-popover-portal=""
        data-popup-portal=""
        {...getFloatingProps({ onMouseDown: handleMouseDown })}
        style={floatingStyles}
      >
        {/* listbox, не select: нативный список не умеет портал */}
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
                onKeyDown={event => {
                  if (event.key !== 'Enter' && event.key !== ' ') return;
                  event.preventDefault();
                  onSelect(option);
                }}
                onClick={() => onSelect(option)}
              >
                {marked ? (
                  <span className="select__mark">
                    {option.value === selectedValue ? (
                      <IconIndicatorTick width={16} height={16} />
                    ) : null}
                  </span>
                ) : null}
                {option.label}
              </div>
            ))
          )}
        </div>
      </div>
    </FloatingPortal>
  );
};
