export interface SelectSearchable {
  label: string;
  /** Дополнительный текст для поиска. В списке не показывается. */
  keywords?: readonly string[];
}

const RU = 'йцукенгшщзхъфывапролджэячсмитьбю';
const EN = "qwertyuiop[]asdfghjkl;'zxcvbnm,.";

const toEn = new Map<string, string>();
const toRu = new Map<string, string>();

for (let index = 0; index < RU.length; index += 1) {
  const ru = RU[index];
  const en = EN[index];
  if (!ru || !en) continue;

  toEn.set(ru, en);
  toRu.set(en, ru);
}

const normalize = (value: string) =>
  value.toLowerCase().replace(/ё/g, 'е').trim();

/** «Vjcrdf» → «москва»: человек печатал в другой раскладке. */
const swapLayout = (value: string) =>
  [...value.toLowerCase()]
    .map(char => toEn.get(char) ?? toRu.get(char) ?? char)
    .join('');

export const matchesQuery = (text: string, query: string) => {
  const primary = normalize(query);
  if (!primary) return true;

  const haystack = normalize(text);
  if (haystack.includes(primary)) return true;

  const alternate = normalize(swapLayout(query));
  return alternate !== primary && haystack.includes(alternate);
};

export const defaultFilterOption = (
  option: SelectSearchable,
  query: string,
) => {
  if (matchesQuery(option.label, query)) return true;
  return (option.keywords ?? []).some(keyword => matchesQuery(keyword, query));
};

export const filterSelectOptions = <T extends SelectSearchable>(
  options: readonly T[],
  query: string,
  match: (option: T, query: string) => boolean = defaultFilterOption,
): readonly T[] => {
  const normalized = query.trim();
  if (!normalized) return options;
  return options.filter(option => match(option, normalized));
};
