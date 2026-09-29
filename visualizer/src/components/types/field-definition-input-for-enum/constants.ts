export type LocalizedString = { [key: string]: string };

export type Item = {
  // Client-only stable identity for drag reordering — never sent to the API.
  // The row's `key` can't be used since it's live-editable and may be blank
  // or momentarily duplicated while the user is typing.
  _uid: string;
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
