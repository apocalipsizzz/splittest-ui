import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Button } from '@/components/button';
import { CodeBlock } from '@/stories/code-block';
import { Labeled, LabeledBlock } from '@/stories/labeled';
import { storyStack } from '@/stories/story-stack';
import { PopupSheet } from './popup-sheet';

const meta = {
  title: 'Components/PopupSheet',
  component: PopupSheet,
  args: {
    open: false,
    children: 'Контент',
    title: 'Заголовок',
  },
} satisfies Meta<typeof PopupSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button type="button" onClick={() => setOpen(true)}>
          Открыть sheet
        </Button>
        <PopupSheet
          open={open}
          onClose={() => setOpen(false)}
          title="Подтверждение"
        >
          <p>Контент нижнего sheet.</p>
          <Button type="button" onClick={() => setOpen(false)}>
            Ок
          </Button>
        </PopupSheet>
      </>
    );
  },
};

const usageExample = `import { PopupSheet } from '@de-kit/st-ui';

function ConfirmLogout() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Выйти</button>
      <PopupSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Выйти из профиля?"
      >
        <button type="button" onClick={handleLogout}>Да, выйти</button>
      </PopupSheet>
    </>
  );
}`;

export const Usage: Story = {
  render: () => (
    <div style={storyStack}>
      <LabeledBlock title="Примеры кода">
        <Labeled label="Базовый сценарий" wide maxWidth={720}>
          <CodeBlock code={usageExample} />
        </Labeled>
      </LabeledBlock>
    </div>
  ),
};
