import { createIntl, createIntlCache } from 'react-intl';
import type { TTypeDefinition } from '../../../types/generated/ctp';
import {
  buildFieldDefinition,
  buildTypeDefinition,
  enumFieldType,
  simpleFieldType,
} from '../../../test-utils/models/types';
import createColumnDefinitions from './column-definitions';

const intl = createIntl({ locale: 'en', messages: {} }, createIntlCache());

const row: TTypeDefinition = {
  ...buildTypeDefinition({
    key: 'my-type',
    name: 'English',
    description: 'Desc',
    resourceTypeIds: ['customer', 'order'],
    fieldDefinitions: [
      buildFieldDefinition('a', simpleFieldType('String')),
      buildFieldDefinition('b', simpleFieldType('Boolean')),
      buildFieldDefinition('c', enumFieldType([{ key: 'x', label: 'X' }])),
    ],
  }),
  // Pin the localized values so the locale assertions are deterministic.
  nameAllLocales: [
    { locale: 'en', value: 'English' },
    { locale: 'de', value: 'Deutsch' },
  ] as TTypeDefinition['nameAllLocales'],
  descriptionAllLocales: [
    { locale: 'en', value: 'Desc' },
  ] as TTypeDefinition['descriptionAllLocales'],
  createdAt: '2024-01-02T03:04:05.000Z',
  lastModifiedAt: '2024-02-03T04:05:06.000Z',
};

const build = (dataLocale = 'en') =>
  createColumnDefinitions({ intl, dataLocale, projectLanguages: ['en', 'de'] });
const col = (id: string, dataLocale?: string) => {
  const found = build(dataLocale).find((c) => c.id === id);
  if (!found) throw new Error(`no column ${id}`);
  return found;
};
const value = (
  id: string,
  dataLocale?: string,
  target: TTypeDefinition = row
) => (col(id, dataLocale).accessor as (r: TTypeDefinition) => unknown)(target);

describe('types list column definitions', () => {
  it('defines the expected columns in order', () => {
    expect(build().map((c) => c.id)).toEqual([
      'name',
      'description',
      'key',
      'resourceTypeIds',
      'fieldCount',
      'createdAt',
      'lastModifiedAt',
    ]);
  });

  it('marks key as the row header and only data columns as sortable', () => {
    expect(col('key').isRowHeader).toBe(true);
    expect(
      build()
        .filter((c) => c.isSortable)
        .map((c) => c.id)
    ).toEqual(['name', 'description', 'key', 'createdAt', 'lastModifiedAt']);
  });

  it('localizes name by the data locale', () => {
    expect(value('name', 'en')).toBe('English');
    expect(value('name', 'de')).toBe('Deutsch');
  });

  it('annotates the fallback project language when the data locale has no translation', () => {
    expect(value('description', 'de')).toBe('Desc (EN)');
  });

  it('shows description, key, joined resource types and field count', () => {
    expect(value('description')).toBe('Desc');
    expect(value('key')).toBe('my-type');
    expect(value('resourceTypeIds')).toBe('customer, order');
    expect(value('fieldCount')).toBe(3);
  });

  it('shows a field count of 0 and no resource types for an empty type', () => {
    const empty = buildTypeDefinition({
      resourceTypeIds: [],
      fieldDefinitions: [],
    });
    expect(value('fieldCount', 'en', empty)).toBe(0);
    expect(value('resourceTypeIds', 'en', empty)).toBe('');
  });

  it('formats dates as "<date> <time>"', () => {
    expect(value('createdAt')).toBe(
      `${intl.formatDate(row.createdAt)} ${intl.formatTime(row.createdAt)}`
    );
    expect(value('lastModifiedAt')).toBe(
      `${intl.formatDate(row.lastModifiedAt)} ${intl.formatTime(
        row.lastModifiedAt
      )}`
    );
  });

  it('renders a non-empty header for every column', () => {
    build().forEach((c) => {
      expect(c.header).toEqual(expect.any(String));
      expect(c.header).not.toBe('');
    });
  });
});
