import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Field } from '@/components/field';
import { RadioGroup, RadioInput } from './radio';

describe('RadioInput', () => {
  it('связывает label и помечает ошибку классом', () => {
    render(<RadioInput label="Да" title="Подсказка" error />);
    const radio = screen.getByLabelText('Да');
    expect(radio).toHaveAttribute('type', 'radio');
    expect(radio).toHaveAttribute('title', 'Подсказка');
    expect(radio).toHaveClass('radio__input');
    expect(radio.parentElement).toHaveClass('radio', 'radio--error');
  });

  it('type остаётся radio', () => {
    render(<RadioInput label="Да" type="checkbox" />);
    expect(screen.getByLabelText('Да')).toHaveAttribute('type', 'radio');
  });

  it('вне группы name остаётся на input', () => {
    render(<RadioInput label="Да" name="solo" />);
    expect(screen.getByLabelText('Да')).toHaveAttribute('name', 'solo');
  });
});

describe('RadioGroup', () => {
  it('рендерит fieldset и легенду, пункты делят name группы', () => {
    render(
      <RadioGroup label="Пол" name="gender">
        <RadioInput label="Женский" />
        <RadioInput label="Мужской" name="other" />
      </RadioGroup>,
    );

    const group = screen.getByRole('radiogroup', { name: 'Пол' });
    expect(group.tagName).toBe('FIELDSET');
    expect(screen.getByText('Пол').tagName).toBe('LEGEND');

    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(2);

    for (const radio of radios) {
      expect(radio).toHaveAttribute('name', 'gender');
      expect(group).toContainElement(radio);
    }
  });

  it('в Field берёт имя у лейбла поля и подхватывает ошибку', () => {
    render(
      <Field label="Возраст" required error="Выберите возраст">
        <RadioGroup name="age">
          <RadioInput label="18-24" value="18" />
        </RadioGroup>
      </Field>,
    );

    const group = screen.getByRole('radiogroup', { name: 'Возраст' });
    const error = screen.getByRole('alert');
    expect(screen.queryByText('Возраст', { selector: 'legend' })).toBeNull();
    expect(group).toHaveAttribute('aria-invalid', 'true');
    expect(group).toHaveAttribute('aria-required', 'true');
    expect(group).toHaveAttribute('aria-describedby', error.id);
    expect(group).toHaveAttribute('aria-errormessage', error.id);
  });

  it('обязательная группа держит форму и показывает ошибку поля', async () => {
    render(
      <form>
        <Field label="Возраст" required>
          <RadioGroup name="age">
            <RadioInput label="18-24" value="18" />
            <RadioInput label="25-34" value="25" />
          </RadioGroup>
        </Field>
      </form>,
    );

    const radios = screen.getAllByRole('radio');
    const form = radios[0]?.closest('form');
    expect(form).not.toBeNull();
    expect(radios[0]).toBeRequired();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    let valid = true;
    act(() => {
      valid = form?.checkValidity() ?? true;
    });

    expect(valid).toBe(false);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Поле «Возраст» обязательно',
    );

    await userEvent.click(radios[0] as HTMLElement);

    expect(form?.checkValidity()).toBe(true);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('required у группы работает и без Field', () => {
    render(
      <RadioGroup label="Пол" name="gender" required>
        <RadioInput label="Женский" value="f" />
        <RadioInput label="Мужской" value="m" />
      </RadioGroup>,
    );

    expect(screen.getByRole('radiogroup', { name: 'Пол' })).toHaveAttribute(
      'aria-required',
      'true',
    );

    for (const radio of screen.getAllByRole('radio')) {
      expect(radio).toBeRequired();
    }
  });
});
