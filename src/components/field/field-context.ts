import { createContext, useContext } from 'react';

export interface FieldControlContext {
  id: string;
  /** Для контролов без собственного лейбла: группа ссылается на него aria-labelledby. */
  labelId?: string;
  invalid: boolean;
  required: boolean;
  describedBy?: string;
  errorId?: string;
  /** Контрол сообщает показанное значение: текст поля или 'on' у отмеченного чекбокса. */
  reportValue?: (value: string) => void;
}

const FieldControlReactContext = createContext<FieldControlContext | null>(
  null,
);

export const FieldControlProvider = FieldControlReactContext.Provider;

export const useFieldControl = (): FieldControlContext | null =>
  useContext(FieldControlReactContext);
