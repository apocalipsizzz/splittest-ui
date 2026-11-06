import { useMergeRefs } from '@floating-ui/react';
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';

import { cn, when } from '@/lib/cn';
import {
  FieldControlProvider,
  type FieldControlContext,
} from './field-context';
import './field.scss';

export type FieldHintPlacement = 'bottom' | 'label';

export interface FieldProps extends HTMLAttributes<HTMLDivElement> {
  label?: ReactNode;
  hint?: ReactNode;
  /** `bottom` — под полем, `label` — сразу под лейблом. */
  hintPlacement?: FieldHintPlacement;
  error?: ReactNode;
  /**
   * Невалидность снаружи: `aria-invalid` на контроле и красная рамка.
   * Пока проп задан, собственная проверка обязательности молчит — состоянием
   * распоряжается потребитель (react-hook-form, ответ сервера).
   */
  invalid?: boolean;
  /** Пустое значение после того, как в поле уже что-то было. */
  required?: boolean;
  /**
   * По умолчанию «Поле «{label}» обязательно», если лейбл — строка.
   * Слово «поле» среднего рода, поэтому формулировка не зависит от рода лейбла.
   */
  requiredMessage?: ReactNode;
  /**
   * Один контрол без своего id берёт id поля.
   * `CheckboxInput` со своим `id` его сохраняет: иначе несколько чекбоксов
   * в одном Field получают одинаковый, и лейбл бьёт в первый.
   */
  children: ReactNode;
}

const isFilled = (value: string) => value.trim() !== '';

const requiredText = (label: ReactNode, message: ReactNode | undefined) => {
  if (message) return message;
  if (typeof label === 'string') return `Поле «${label}» обязательно`;
  return 'Обязательное поле';
};

export const Field = forwardRef<HTMLDivElement, FieldProps>(function Field(
  {
    label,
    hint,
    hintPlacement = 'bottom',
    error,
    invalid: invalidProp,
    required = false,
    requiredMessage,
    className,
    children,
    ...props
  },
  ref,
) {
  const inputId = useId();
  const hasLabel = Boolean(label);
  const labelId = hasLabel ? `${inputId}-label` : undefined;
  const rootRef = useRef<HTMLDivElement>(null);
  const setRootRef = useMergeRefs(useMemo(() => [rootRef, ref], [ref]));
  // ponytail: value/defaultValue больше не читаем с ребёнка. Контрол зовёт
  // reportValue из эффекта — до первого эффекта hadValue ещё false.
  const hadValueRef = useRef(false);
  const [showRequired, setShowRequired] = useState(false);
  // Свой `invalid` снаружи отключает эвристику «было значение и исчезло»:
  // две проверки на одно поле противоречили бы друг другу.
  const managed = invalidProp !== undefined;
  const requiredError =
    required && showRequired && !managed
      ? requiredText(label, requiredMessage)
      : null;
  const visibleError = error ?? requiredError;
  const invalid = invalidProp ?? Boolean(visibleError);
  const hintId = hint ? `${inputId}-hint` : undefined;
  // Привязан к тексту ошибки, а не к `invalid`: с управляемым `invalid` без
  // своего текста `aria-errormessage` указывал бы в пустоту.
  const errorId = visibleError ? `${inputId}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ');

  const reportValue = useCallback(
    (value: string) => {
      if (!required) return;

      if (isFilled(value)) {
        hadValueRef.current = true;
        setShowRequired(false);
        return;
      }

      if (hadValueRef.current) setShowRequired(true);
    },
    [required],
  );

  /**
   * Второй повод пожаловаться — неудачная проверка формы. Нужен для контролов,
   * которые нельзя опустошить: радиогруппу обратно не снимут, и до отправки
   * момента для ошибки нет. `invalid` не всплывает, но проходит фазу захвата,
   * поэтому одного слушателя на корне поля хватает на любой контрол внутри.
   * Реагируем только на пустое значение: формат, длина и прочие нарушения
   * обязательности не касаются, и чужую ошибку выдавать за неё нельзя.
   */
  useEffect(() => {
    const node = rootRef.current;
    if (!node || !required) return;

    const handleInvalid = (event: Event) => {
      const target = event.target;
      const missing =
        (target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          target instanceof HTMLSelectElement) &&
        target.validity.valueMissing;

      if (missing) setShowRequired(true);
    };

    node.addEventListener('invalid', handleInvalid, true);
    return () => node.removeEventListener('invalid', handleInvalid, true);
  }, [required]);

  const contextValue = useMemo<FieldControlContext>(
    () => ({
      id: inputId,
      labelId,
      invalid,
      required,
      describedBy: describedBy || undefined,
      errorId,
      reportValue,
    }),
    [describedBy, errorId, inputId, invalid, labelId, reportValue, required],
  );

  const hintByPlacement: Record<FieldHintPlacement, ReactNode> = {
    label: null,
    bottom: null,
  };

  if (hint) {
    hintByPlacement[hintPlacement] = (
      <p
        id={hintId}
        className={cn(
          'field__hint',
          when(hintPlacement === 'label', 'field__hint--label'),
        )}
      >
        {hint}
      </p>
    );
  }

  return (
    <div
      {...props}
      ref={setRootRef}
      className={cn(
        'field',
        className,
        when(Boolean(hint) && hintPlacement === 'label', 'field--hint-label'),
      )}
    >
      {hasLabel ? (
        <label id={labelId} className="field__label" htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      {hintByPlacement.label}
      <FieldControlProvider value={contextValue}>
        {children}
      </FieldControlProvider>
      {visibleError ? (
        <p id={errorId} className="field__error" role="alert">
          {visibleError}
        </p>
      ) : null}
      {hintByPlacement.bottom}
    </div>
  );
});
