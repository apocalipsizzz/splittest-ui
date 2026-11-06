import { useFieldControl } from './field-context';

/** Склейка id для `aria-describedby`. Пустые выкидываются. */
export const joinDescribedBy = (...ids: Array<string | undefined>) => {
  const value = ids.filter(part => Boolean(part)).join(' ');
  return value || undefined;
};

export interface FieldControlProps {
  'required'?: boolean;
  'aria-required'?: true;
  'aria-invalid'?: true;
  'aria-describedby'?: string;
  'aria-errormessage'?: string;
}

interface UseFieldControlPropsOptions {
  error?: boolean;
  describedBy?: readonly (string | undefined)[];
  /**
   * false — без нативного `required`. Кнопка селекта и fieldset им не проверяются,
   * обязательность остаётся на `aria-required` и на отдельном value-инпуте.
   */
  nativeRequired?: boolean;
  /** true включает обязательность даже вне Field. */
  required?: boolean;
  /** Свой id ошибки важнее id ошибки поля. */
  errorId?: string;
}

/**
 * required, aria-invalid, aria-describedby и aria-errormessage из Field
 * одним объектом. Раньше каждый контрол склеивал это сам и расходился с соседом.
 * `id` сюда не входит: у чекбокса, радио и селекта он берётся по-разному.
 */
export const useFieldControlProps = (
  options: UseFieldControlPropsOptions = {},
) => {
  const field = useFieldControl();
  const isInvalid = Boolean(options.error) || Boolean(field?.invalid);
  const describedBy = joinDescribedBy(
    field?.describedBy,
    ...(options.describedBy ?? []),
  );
  const isRequired = options.required ?? Boolean(field?.required);
  const nativeRequired = options.nativeRequired ?? true;
  const errorId = options.errorId ?? field?.errorId;
  const controlProps: FieldControlProps = {};

  if (isRequired) {
    if (nativeRequired) controlProps.required = true;
    controlProps['aria-required'] = true;
  }
  if (isInvalid) controlProps['aria-invalid'] = true;
  if (describedBy) controlProps['aria-describedby'] = describedBy;
  if (errorId) controlProps['aria-errormessage'] = errorId;

  return { field, isInvalid, describedBy, controlProps };
};
