import {
  createContext,
  forwardRef,
  useContext,
  useId,
  useMemo,
  type ChangeEvent,
  type FieldsetHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';

import { useFieldControlProps } from '@/components/field/use-field-control-props';
import { cn, when } from '@/lib/cn';
import '../field/field.scss';
import './radio.scss';

interface RadioGroupState {
  name: string;
  required: boolean;
  invalid: boolean;
  reportValue?: (value: string) => void;
}

const RadioGroupStateContext = createContext<RadioGroupState | null>(null);

export interface RadioGroupProps extends FieldsetHTMLAttributes<HTMLFieldSetElement> {
  /** Легенда группы. Внутри `Field` не нужна: именем станет лейбл поля. */
  label?: ReactNode;
  name: string;
  /** Внутри `Field` его `required` и так включает группу, здесь — для группы отдельно. */
  required?: boolean;
  /** Подсказка под пунктами. Внутри `Field` используйте `hint` поля. */
  hint?: ReactNode;
  /** Ошибка под пунктами, красит их. Внутри `Field` используйте `error` поля. */
  error?: ReactNode;
  children: ReactNode;
}

export const RadioGroup = forwardRef<HTMLFieldSetElement, RadioGroupProps>(
  function RadioGroup(
    {
      label,
      name,
      required: requiredProp = false,
      hint,
      error,
      children,
      className,
      ...props
    },
    ref,
  ) {
    const autoId = useId();
    const hintId = hint ? `${autoId}-hint` : undefined;
    const errorId = error ? `${autoId}-error` : undefined;
    const { field, controlProps } = useFieldControlProps({
      error: Boolean(error),
      describedBy: [hintId, errorId],
      nativeRequired: false,
      required: requiredProp || undefined,
      errorId,
    });
    const required = requiredProp || Boolean(field?.required);
    const invalid = Boolean(error) || Boolean(field?.invalid);
    const labelledBy = !label && field?.labelId ? field.labelId : undefined;
    // Обязательность держат пункты: нативный required на них не даёт отправить
    // форму, а его invalid Field ловит и показывает свою ошибку. Выбор отдаём
    // в reportValue — иначе показанная ошибка так и висела бы после выбора.
    const reportValue = field?.reportValue;
    const group = useMemo<RadioGroupState>(
      () => ({ name, required, invalid, reportValue }),
      [name, required, invalid, reportValue],
    );

    return (
      <fieldset
        {...props}
        ref={ref}
        className={cn('radio-group', className)}
        role="radiogroup"
        {...controlProps}
        {...(labelledBy ? { 'aria-labelledby': labelledBy } : {})}
        data-invalid={invalid || undefined}
      >
        {label ? (
          <legend className="radio-group__legend">{label}</legend>
        ) : null}
        <RadioGroupStateContext.Provider value={group}>
          {children}
        </RadioGroupStateContext.Provider>
        {hint ? (
          <p id={hintId} className="field__hint">
            {hint}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} className="field__error" role="alert">
            {error}
          </p>
        ) : null}
      </fieldset>
    );
  },
);

export interface RadioInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  error?: boolean;
}

export const RadioInput = forwardRef<HTMLInputElement, RadioInputProps>(
  function RadioInput(
    { id, className, label, error, disabled, name, onChange, ...props },
    ref,
  ) {
    const group = useContext(RadioGroupStateContext);
    const autoId = useId();
    const inputId = id ?? autoId;

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      if (event.target.checked) group?.reportValue?.(event.target.value);
      onChange?.(event);
    };

    const invalid = Boolean(error) || Boolean(group?.invalid);

    return (
      <div className={cn('radio', className, when(invalid, 'radio--error'))}>
        <input
          {...props}
          ref={ref}
          type="radio"
          id={inputId}
          // Внутри группы имя группы побеждает, иначе её можно разрезать name на пункте.
          name={group?.name ?? name}
          disabled={disabled}
          // required на любом пункте делает обязательной всю группу с этим name.
          {...(group?.required ? { required: true } : {})}
          data-invalid={invalid || undefined}
          data-disabled={disabled || undefined}
          onChange={handleChange}
          className="radio__input"
        />
        {label ? (
          <label className="radio__label" htmlFor={inputId}>
            {label}
          </label>
        ) : null}
      </div>
    );
  },
);
