export type LocalizedString = { [key: string]: string };

export type Item = {
  key?: string;
  label?: LocalizedString | string;
  absoluteIndex?: number;
};

export type Row = {
  key: string;
  title: Record<string, string>;
  text: Record<string, string>;
  values: Array<Item> | undefined;
};
