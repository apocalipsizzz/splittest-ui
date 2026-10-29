import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { IconArrowLeft } from '@/icons/icon-arrow-left';
import { IconArrowRight } from '@/icons/icon-arrow-right';
import { IconPreview } from '@/icons';
import { Labeled, LabeledBlock } from '@/stories/labeled';
import { storyStack } from '@/stories/story-stack';
import { Button, type ButtonSize } from './button';

const imageCover = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: 'inherit',
} as const;

const PREVIEW_SRC =
  'https://api.splittest.ru/storage/min_images/34702/0bdca0b1-9060-4b1f-b15e-f88ac0945e88.png';

const iconSizes = ['sm', 'md', 'lg'] as const satisfies readonly ButtonSize[];

type ForcedState = 'active' | 'focus' | 'focus-visible';

function forcedState(state?: ForcedState) {
  if (state === 'active') return { 'data-active': true } as const;
  if (state === 'focus') return { 'data-focus': true } as const;
  if (state === 'focus-visible') return { 'data-focus-visible': true } as const;
  return {};
}

type ShownState = 'default' | ForcedState | 'disabled' | 'loading';

const shownStates = [
  'default',
  'active',
  'focus',
  'focus-visible',
  'disabled',
  'loading',
] as const satisfies readonly ShownState[];

function asForced(state: ShownState): ForcedState | undefined {
  if (state === 'active' || state === 'focus' || state === 'focus-visible') {
    return state;
  }
  return undefined;
}

function shownProps(state: ShownState) {
  return {
    disabled: state === 'disabled',
    loading: state === 'loading',
    ...forcedState(asForced(state)),
  };
}

function StateBlock(props: {
  title: string;
  renderControl: (state: ShownState) => ReactNode;
}) {
  const { title, renderControl } = props;

  return (
    <LabeledBlock title={title}>
      {shownStates.map(state => (
        <Labeled key={state} label={state}>
          {renderControl(state)}
        </Labeled>
      ))}
    </LabeledBlock>
  );
}

function ImageButton(props: {
  label: string;
  disabled?: boolean;
  loading?: boolean;
  href?: string;
  state?: ForcedState;
}) {
  const { label, disabled, loading, href, state } = props;
  const stateProps = forcedState(state);
  const content = (
    <>
      <img src={PREVIEW_SRC} alt="" style={imageCover} />
      <span className="button--image__icon">
        <IconPreview />
      </span>
    </>
  );

  if (href) {
    return (
      <Button
        asChild
        variant="image"
        aria-label={label}
        loading={loading}
        {...stateProps}
      >
        <a href={href}>{content}</a>
      </Button>
    );
  }

  return (
    <Button
      variant="image"
      aria-label={label}
      disabled={disabled}
      loading={loading}
      {...stateProps}
    >
      {content}
    </Button>
  );
}

function IconButton(props: {
  label: string;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  state?: ForcedState;
  children?: ReactNode;
}) {
  const { label, size, disabled, loading, state, children } = props;

  return (
    <Button
      variant="icon"
      size={size}
      aria-label={label}
      disabled={disabled}
      loading={loading}
      {...forcedState(state)}
    >
      {children ?? <IconPreview />}
    </Button>
  );
}

const meta = {
  title: 'Components/Button',
  component: Button,
  args: {
    children: 'Кнопка',
    variant: 'default',
    size: 'md',
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['default', 'outline', 'link', 'image', 'icon'],
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
    },
    loading: {
      control: 'boolean',
    },
    asChild: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <LabeledBlock title="variant">
      <Labeled label="default">
        <Button>Кнопка</Button>
      </Labeled>
      <Labeled label="outline">
        <Button variant="outline">Кнопка</Button>
      </Labeled>
      <Labeled label="link">
        <Button variant="link">Кнопка</Button>
      </Labeled>
      <Labeled label="image">
        <ImageButton label="Картинка" />
      </Labeled>
      <Labeled label="icon">
        <IconButton label="Иконка" />
      </Labeled>
    </LabeledBlock>
  ),
};

export const AsChild: Story = {
  render: () => (
    <LabeledBlock title="asChild">
      <Labeled label="default">
        <Button asChild>
          <a href="https://example.com">Кнопка</a>
        </Button>
      </Labeled>
      <Labeled label="outline">
        <Button asChild variant="outline">
          <a href="https://example.com">Кнопка</a>
        </Button>
      </Labeled>
      <Labeled label="link">
        <Button asChild variant="link">
          <a href="https://example.com">Кнопка</a>
        </Button>
      </Labeled>
      <Labeled label="icon">
        <Button asChild variant="icon" aria-label="Иконка">
          <a href="https://example.com">
            <IconPreview />
          </a>
        </Button>
      </Labeled>
      <Labeled label="disabled">
        <Button asChild disabled>
          <a href="https://example.com">Кнопка</a>
        </Button>
      </Labeled>
      <Labeled label="loading">
        <Button asChild loading>
          <a href="https://example.com">Кнопка</a>
        </Button>
      </Labeled>
    </LabeledBlock>
  ),
};

export const Image: Story = {
  render: () => (
    <LabeledBlock title="image">
      <Labeled label="default">
        <ImageButton label="Картинка" />
      </Labeled>
      <Labeled label="loading">
        <ImageButton label="Картинка, загрузка" loading />
      </Labeled>
      <Labeled label="disabled">
        <ImageButton label="Картинка, недоступно" disabled />
      </Labeled>
      <Labeled label="asChild">
        <ImageButton label="Картинка, ссылка" href="https://example.com" />
      </Labeled>
    </LabeledBlock>
  ),
};

export const Icon: Story = {
  render: () => (
    <div style={storyStack}>
      <LabeledBlock title="size">
        {iconSizes.map(size => (
          <Labeled key={size} label={size}>
            <IconButton size={size} label={`Иконка ${size}`} />
          </Labeled>
        ))}
      </LabeledBlock>
      <LabeledBlock title="state">
        <Labeled label="default">
          <IconButton label="Иконка" />
        </Labeled>
        <Labeled label="loading">
          <IconButton label="Иконка, загрузка" loading />
        </Labeled>
        <Labeled label="disabled">
          <IconButton label="Иконка, недоступно" disabled />
        </Labeled>
      </LabeledBlock>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={storyStack}>
      <StateBlock
        title="default"
        renderControl={state => <Button {...shownProps(state)}>Кнопка</Button>}
      />
      <StateBlock
        title="outline"
        renderControl={state => (
          <Button variant="outline" {...shownProps(state)}>
            Кнопка
          </Button>
        )}
      />
      <StateBlock
        title="link"
        renderControl={state => (
          <Button variant="link" {...shownProps(state)}>
            Кнопка
          </Button>
        )}
      />
      <StateBlock
        title="icon"
        renderControl={state => (
          <IconButton
            label={`Иконка, ${state}`}
            disabled={state === 'disabled'}
            loading={state === 'loading'}
            state={asForced(state)}
          />
        )}
      />
      <StateBlock
        title="image"
        renderControl={state => (
          <ImageButton
            label={`Картинка, ${state}`}
            disabled={state === 'disabled'}
            loading={state === 'loading'}
            state={asForced(state)}
          />
        )}
      />
    </div>
  ),
};

export const Icons: Story = {
  render: () => (
    <div style={storyStack}>
      <LabeledBlock title="default">
        <Labeled label="слева">
          <Button>
            <IconArrowLeft width={20} height={20} />
            Кнопка
          </Button>
        </Labeled>
        <Labeled label="справа">
          <Button>
            Кнопка
            <IconArrowRight width={20} height={20} />
          </Button>
        </Labeled>
        <Labeled label="loading">
          <Button loading>Кнопка</Button>
        </Labeled>
      </LabeledBlock>
      <LabeledBlock title="outline">
        <Labeled label="слева">
          <Button variant="outline">
            <IconArrowLeft width={20} height={20} />
            Кнопка
          </Button>
        </Labeled>
        <Labeled label="справа">
          <Button variant="outline">
            Кнопка
            <IconArrowRight width={20} height={20} />
          </Button>
        </Labeled>
        <Labeled label="loading">
          <Button variant="outline" loading>
            Кнопка
          </Button>
        </Labeled>
      </LabeledBlock>
      <LabeledBlock title="link">
        <Labeled label="слева">
          <Button variant="link">
            <IconArrowLeft width={20} height={20} />
            Кнопка
          </Button>
        </Labeled>
        <Labeled label="справа">
          <Button variant="link">
            Кнопка
            <IconArrowRight width={20} height={20} />
          </Button>
        </Labeled>
        <Labeled label="loading">
          <Button variant="link" loading>
            Кнопка
          </Button>
        </Labeled>
      </LabeledBlock>
      <LabeledBlock title="icon">
        <Labeled label="назад">
          <IconButton label="Назад">
            <IconArrowLeft width={20} height={20} />
          </IconButton>
        </Labeled>
        <Labeled label="дальше">
          <IconButton label="Дальше">
            <IconArrowRight width={20} height={20} />
          </IconButton>
        </Labeled>
        <Labeled label="превью">
          <IconButton label="Превью" />
        </Labeled>
      </LabeledBlock>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={storyStack}>
      <LabeledBlock title="size">
        <Labeled label="sm">
          <Button size="sm">Кнопка</Button>
        </Labeled>
        <Labeled label="md">
          <Button size="md">Кнопка</Button>
        </Labeled>
        <Labeled label="lg">
          <Button size="lg">Кнопка</Button>
        </Labeled>
      </LabeledBlock>
      <LabeledBlock title="fullWidth">
        <Labeled label="md" wide>
          <Button fullWidth>Кнопка</Button>
        </Labeled>
        <Labeled label="lg outline" wide>
          <Button fullWidth size="lg" variant="outline">
            Кнопка
          </Button>
        </Labeled>
        <Labeled label="loading" wide>
          <Button fullWidth loading>
            Кнопка
          </Button>
        </Labeled>
      </LabeledBlock>
      <LabeledBlock title="icon">
        {iconSizes.map(size => (
          <Labeled key={size} label={size}>
            <IconButton size={size} label={`Иконка ${size}`} />
          </Labeled>
        ))}
      </LabeledBlock>
    </div>
  ),
};
