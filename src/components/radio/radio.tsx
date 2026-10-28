import {
  createContext,
  forwardRef,
  useContext,
  useId,
  useMemo,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';

import { useFieldControl } from '@/components/field/field-context';
import { cn, when } from '@/lib/cn';
import './radio.scss';

interface RadioGroupState {
  name: string;
  required: boolean;
  reportValue?: (value: string) => void;
}

const RadioGroupStateContext = createContext<RadioGroupState | null>(null);

export interface RadioGroupProps {
  /** Легенда группы. Внутри `Field` не нужна: именем станет лейбл поля. */
  label?: ReactNode;
  name: string;
  /** Внутри `Field` его `required` и так включает группу, здесь — для группы отдельно. */
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export const RadioGroup = ({
  label,
  name,
  required: requiredProp = false,
  children,
  className,
}: RadioGroupProps) => {
  const field = useFieldControl();
  const required = requiredProp || Boolean(field?.required);
  const labelledBy = !label && field?.labelId ? field.labelId : undefined;
  // Обязательность держат пункты: нативный required на них не даёт отправить
  // форму, а его invalid Field ловит и показывает свою ошибку. Выбор отдаём
  // в reportValue — иначе показанная ошибка так и висела бы после выбора.
  const reportValue = field?.reportValue;
  const group = useMemo<RadioGroupState>(
    () => ({ name, required, reportValue }),
    [name, required, reportValue],
  );

  return (
    <fieldset
      className={cn('radio-group', className)}
      role="radiogroup"
      {...(labelledBy ? { 'aria-labelledby': labelledBy } : {})}
      {...(field?.invalid ? { 'aria-invalid': true } : {})}
      {...(required ? { 'aria-required': true } : {})}
      {...(field?.describedBy ? { 'aria-describedby': field.describedBy } : {})}
      {...(field?.errorId ? { 'aria-errormessage': field.errorId } : {})}
    >
      {label ? <legend className="radio-group__legend">{label}</legend> : null}
      <RadioGroupStateContext.Provider value={group}>
        {children}
      </RadioGroupStateContext.Provider>
    </fieldset>
  );
};

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

    return (
      <div className={cn('radio', className, when(error, 'radio--error'))}>
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
