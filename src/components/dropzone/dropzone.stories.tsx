import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '@/components/button';
import { CodeBlock } from '@/stories/code-block';
import { Labeled, LabeledBlock } from '@/stories/labeled';
import { storyStack } from '@/stories/story-stack';
import { Dropzone, type DropzoneProps } from './dropzone';

const meta = {
  title: 'Components/Dropzone',
  component: Dropzone,
  args: {
    label: 'Фото',
    accept: 'image',
    onFiles: () => {},
  },
} satisfies Meta<typeof Dropzone>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

const pair = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 16,
  maxWidth: 640,
} as const;

const Photos = () => {
  const [src, setSrc] = useState<string | null>(null);

  const handleFiles = (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setSrc(current => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
  };

  return (
    <div style={pair}>
      <Dropzone
        label="Фото 1"
        accept="image"
        maxSize={20 * 1024 * 1024}
        preview={src ? <img src={src} alt="Загруженное фото" /> : undefined}
        onClear={() => {
          setSrc(current => {
            if (current) URL.revokeObjectURL(current);
            return null;
          });
        }}
        onFiles={handleFiles}
      />
      <Dropzone
        label="Фото 2"
        accept="image"
        maxSize={20 * 1024 * 1024}
        onFiles={() => {}}
      />
    </div>
  );
};

export const PhotosRow: Story = {
  render: () => <Photos />,
};

export const Audio: Story = {
  args: { label: 'Аудио', accept: 'audio' },
  decorators: [
    Story => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
};

export const Video: Story = {
  args: { label: 'Видео', accept: 'video' },
  decorators: [
    Story => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
};

const Wide = (args: DropzoneProps) => {
  const [name, setName] = useState<string | null>(null);

  return (
    <div style={{ maxWidth: 480 }}>
      <Dropzone
        {...args}
        preview={name ? <span>{name}</span> : undefined}
        onClear={() => setName(null)}
        onFiles={files => setName(files[0]?.name ?? null)}
      />
    </div>
  );
};

export const Attachment: Story = {
  args: {
    label: 'Вложение',
    variant: 'wide',
    accept: {},
    fileLabel: 'скриншот или видео',
    maxSize: 20 * 1024 * 1024,
  },
  render: args => <Wide {...args} />,
};

export const Uploading: Story = {
  args: {
    label: 'Видео',
    accept: 'video',
    progress: 65,
    progressLabel: 'Загрузка: 65%',
    children: <Button type="button">Отменить</Button>,
  },
};

const usageExample = `import { Dropzone } from '@de-kit/st-ui';

// Квадрат для медиа теста. Лимит размера и длительность — правила продукта, не пресета.
<Dropzone
  label="Фото 1"
  accept="image"
  maxSize={20 * 1024 * 1024}
  preview={src ? <img src={src} alt="" /> : undefined}
  onClear={() => setSrc(null)}
  onFiles={files => setSrc(URL.createObjectURL(files[0]))}
/>

// Видео длиннее 2 минут отсекает validate, библиотека про секунды не знает.
<Dropzone
  label="Видео"
  accept="video"
  maxSize={200 * 1024 * 1024}
  validate={async file => {
    const duration = await readVideoDuration(file);
    return duration !== null && duration > 120
      ? 'Видео не должно быть длиннее 2 минут'
      : null;
  }}
  onFiles={upload}
/>

// Широкая зона для поддержки: свой список типов, без пресета.
<Dropzone
  variant="wide"
  accept={{ mimeTypes: ['image/png', 'image/jpeg'], extensions: ['png', 'jpg'] }}
  fileLabel="скриншот"
  onFiles={attach}
/>`;

export const Usage: Story = {
  render: () => (
    <div style={storyStack}>
      <LabeledBlock title="Примеры кода">
        <Labeled label="тесты и поддержка" wide maxWidth={720}>
          <CodeBlock code={usageExample} />
        </Labeled>
      </LabeledBlock>
    </div>
  ),
};
