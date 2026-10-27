type ClassDictionary = Record<string, boolean | null | undefined>;
type ClassValue =
  | string
  | number
  | null
  | undefined
  | false
  | ClassDictionary
  | ClassValue[];

const pushClass = (classes: string[], value: ClassValue): void => {
  if (!value) return;

  if (typeof value === 'string' || typeof value === 'number') {
    classes.push(String(value));
    return;
  }

  if (Array.isArray(value)) {
    value.forEach(item => pushClass(classes, item));
    return;
  }

  for (const key of Object.keys(value)) {
    if (value[key]) classes.push(key);
  }
};

/** Склейка классов. Без tailwind-merge: одноимённые правила решает специфичность. */
export const cn = (...inputs: ClassValue[]): string => {
  const classes: string[] = [];
  inputs.forEach(input => pushClass(classes, input));
  return classes.join(' ');
};

/** Условный класс. Пустая строка и `undefined` в `cn` не попадают. */
export const when = (
  enabled: boolean | undefined,
  className: string | undefined,
): string | false => (Boolean(enabled) && className ? className : false);
