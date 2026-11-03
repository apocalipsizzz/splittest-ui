import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Button } from '@/components/button';
import { CodeBlock } from '@/stories/code-block';
import { Labeled, LabeledBlock } from '@/stories/labeled';
import { storyStack } from '@/stories/story-stack';
import { Popover } from './popover';

const meta = {
  title: 'Components/Popover',
  component: Popover,
  args: {
    open: false,
    title: 'Код подтверждения',
    children: 'Контент popover',
    trigger: <Button type="button">Якорь</Button>,
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div style={{ padding: 80, maxWidth: 360 }}>
        <Popover
          open={open}
          onOpenChange={setOpen}
          title="Код подтверждения"
          triggerClassName="popover-trigger--full-width"
          trigger={
            <Button type="button" onClick={() => setOpen(true)}>
              Сохранить изменения
            </Button>
          }
        >
          <p style={{ margin: 0 }}>
            Панель привязана к кнопке, flip — сверху/снизу.
          </p>
        </Popover>
      </div>
    );
  },
};

export const FlipNearBottom: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          minHeight: '70vh',
          padding: 24,
        }}
      >
        <Popover
          open={open}
          onOpenChange={setOpen}
          title="Код подтверждения"
          trigger={
            <Button type="button" onClick={() => setOpen(true)}>
              У нижнего края
            </Button>
          }
        >
          <p style={{ margin: 0 }}>Должен открыться выше кнопки.</p>
        </Popover>
      </div>
    );
  },
};

export const FlipNearTop: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div style={{ padding: 24 }}>
        <Popover
          open={open}
          onOpenChange={setOpen}
          title="Подсказка"
          trigger={
            <Button type="button" onClick={() => setOpen(true)}>
              У верхнего края
            </Button>
          }
        >
          <p style={{ margin: 0 }}>
            Сначала сверху; при нехватке места flip вниз.
          </p>
        </Popover>
      </div>
    );
  },
};

export const MinWidthOnNarrowTrigger: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div style={{ padding: 48 }}>
        <Labeled label="Узкий якорь — панель не уже 280px" wide maxWidth={360}>
          <Popover
            open={open}
            onOpenChange={setOpen}
            title="Код подтверждения"
            trigger={
              <Button type="button" onClick={() => setOpen(true)}>
                SMS
              </Button>
            }
          >
            <p style={{ margin: 0 }}>Ширина панели не привязана к кнопке.</p>
          </Popover>
        </Labeled>
      </div>
    );
  },
};

type RowPopoverId = 'save' | 'logout' | 'delete';

export const ThreeButtonsInRow: Story = {
  render: () => {
    const [active, setActive] = useState<RowPopoverId | null>(null);

    const openOnly = (id: RowPopoverId) => {
      setActive(id);
    };

    return (
      <div style={{ padding: 48, maxWidth: 720 }}>
        <LabeledBlock title="Три якоря в одной строке — у каждого свой popover">
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 'var(--space-2) var(--space-4)',
            }}
          >
            <Popover
              open={active === 'save'}
              onOpenChange={next => setActive(next ? 'save' : null)}
              title="Сохранить?"
              placement="top-start"
              trigger={
                <Button type="button" onClick={() => openOnly('save')}>
                  Сохранить
                </Button>
              }
            >
              <p style={{ margin: 0 }}>Подтверждение сохранения профиля.</p>
            </Popover>

            <Popover
              open={active === 'logout'}
              onOpenChange={next => setActive(next ? 'logout' : null)}
              title="Выйти?"
              placement="top-start"
              trigger={
                <Button type="button" variant="link" onClick={() => openOnly('logout')}>
                  Выйти
                </Button>
              }
            >
              <p style={{ margin: 0 }}>Сессия будет завершена.</p>
            </Popover>

            <Popover
              open={active === 'delete'}
              onOpenChange={next => setActive(next ? 'delete' : null)}
              title="Удалить?"
              placement="top-start"
              trigger={
                <Button
                  type="button"
                  variant="link"
                  onClick={() => openOnly('delete')}
                >
                  Удалить
                </Button>
              }
            >
              <p style={{ margin: 0 }}>Действие необратимо через 30 дней.</p>
            </Popover>
          </div>
        </LabeledBlock>
      </div>
    );
  },
};

export const ThreeButtonsInRowAllIndependent: Story = {
  render: () => {
    const [openSave, setOpenSave] = useState(false);
    const [openLogout, setOpenLogout] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);

    return (
      <div style={{ padding: 48, maxWidth: 720 }}>
        <LabeledBlock title="Независимые controlled — могут быть открыты одновременно">
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 'var(--space-2) var(--space-4)',
            }}
          >
            <Popover
              open={openSave}
              onOpenChange={setOpenSave}
              title="Сохранить"
              trigger={
                <Button type="button" onClick={() => setOpenSave(true)}>
                  Сохранить
                </Button>
              }
            >
              <p style={{ margin: 0 }}>Popover 1</p>
            </Popover>

            <Popover
              open={openLogout}
              onOpenChange={setOpenLogout}
              title="Выйти"
              trigger={
                <Button type="button" variant="outline" onClick={() => setOpenLogout(true)}>
                  Выйти
                </Button>
              }
            >
              <p style={{ margin: 0 }}>Popover 2</p>
            </Popover>

            <Popover
              open={openDelete}
              onOpenChange={setOpenDelete}
              title="Удалить"
              trigger={
                <Button type="button" variant="destructive" onClick={() => setOpenDelete(true)}>
                  Удалить
                </Button>
              }
            >
              <p style={{ margin: 0 }}>Popover 3</p>
            </Popover>
          </div>
        </LabeledBlock>
      </div>
    );
  },
};

const usageExample = `import { useState } from 'react';
import { Popover, Button } from '@de-kit/st-ui';

function SaveWithSms() {
  const [open, setOpen] = useState(false);

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      title="Код подтверждения"
      triggerClassName="popover-trigger--full-width"
      trigger={
        <Button type="button" onClick={() => setOpen(true)}>
          Сохранить изменения
        </Button>
      }
    >
      {/* форма СМС */}
    </Popover>
  );
}`;

const rowExample = `const [active, setActive] = useState<'save' | 'logout' | null>(null);

<div style={{ display: 'flex', gap: 8 }}>
  <Popover
    open={active === 'save'}
    onOpenChange={next => setActive(next ? 'save' : null)}
    title="Сохранить?"
    trigger={<Button type="button">Сохранить</Button>}
  >
    ...
  </Popover>
  <Popover
    open={active === 'logout'}
    onOpenChange={next => setActive(next ? 'logout' : null)}
    title="Выйти?"
    trigger={<Button type="button" variant="link">Выйти</Button>}
  >
    ...
  </Popover>
</div>`;

export const Usage: Story = {
  render: () => (
    <div style={storyStack}>
      <LabeledBlock title="Примеры кода">
        <Labeled label="Controlled + якорь" wide maxWidth={720}>
          <CodeBlock code={usageExample} />
        </Labeled>
        <Labeled label="Несколько якорей в строке" wide maxWidth={720}>
          <CodeBlock code={rowExample} />
        </Labeled>
      </LabeledBlock>
    </div>
  ),
};
