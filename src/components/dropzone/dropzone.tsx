import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

import { useFieldControlProps } from '@/components/field/use-field-control-props';
import { Button } from '@/components/button';
import { Progress } from '@/components/progress';
import { IconTrash } from '@/icons/icon-trash';
import { cn, when } from '@/lib/cn';
import {
  resolveDropzoneAccept,
  toAcceptAttr,
  validateDropzoneFile,
  type DropzoneAccept,
  type DropzonePreset,
  type DropzoneRules,
} from './accept';
import './dropzone.scss';

export type DropzoneVariant = 'square' | 'wide';

/** Ошибка выбора вместе с правилами, при которых она возникла. */
type LocalError = { key: string; message: ReactNode } | null;

const PLACEHOLDER = 'Перетащите сюда или\u00A0нажмите для выбора';

export interface DropzoneProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'onChange' | 'onDrop'
> {
  /** Подпись над зоной. Пресет сам её не подставляет: «Фото 1» и «Аудио» задаёт потребитель. */
  label?: ReactNode;
  /**
   * `image` | `video` | `audio` или свой список mime/расширений.
   * Без `accept` берётся любой файл.
   */
  accept?: DropzonePreset | DropzoneAccept;
  /** Перебивает подпись пресета в строке «файл …». */
  fileLabel?: string;
  /** Байты. Без пропа размер не проверяется: лимиты теста и поддержки разные. */
  maxSize?: number;
  multiple?: boolean;
  disabled?: boolean;
  /** `square` — медиа в тесте, `wide` — вложение в колонке формы. */
  variant?: DropzoneVariant;
  placeholder?: ReactNode;
  /** Выбранный файл. Пока задан, пунктир скрыт и клик не открывает диалог. */
  preview?: ReactNode;
  error?: ReactNode;
  /** 0–100. Бар только в пустой зоне. Не передан — бара нет, даже на нуле. */
  progress?: number;
  progressLabel?: ReactNode;
  /** После типа и размера. Строка — ошибка, `onFiles` не зовём. */
  validate?: (file: File) => string | null | Promise<string | null>;
  onFiles: (files: File[]) => void;
  onClear?: () => void;
  clearLabel?: string;
  /** Кнопки пустой зоны: «Отменить», «Повторить». Клик по ним файл не открывает. */
  children?: ReactNode;
}

export const Dropzone = forwardRef<HTMLDivElement, DropzoneProps>(
  function Dropzone(
    {
      label,
      accept,
      fileLabel: fileLabelProp,
      maxSize,
      multiple = false,
      disabled = false,
      variant = 'square',
      placeholder = PLACEHOLDER,
      preview,
      error,
      progress,
      progressLabel,
      validate,
      onFiles,
      onClear,
      clearLabel = 'Удалить файл',
      children,
      className,
      id,
      ...props
    },
    ref,
  ) {
    const inputRef = useRef<HTMLInputElement>(null);
    const checkRef = useRef(0);
    const ownId = useId();
    const [isDragOver, setIsDragOver] = useState(false);
    const [localError, setLocalError] = useState<LocalError>(null);
    const resolved = useMemo(() => resolveDropzoneAccept(accept), [accept]);
    const fileLabel = fileLabelProp ?? resolved.label;
    const rules = useMemo<DropzoneRules>(
      () => ({
        mimeTypes: resolved.mimeTypes,
        extensions: resolved.extensions,
        fileLabel,
        maxSize,
      }),
      [fileLabel, maxSize, resolved],
    );
    const acceptAttr = toAcceptAttr(resolved);
    // Строка, а не объект `rules`: его пересобирает любой инлайновый проп на
    // каждом рендере, а эти правила меняются только вместе со своим значением.
    const rulesKey = `${acceptAttr ?? ''}|${maxSize ?? ''}`;
    // Жалоба принадлежит тем правилам, при которых возникла: сменились `accept`
    // или `maxSize` — «Выберите файл фото» больше не про эту зону и исчезает
    // сама. Вычисляем при рендере, а не гасим эффектом: иначе лишний рендер,
    // а один кадр ошибка ещё висела бы.
    const localMessage =
      localError?.key === rulesKey ? localError.message : null;
    const filled = preview != null && preview !== false;
    const showClear = filled && Boolean(onClear);
    const visibleError = error || localMessage;
    const errorId = visibleError ? `${ownId}-error` : undefined;
    const { field, controlProps } = useFieldControlProps({
      error: Boolean(visibleError),
      describedBy: errorId ? [errorId] : undefined,
      errorId,
      nativeRequired: false,
    });
    const reportValue = field?.reportValue;

    /**
     * Единственный канал, по которому `Field` узнаёт про выбранный файл.
     * Нативной обязательности у зоны нет (`nativeRequired: false`), а сам
     * `input[type=file]` остаётся пустым: после выбора значение сбрасывается,
     * файлы уходят в `onFiles`. Без этого `<Field required>` вокруг `Dropzone`
     * не показал бы ошибку и не помешал отправке — ни одна из трёх проверок
     * поля не срабатывала.
     */
    useEffect(() => {
      reportValue?.(filled ? 'on' : '');
    }, [filled, reportValue]);

    // Свой id важнее id поля и не остаётся на корне: иначе лейбл бьёт мимо инпута.
    const inputId = id ?? field?.id ?? ownId;
    const labelId = label ? `${inputId}-label` : undefined;
    const progressText =
      progressLabel ??
      (progress !== undefined ? `Загрузка: ${progress}%` : null);

    const takeFiles = useCallback(
      async (list: FileList | null | undefined) => {
        if (disabled) return;

        const picked = Array.from(list ?? []);
        const files = multiple ? picked : picked.slice(0, 1);
        if (files.length === 0) return;

        const fail = (message: ReactNode) => {
          setLocalError({ key: rulesKey, message });
        };

        const checkId = ++checkRef.current;
        for (const file of files) {
          const invalid = validateDropzoneFile(file, rules);
          if (invalid) {
            fail(invalid);
            return;
          }
        }

        if (validate) {
          for (const file of files) {
            let custom: string | null;
            try {
              custom = await validate(file);
            } catch {
              if (checkId !== checkRef.current) return;
              fail('Не удалось проверить файл');
              return;
            }

            if (checkId !== checkRef.current) return;
            if (custom) {
              fail(custom);
              return;
            }
          }
        }

        setLocalError(null);
        onFiles(files);
      },
      [disabled, multiple, onFiles, rules, rulesKey, validate],
    );

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
      void takeFiles(event.target.files);
      event.target.value = '';
    };

    const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      event.currentTarget.click();
    };

    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (!disabled) setIsDragOver(true);
    };

    const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
      const next = event.relatedTarget;
      if (next instanceof Node && event.currentTarget.contains(next)) return;
      setIsDragOver(false);
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragOver(false);
      void takeFiles(event.dataTransfer.files);
    };

    const handleClear = () => {
      setLocalError(null);
      if (inputRef.current) inputRef.current.value = '';
      onClear?.();
    };

    const progressLabelText =
      typeof progressText === 'string'
        ? progressText
        : `Загрузка: ${progress}%`;

    return (
      <div
        {...props}
        ref={ref}
        className={cn(
          'dropzone',
          className,
          when(variant === 'wide', 'dropzone--wide'),
        )}
      >
        {label || showClear ? (
          <div className="dropzone__head">
            {label ? (
              <div id={labelId} className="dropzone__label">
                {label}
              </div>
            ) : null}
            {showClear ? (
              <Button
                type="button"
                variant="link"
                className="dropzone__clear"
                aria-label={clearLabel}
                onClick={handleClear}
              >
                <IconTrash />
              </Button>
            ) : null}
          </div>
        ) : null}

        <div
          className={cn(
            'dropzone__zone',
            when(filled, 'dropzone__zone--filled'),
            when(isDragOver, 'dropzone__zone--drag'),
            when(disabled, 'dropzone__zone--disabled'),
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            className="dropzone__input"
            accept={acceptAttr}
            multiple={multiple}
            disabled={disabled || filled}
            tabIndex={filled ? -1 : 0}
            aria-hidden={filled || undefined}
            aria-labelledby={labelId ?? field?.labelId}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            {...controlProps}
          />

          {filled ? (
            <div className="dropzone__preview">{preview}</div>
          ) : (
            <div className="dropzone__placeholder">
              <label htmlFor={inputId} className="dropzone__pick">
                <span className="dropzone__text">{placeholder}</span>
                {fileLabel ? (
                  <span className="dropzone__hint">файл {fileLabel}</span>
                ) : null}
              </label>
              {progress !== undefined || children ? (
                <div className="dropzone__extra">
                  {progress !== undefined ? (
                    <div className="dropzone__progress">
                      <Progress
                        value={progress}
                        aria-label={progressLabelText}
                      />
                      <div className="dropzone__progress-status">
                        {progressText}
                      </div>
                    </div>
                  ) : null}
                  {children}
                </div>
              ) : null}
            </div>
          )}
        </div>

        {visibleError ? (
          <p id={errorId} className="dropzone__error" role="alert">
            {visibleError}
          </p>
        ) : null}
      </div>
    );
  },
);
