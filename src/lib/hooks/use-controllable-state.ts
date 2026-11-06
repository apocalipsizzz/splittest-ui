import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Одна триада на всю библиотеку: `value` + `defaultValue` + `onChange`.
 * Пока `value` не передан, состояние держит компонент; как только передан —
 * решает снаружи, а `onChange` зовётся в обоих режимах.
 *
 * Колбэк живёт в ref: иначе инлайновая стрелка у потребителя меняла бы
 * ссылку на сеттер каждый рендер и перезапускала эффекты floating-ui.
 */
export const useControllableState = <T>(
  controlled: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
) => {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const isControlled = controlled !== undefined;
  const latestOnChange = useRef(onChange);
  useEffect(() => {
    latestOnChange.current = onChange;
  });

  const setValue = useCallback(
    (next: T) => {
      if (!isControlled) setUncontrolled(next);
      latestOnChange.current?.(next);
    },
    [isControlled],
  );

  return [isControlled ? controlled : uncontrolled, setValue] as const;
};
