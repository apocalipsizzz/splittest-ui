import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import { Button } from '@/components/button';
import { CheckboxInput } from '@/components/checkbox';
import { DatePicker } from '@/components/date-picker';
import { Dropzone } from '@/components/dropzone';
import { Field } from '@/components/field';
import { Form, FormActions, FormSubmit } from '@/components/form';
import { HR } from '@/components/hr';
import { Input } from '@/components/input';
import { PhoneInput } from '@/components/phone-input';
import { Popover } from '@/components/popover';
import { PopupSheet } from '@/components/popup-sheet';
import { Progress } from '@/components/progress';
import { RadioGroup, RadioInput } from '@/components/radio';
import { Select } from '@/components/select';
import { SelectSearch } from '@/components/select-search';
import { Spinner } from '@/components/spinner';
import { TextArea } from '@/components/textarea';

import { formatViolations, runAxe } from './axe';

const CITIES = [
  { value: 'msk', label: 'Москва' },
  { value: 'spb', label: 'Санкт-Петербург' },
  { value: 'kzn', label: 'Казань', disabled: true },
];

/** Проверяем весь `document.body`: лист и портал живут вне контейнера. */
const axeViolations = async () => formatViolations(await runAxe(document.body));

describe('доступность компонентов (axe)', () => {
  it('Button: текст, иконка с aria-label и состояние загрузки', async () => {
    render(
      <>
        <Button>Сохранить</Button>
        <Button variant="outline" disabled>
          Отменить
        </Button>
        <Button loading>Отправка</Button>
      </>,
    );
    expect(await axeViolations()).toEqual([]);
  });

  it('Input, TextArea и PhoneInput внутри Field с подсказкой и ошибкой', async () => {
    render(
      <>
        <Field label="Название" hint="Видно участникам" required>
          <Input />
        </Field>
        <Field label="Описание" error="Слишком короткое">
          <TextArea />
        </Field>
        <Field label="Телефон">
          <PhoneInput />
        </Field>
      </>,
    );
    expect(await axeViolations()).toEqual([]);
  });

  it('CheckboxInput и RadioGroup с подписями', async () => {
    render(
      <>
        <CheckboxInput label="Согласен" />
        <RadioGroup name="pick" label="Выберите вариант">
          <RadioInput value="a" label="Вариант А" />
          <RadioInput value="b" label="Вариант Б" />
        </RadioGroup>
      </>,
    );
    expect(await axeViolations()).toEqual([]);
  });

  it('Select и SelectSearch с подписями', async () => {
    render(
      <>
        <Field label="Город">
          <Select options={CITIES} value={null} onChange={() => {}} />
        </Field>
        <Field label="Поиск города">
          <SelectSearch options={CITIES} value={null} onChange={() => {}} />
        </Field>
      </>,
    );
    expect(await axeViolations()).toEqual([]);
  });

  it('DatePicker с подписью', async () => {
    render(
      <Field label="Дата рождения">
        <DatePicker value={null} onChange={() => {}} />
      </Field>,
    );
    expect(await axeViolations()).toEqual([]);
  });

  it('Dropzone: пустая зона, ошибка, прогресс и превью', async () => {
    render(
      <>
        <Dropzone label="Фото" accept="image" onFiles={() => {}} />
        <Dropzone
          label="Аудио"
          accept="audio"
          error="Файл слишком большой"
          onFiles={() => {}}
        />
        <Dropzone
          label="Видео"
          accept="video"
          progress={40}
          progressLabel="Загрузка: 40%"
          onFiles={() => {}}
        />
        <Dropzone
          label="Фото 1"
          accept="image"
          preview={<img src="/photo.png" alt="Загруженное фото" />}
          onClear={() => {}}
          onFiles={() => {}}
        />
      </>,
    );
    expect(await axeViolations()).toEqual([]);
  });

  it('Spinner и HR', async () => {
    render(
      <>
        <Spinner />
        <HR />
        <Progress value={40} aria-label="Загрузка: 40%" />
      </>,
    );
    expect(await axeViolations()).toEqual([]);
  });

  it('Form с отправкой и кнопками действий', async () => {
    render(
      <Form onSubmit={() => {}}>
        <Field label="Имя" required>
          <Input name="name" />
        </Field>
        <FormActions>
          <FormSubmit>Отправить</FormSubmit>
        </FormActions>
      </Form>,
    );
    expect(await axeViolations()).toEqual([]);
  });

  it('PopupSheet открыт: диалог с заголовком', async () => {
    render(
      <PopupSheet open onClose={() => {}} title="Удалить тест">
        <p>Действие необратимо.</p>
        <Button>Удалить</Button>
      </PopupSheet>,
    );
    await waitFor(() => expect(screen.getByRole('dialog')).toHaveFocus());
    expect(await axeViolations()).toEqual([]);
  });

  it('Popover открыт: панель рядом с триггером', async () => {
    const user = userEvent.setup();
    render(
      <Popover
        openOnTriggerClick
        title="Действия"
        trigger={<Button variant="outline">Ещё</Button>}
      >
        <Button variant="link">Копировать</Button>
      </Popover>,
    );
    await user.click(screen.getByRole('button', { name: 'Ещё' }));
    await screen.findByRole('button', { name: 'Копировать' });
    expect(await axeViolations()).toEqual([]);
  });

  it('Select открыт: список вариантов доступен через aria-activedescendant', async () => {
    const user = userEvent.setup();
    const Controlled = () => {
      const [value, setValue] = useState<string | null>(null);
      return (
        <Field label="Город">
          <Select options={CITIES} value={value} onChange={setValue} />
        </Field>
      );
    };
    render(<Controlled />);
    await user.click(screen.getByRole('combobox', { name: 'Город' }));
    await screen.findByRole('listbox');
    expect(await axeViolations()).toEqual([]);
  });
});
