import type { ReactNode } from 'react';

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

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(108px, 1fr))',
  gap: 12,
} as const;

export const All = () => (
  <div style={{ display: 'grid', gap: 28 }}>
    <div style={{ display: 'flex', gap: 16 }}>
      <icons.IconClose style={{ color: 'var(--color-black)' }} />
      <icons.IconClose style={{ color: 'var(--color-blue)' }} />
      <icons.IconClose style={{ color: 'var(--color-red)' }} />
    </div>
    {groups.map(group => (
      <section key={group.title} style={{ display: 'grid', gap: 12 }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>{group.title}</div>
        <div style={grid}>
          {group.items.map(([name, Icon]) => (
            <div
              key={name}
              style={{
                display: 'grid',
                justifyItems: 'center',
                alignContent: 'start',
                gap: 8,
                color: 'var(--color-black)',
              }}
            >
              <Icon
                style={
                  name.startsWith('Logo') || name.startsWith('Illustration')
                    ? { maxWidth: '100%', height: 'auto' }
                    : undefined
                }
              />
              <span
                style={{
                  fontSize: 11,
                  lineHeight: 1.3,
                  textAlign: 'center',
                  color: 'var(--color-neutral-500)',
                }}
              >
                {name}
              </span>
            </div>
          ))}
        </div>
      </section>
    ))}
  </div>
);

export default {
  title: 'Icons',
};
