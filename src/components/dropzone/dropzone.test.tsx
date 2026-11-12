import { createRef } from 'react';
import {
  act,
  createEvent,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Field } from '@/components/field';
import { Dropzone } from './index';

const image = (name = 'shot.png', type = 'image/png', size?: number) => {
  const file = new File([new Uint8Array(size ?? 4)], name, { type });
  return file;
};

const zone = () => {
  const node = document.querySelector('.dropzone__zone');
  if (!(node instanceof HTMLElement)) throw new Error('зона не найдена');
  return node;
};

// userEvent.upload молча выкидывает файл, если он не проходит accept.
// В jsdom нет DataTransfer: testing-library кладёт plain-object в dataTransfer.
const drop = (files: File | File[]) => {
  fireEvent.drop(zone(), {
    dataTransfer: { files: Array.isArray(files) ? files : [files] },
  });
};

const drag = (type: 'dragOver' | 'dragLeave', relatedTarget?: Node | null) => {
  const node = zone();
  const event = createEvent[type](node);
  if (relatedTarget) {
    Object.defineProperty(event, 'relatedTarget', { value: relatedTarget });
  }
  fireEvent(node, event);
};

describe('Dropzone', () => {
  it('рендерит подпись, подсказку пресета и accept', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Dropzone
        ref={ref}
        className="mine"
        label="фото"
        accept="image"
        onFiles={() => {}}
      />,
    );

    expect(ref.current).toHaveClass('dropzone', 'mine');
    expect(ref.current).not.toHaveClass('dropzone--wide');
    expect(screen.getByText('фото')).toBeInTheDocument();
    expect(screen.getByText('файл фото')).toBeInTheDocument();
    const input = screen.getByLabelText('фото');
    expect(input).toHaveAttribute(
      'accept',
      expect.stringContaining('image/png'),
    );
    expect(input).toHaveAttribute('accept', expect.stringContaining('.heic'));
    expect(input).not.toHaveAttribute('multiple');
  });

  it('wide, свой fileLabel и расширение с точкой', () => {
    const { container } = render(
      <Dropzone
        variant="wide"
        label="Скриншот"
        fileLabel="скриншот"
        accept={{ mimeTypes: ['application/pdf'], extensions: ['.pdf'] }}
        multiple
        onFiles={() => {}}
      />,
    );

    expect(container.querySelector('.dropzone')).toHaveClass('dropzone--wide');
    expect(screen.getByText('файл скриншот')).toBeInTheDocument();
    const input = screen.getByLabelText('Скриншот');
    expect(input).toHaveAttribute('accept', 'application/pdf,.pdf');
    expect(input).toHaveAttribute('multiple');
  });

  it('без accept берёт любой файл и не рисует «файл …»', async () => {
    const onFiles = vi.fn<(files: File[]) => void>();
    render(<Dropzone onFiles={onFiles} />);

    expect(screen.queryByText(/^файл /)).not.toBeInTheDocument();
    const input = screen.getByLabelText(/Перетащите сюда/);
    expect(input).not.toHaveAttribute('accept');

    const file = new File(['a'], 'note.txt', { type: 'text/plain' });
    await userEvent.upload(input, file);
    expect(onFiles).toHaveBeenCalledWith([file]);
  });

  it('отдаёт файл по mime и по расширению, один и тот же можно выбрать снова', async () => {
    const onFiles = vi.fn<(files: File[]) => void>();
    render(<Dropzone label="Фото" accept="image" onFiles={onFiles} />);
    const input = screen.getByLabelText('Фото');

    const byMime = image('notes.txt', 'image/png');
    await userEvent.upload(input, byMime);
    const byExt = image('photo.JPEG', 'application/octet-stream');
    await userEvent.upload(input, byExt);

    expect(onFiles).toHaveBeenNthCalledWith(1, [byMime]);
    expect(onFiles).toHaveBeenNthCalledWith(2, [byExt]);
  });

  it('отклоняет чужой тип, размер и свой validate', async () => {
    const onFiles = vi.fn<(files: File[]) => void>();
    const { rerender } = render(
      <Dropzone label="Фото" accept="image" onFiles={onFiles} />,
    );
    const input = () => screen.getByLabelText('Фото');

    drop(new File(['a'], 'doc.pdf', { type: 'application/pdf' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Выберите файл фото');
    expect(onFiles).not.toHaveBeenCalled();

    rerender(
      <Dropzone
        label="Фото"
        accept={{ mimeTypes: ['image/png'] }}
        onFiles={onFiles}
      />,
    );
    drop(new File(['a'], 'doc.pdf', { type: 'application/pdf' }));
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Выберите подходящий файл',
    );

    rerender(
      <Dropzone label="Фото" accept="image" maxSize={4} onFiles={onFiles} />,
    );
    await userEvent.upload(input(), image('big.png', 'image/png', 5));
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Файл не должен превышать 4 Б',
    );

    rerender(
      <Dropzone
        label="Фото"
        accept="image"
        maxSize={2 * 1024}
        onFiles={onFiles}
      />,
    );
    await userEvent.upload(input(), image('big.png', 'image/png', 3 * 1024));
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Файл не должен превышать 2 КБ',
    );

    rerender(
      <Dropzone label="Фото" accept="image" maxSize={1500} onFiles={onFiles} />,
    );
    await userEvent.upload(input(), image('big.png', 'image/png', 1600));
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Файл не должен превышать 1.5 КБ',
    );

    rerender(
      <Dropzone
        label="Фото"
        accept="image"
        maxSize={2 * 1024 * 1024}
        onFiles={onFiles}
      />,
    );
    await userEvent.upload(
      input(),
      image('big.png', 'image/png', 2 * 1024 * 1024 + 1),
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Файл не должен превышать 2 МБ',
    );

    rerender(
      <Dropzone
        label="Фото"
        accept="image"
        maxSize={Math.round(1.5 * 1024 * 1024)}
        onFiles={onFiles}
      />,
    );
    await userEvent.upload(
      input(),
      image('big.png', 'image/png', Math.round(1.5 * 1024 * 1024) + 1),
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Файл не должен превышать 1.5 МБ',
    );

    rerender(
      <Dropzone
        label="Фото"
        accept="video"
        onFiles={onFiles}
        validate={() => 'Видео не должно быть длиннее 2 минут'}
      />,
    );
    await userEvent.upload(
      input(),
      new File(['a'], 'clip.mp4', { type: 'video/mp4' }),
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Видео не должно быть длиннее 2 минут',
    );
    expect(onFiles).not.toHaveBeenCalled();
  });

  it('показывает ошибку пропа и прячет её после успешного файла', async () => {
    const onFiles = vi.fn<(files: File[]) => void>();
    const { rerender } = render(
      <Dropzone
        label="Фото"
        accept="image"
        error="Сервер недоступен"
        onFiles={onFiles}
      />,
    );

    const input = screen.getByLabelText('Фото');
    expect(screen.getByRole('alert')).toHaveTextContent('Сервер недоступен');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-errormessage');

    rerender(<Dropzone label="Фото" accept="image" onFiles={onFiles} />);
    await userEvent.upload(input, image());
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(onFiles).toHaveBeenCalled();
  });

  it('в Field берёт id и aria-invalid с поля', () => {
    render(
      <Field label="Вложение" error="Нужен файл">
        <Dropzone onFiles={() => {}} />
      </Field>,
    );

    const input = screen.getByLabelText('Вложение');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-errormessage');
  });

  it('свой id уходит на инпут файла, не на корень', () => {
    render(
      <Field label="Вложение">
        <Dropzone id="file" data-testid="zone" onFiles={() => {}} />
      </Field>,
    );

    const input = document.getElementById('file');
    expect(input).toHaveAttribute('type', 'file');
    expect(screen.getByTestId('zone')).not.toHaveAttribute('id');
  });

  it('multiple: чужой файл в пачке отклоняет всю пачку', async () => {
    const onFiles = vi.fn<(files: File[]) => void>();
    render(<Dropzone label="Фото" accept="image" multiple onFiles={onFiles} />);
    const input = screen.getByLabelText('Фото');

    drop([
      image('a.png'),
      new File(['a'], 'b.pdf', { type: 'application/pdf' }),
    ]);
    expect(onFiles).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toBeInTheDocument();

    const ok = [image('a.png'), image('b.jpg', 'image/jpeg')];
    await userEvent.upload(input, ok);
    expect(onFiles).toHaveBeenCalledWith(ok);
  });

  it('дроп заменяет файл, disabled и уход курсора на ребёнка не сбрасывают drag', () => {
    const onFiles = vi.fn<(files: File[]) => void>();
    const { rerender } = render(
      <Dropzone label="Фото" accept="image" onFiles={onFiles} />,
    );

    drag('dragOver');
    expect(zone()).toHaveClass('dropzone__zone--drag');
    drag('dragLeave', zone().querySelector('.dropzone__pick'));
    expect(zone()).toHaveClass('dropzone__zone--drag');
    drag('dragLeave', document.body);
    expect(zone()).not.toHaveClass('dropzone__zone--drag');

    drop(image());
    expect(onFiles).toHaveBeenCalledTimes(1);

    rerender(
      <Dropzone label="Фото" accept="image" disabled onFiles={onFiles} />,
    );
    drag('dragOver');
    expect(zone()).not.toHaveClass('dropzone__zone--drag');
    expect(screen.getByLabelText('Фото')).toBeDisabled();
    drop(image('b.png'));
    expect(onFiles).toHaveBeenCalledTimes(1);
  });

  it('превью прячет пунктирный сценарий, удаление чистит ошибку выбора', async () => {
    const onClear = vi.fn<() => void>();
    const onFiles = vi.fn<(files: File[]) => void>();
    const { rerender } = render(
      <Dropzone label="Фото" accept="image" onFiles={onFiles} />,
    );

    drop(new File(['a'], 'a.pdf', { type: 'application/pdf' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();

    rerender(
      <Dropzone
        label="Фото 1"
        accept="image"
        preview={<img src="/photo.png" alt="Загруженное фото" />}
        onClear={onClear}
        onFiles={onFiles}
      />,
    );

    expect(screen.queryByText(/Перетащите/)).not.toBeInTheDocument();
    expect(screen.getByAltText('Загруженное фото')).toBeInTheDocument();
    expect(zone()).toHaveClass('dropzone__zone--filled');

    await userEvent.click(screen.getByRole('button', { name: 'Удалить файл' }));
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('кнопка в children и Enter по инпуту не путаются', () => {
    const onFiles = vi.fn<(files: File[]) => void>();
    render(
      <Dropzone label="Фото" accept="image" onFiles={onFiles}>
        <button type="button">Отменить</button>
      </Dropzone>,
    );

    const input = screen.getByLabelText('Фото');
    const click = vi.spyOn(input, 'click');
    fireEvent.click(screen.getByRole('button', { name: 'Отменить' }));
    expect(click).not.toHaveBeenCalled();

    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.keyDown(input, { key: ' ' });
    fireEvent.keyDown(input, { key: 'Tab' });
    expect(click).toHaveBeenCalledTimes(2);
  });

  it('прогресс: строка и произвольная подпись', () => {
    const { rerender } = render(
      <Dropzone
        label="Видео"
        accept="video"
        progress={40}
        progressLabel="Обработка: 40%"
        onFiles={() => {}}
      />,
    );

    expect(
      screen.getByRole('progressbar', { name: 'Обработка: 40%' }),
    ).toHaveValue(40);

    rerender(
      <Dropzone
        label="Видео"
        accept="video"
        progress={10}
        progressLabel={<span>Обработка</span>}
        onFiles={() => {}}
      />,
    );
    expect(
      screen.getByRole('progressbar', { name: 'Загрузка: 10%' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Обработка')).toBeInTheDocument();
  });

  it('игнорирует устаревшую проверку и ловит исключение validate', async () => {
    const resolvers: Array<(value: string | null) => void> = [];
    const onFiles = vi.fn<(files: File[]) => void>();
    const validate = (file: File) =>
      new Promise<string | null>(resolve => {
        resolvers.push(resolve);
        void file;
      });

    const { rerender } = render(
      <Dropzone
        label="Фото"
        accept="image"
        onFiles={onFiles}
        validate={validate}
      />,
    );
    const input = screen.getByLabelText('Фото');
    await userEvent.upload(input, image('a.png'));
    await userEvent.upload(input, image('b.png'));

    await act(async () => {
      resolvers[0]?.(null);
    });
    expect(onFiles).not.toHaveBeenCalled();

    await act(async () => {
      resolvers[1]?.(null);
    });
    expect(onFiles).toHaveBeenCalledTimes(1);

    rerender(
      <Dropzone
        label="Фото"
        accept="image"
        onFiles={onFiles}
        validate={() => Promise.reject(new Error('metadata'))}
      />,
    );
    await userEvent.upload(screen.getByLabelText('Фото'), image());
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Не удалось проверить файл',
    );
  });
});
