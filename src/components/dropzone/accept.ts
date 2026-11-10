export const dropzonePreset = {
  image: {
    label: 'фото',
    mimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/avif',
      'image/heic',
      'image/heif',
      'image/svg+xml',
    ],
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'heic', 'svg'],
  },
  video: {
    label: 'видео',
    mimeTypes: [
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'video/x-msvideo',
      'video/avi',
      'video/x-matroska',
      'video/x-ms-wmv',
    ],
    extensions: ['avi', 'mp4', 'mkv', 'mov', 'wmv', 'webm'],
  },
  audio: {
    label: 'аудио',
    mimeTypes: [
      'audio/mpeg',
      'audio/mp3',
      'audio/mp4',
      'audio/x-m4a',
      'audio/m4a',
      'audio/wav',
      'audio/x-wav',
      'audio/aac',
      'audio/flac',
      'audio/x-ms-wma',
    ],
    extensions: ['wma', 'wav', 'mp3', 'm4a', 'flac', 'aac'],
  },
} as const;

export type DropzonePreset = keyof typeof dropzonePreset;

export interface DropzoneAccept {
  mimeTypes?: readonly string[];
  extensions?: readonly string[];
  /** «файл {label}» в пустой зоне и в тексте ошибки типа. */
  label?: string;
}

export interface ResolvedAccept {
  mimeTypes: readonly string[];
  extensions: readonly string[];
  label?: string;
}

const MB = 1024 * 1024;
const KB = 1024;

const trimSize = (value: number) => {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
};

export const formatMaxSize = (bytes: number) => {
  if (bytes >= MB) return `${trimSize(bytes / MB)} МБ`;
  if (bytes >= KB) return `${trimSize(bytes / KB)} КБ`;
  return `${bytes} Б`;
};

export const resolveDropzoneAccept = (
  accept?: DropzonePreset | DropzoneAccept,
): ResolvedAccept => {
  if (!accept) return { mimeTypes: [], extensions: [] };
  if (typeof accept === 'string') return dropzonePreset[accept];

  return {
    mimeTypes: accept.mimeTypes ?? [],
    extensions: accept.extensions ?? [],
    label: accept.label,
  };
};

export const toAcceptAttr = ({ mimeTypes, extensions }: ResolvedAccept) => {
  if (mimeTypes.length === 0 && extensions.length === 0) return undefined;

  return [
    ...mimeTypes,
    ...extensions.map(ext => (ext.startsWith('.') ? ext : `.${ext}`)),
  ].join(',');
};

export interface DropzoneRules extends ResolvedAccept {
  fileLabel?: string;
  maxSize?: number;
}

export const validateDropzoneFile = (
  file: File,
  rules: DropzoneRules,
): string | null => {
  if (rules.maxSize !== undefined && file.size > rules.maxSize) {
    return `Файл не должен превышать ${formatMaxSize(rules.maxSize)}`;
  }

  const checksType = rules.mimeTypes.length > 0 || rules.extensions.length > 0;
  if (!checksType) return null;
  if (file.type && rules.mimeTypes.includes(file.type)) return null;

  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (ext && rules.extensions.includes(ext)) return null;

  return rules.fileLabel
    ? `Выберите файл ${rules.fileLabel}`
    : 'Выберите подходящий файл';
};
