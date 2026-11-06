/**
 * Прямая запись `input.value` обновляет value-tracker React, и onChange не стреляет.
 * Сеттер прототипа трекер не трогает, `input` доходит и до react-imask.
 */
export const emitInputValue = (input: HTMLInputElement, next: string) => {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value',
  )?.set;

  setter?.call(input, next);
  input.dispatchEvent(new Event('input', { bubbles: true }));
};
