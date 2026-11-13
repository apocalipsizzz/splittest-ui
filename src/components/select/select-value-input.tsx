interface SelectValueInputProps {
  name?: string;
  disabled?: boolean;
  value: string | null;
  required?: boolean;
  onFocus: () => void;
}

/** Скрытое поле формы. Видимый контрол — кнопка или поиск, в FormData уходит value. */
export function SelectValueInput(props: SelectValueInputProps) {
  const { name, disabled, value, required, onFocus } = props;

  return (
    <input
      className="select__value-input"
      name={name}
      disabled={disabled}
      tabIndex={-1}
      aria-hidden
      value={value ?? ''}
      onChange={() => {}}
      onFocus={onFocus}
      {...(required ? { required: true } : {})}
    />
  );
}
