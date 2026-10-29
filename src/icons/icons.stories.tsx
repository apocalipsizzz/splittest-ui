import type { ReactNode } from 'react';

import { Labeled, LabeledBlock } from '@/stories/labeled';
import { storyStack } from '@/stories/story-stack';
import * as icons from './index';
import type { IconProps } from './svg';

type IconComponent = (props: IconProps) => ReactNode;

const all: [string, IconComponent][] = [];

for (const [name, Icon] of Object.entries(icons)) {
  if (typeof Icon === 'function') all.push([name, Icon]);
}

all.sort(([left], [right]) => left.localeCompare(right, 'en'));

const groups = [
  {
    title: 'Иконки',
    items: all.filter(([name]) => name.startsWith('Icon')),
  },
  {
    title: 'Контролы',
    items: all.filter(([name]) => name.startsWith('Control')),
  },
  {
    title: 'Логотипы',
    items: all.filter(([name]) => name.startsWith('Logo')),
  },
  {
    title: 'Иллюстрации',
    items: all.filter(([name]) => name.startsWith('Illustration')),
  },
];

export const All = () => (
  <div style={storyStack}>
    <LabeledBlock title="цвет">
      <Labeled label="foreground">
        <icons.IconClose style={{ color: 'var(--color-foreground)' }} />
      </Labeled>
      <Labeled label="accent">
        <icons.IconClose style={{ color: 'var(--color-accent)' }} />
      </Labeled>
      <Labeled label="destructive">
        <icons.IconClose style={{ color: 'var(--color-destructive)' }} />
      </Labeled>
    </LabeledBlock>
    {groups.map(group => (
      <LabeledBlock key={group.title} title={group.title}>
        {group.items.map(([name, Icon]) => (
          <Labeled key={name} label={name}>
            <Icon
              style={
                name.startsWith('Logo') || name.startsWith('Illustration')
                  ? { maxWidth: 96, height: 'auto' }
                  : undefined
              }
            />
          </Labeled>
        ))}
      </LabeledBlock>
    ))}
  </div>
);

export default {
  title: 'Icons',
};
