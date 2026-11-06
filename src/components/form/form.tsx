import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type FormHTMLAttributes,
  type ForwardedRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';

import { Button, type ButtonProps } from '@/components/button';
import { cn } from '@/lib/cn';
import { assignRef } from '@/lib/compose-refs';
import './form.scss';

const FormPendingContext = createContext(false);

const useFormPending = () => useContext(FormPendingContext);

const isThenable = (value: unknown): value is PromiseLike<void> =>
  (typeof value === 'object' || typeof value === 'function') &&
  value !== null &&
  'then' in value &&
  typeof value.then === 'function';

const toMessage = (reason: unknown, fallback: ReactNode) => {
  if (typeof reason === 'string' && reason.trim()) return reason;
  // Error и объекты вида `{ message }` из API-клиентов.
  if (
    typeof reason === 'object' &&
    reason !== null &&
    'message' in reason &&
    typeof reason.message === 'string' &&
    reason.message.trim()
  ) {
    return reason.message;
  }
  return fallback;
};

export interface FormProps extends Omit<
  FormHTMLAttributes<HTMLFormElement>,
  'onSubmit'
> {
  /**
   * Вызывается после нативной проверки. `FormData` — по `name` контролов.
   * Промис держит кнопку, пока не осядет. Синхронный throw и reject — ошибка под полями.
   */
  onSubmit?: (
    data: FormData,
    event: FormEvent<HTMLFormElement>,
  ) => void | Promise<void>;
  /**
   * Запрос снаружи формы: `onSubmit` ничего не вернул, крутилку держит стор.
   * Складывается с ожиданием промиса.
   */
  pending?: boolean;
  /** Пока задана — она вместо текста из упавшего `onSubmit`. */
  error?: ReactNode;
  /** Текст, когда `onSubmit` упал без внятного сообщения. */
  errorFallback?: ReactNode;
}

export interface FormActionsProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export interface FormConsentProps extends HTMLAttributes<HTMLDivElement> {
  /** Текст рядом с кнопкой: оферта, согласие. Ссылки можно класть внутрь. */
  children: ReactNode;
}

export const Form = forwardRef(function Form(
  {
    children,
    className,
    action,
    error,
    errorFallback = 'Не получилось отправить. Попробуйте ещё раз',
    onSubmit,
    pending = false,
    ...props
  }: FormProps,
  ref: ForwardedRef<HTMLFormElement>,
) {
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<ReactNode>(null);
  const formNode = useRef<HTMLFormElement | null>(null);
  const busyRef = useRef(false);
  const requestId = useRef(0);
  const live = useRef(true);
  const submitting = pending || busy;
  const shownError = error ?? failure;

  useEffect(() => {
    live.current = true;
    return () => {
      live.current = false;
    };
  }, []);

  useEffect(() => {
    const node = formNode.current;
    if (!node) return;

    // Бабл браузера английский и перекрывает подсказку. Field уже рисует
    // ошибку. Отмена `invalid` убирает контрол из списка, которому браузер
    // показывает бабл. Сама проверка остаётся отрицательной, сабмит не уходит.
    let firstInvalid: HTMLElement | null = null;

    const handleInvalid = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement) || !target.closest('.field')) return;

      event.preventDefault();
      if (firstInvalid) return;

      // Браузер фокусит только контролы, чей `invalid` не отменён.
      // Первый в дереве — тот, с которого он начал бы сам.
      firstInvalid = target;
      queueMicrotask(() => {
        firstInvalid?.focus();
        firstInvalid = null;
      });
    };

    node.addEventListener('invalid', handleInvalid, true);
    return () => node.removeEventListener('invalid', handleInvalid, true);
  }, []);

  // Стабильная ссылка: иначе React на каждом рендере отцепляет и вешает ref заново.
  const setNode = useCallback(
    (node: HTMLFormElement | null) => {
      assignRef(formNode, node);
      assignRef(ref, node);
    },
    [ref],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    // Нативный сабмит только с явным action и без своего обработчика.
    // Без action браузер делает GET на текущий URL: поля попадают в query, историю и Referer.
    if (onSubmit || !action) event.preventDefault();
    if (!onSubmit) return;
    // Кнопка заблокирована, но requestSubmit и Enter её обходят.
    if (busyRef.current || pending) return;

    const data = new FormData(event.currentTarget);
    setFailure(null);

    let result: void | Promise<void>;
    try {
      result = onSubmit(data, event);
    } catch (reason) {
      setFailure(toMessage(reason, errorFallback));
      return;
    }

    if (!isThenable(result)) return;

    const id = ++requestId.current;
    busyRef.current = true;
    setBusy(true);

    const finish = () => {
      if (!live.current || requestId.current !== id) return;
      busyRef.current = false;
      setBusy(false);
    };

    void Promise.resolve(result).then(
      () => {
        finish();
      },
      (reason: unknown) => {
        finish();
        if (!live.current || requestId.current !== id) return;
        setFailure(toMessage(reason, errorFallback));
      },
    );
  };

  return (
    <form
      {...props}
      action={action}
      ref={setNode}
      className={cn('form', className)}
      onSubmit={handleSubmit}
      aria-busy={submitting || undefined}
    >
      <FormPendingContext.Provider value={submitting}>
        {children}
        {shownError ? (
          <p className="form__error" role="alert">
            {shownError}
          </p>
        ) : null}
      </FormPendingContext.Provider>
    </form>
  );
});

export const FormActions = forwardRef<HTMLDivElement, FormActionsProps>(
  function FormActions({ children, className, ...props }, ref) {
    return (
      <div {...props} ref={ref} className={cn('form__buttons', className)}>
        {children}
      </div>
    );
  },
);

export const FormConsent = forwardRef<HTMLDivElement, FormConsentProps>(
  function FormConsent({ children, className, ...props }, ref) {
    return (
      <div {...props} ref={ref} className={cn('form__consent', className)}>
        {children}
      </div>
    );
  },
);

export const FormSubmit = forwardRef(function FormSubmit(
  {
    loading = false,
    children,
    ...props
  }: Omit<ButtonProps, 'type' | 'asChild'>,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  const pending = useFormPending();

  return (
    <Button {...props} ref={ref} type="submit" loading={loading || pending}>
      {children}
    </Button>
  );
});
