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

/** Склейка классов. Без tailwind-merge: в модулях класс один, конфликт решает последний в списке. */
export const cn = (...inputs: ClassValue[]): string => {
  const classes: string[] = [];
  inputs.forEach(input => pushClass(classes, input));
  return classes.join(' ');
};

/** Класс из CSS-модуля. Индекс `*.scss` под `noUncheckedIndexedAccess` — `string | undefined`. */
export const when = (
  enabled: boolean | undefined,
  className: string | undefined,
): string | false => (Boolean(enabled) && className ? className : false);
