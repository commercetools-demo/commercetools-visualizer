import { createIntl, createIntlCache } from 'react-intl';
import type { TExtension } from '../../../types/generated/ctp';
import createColumnDefinitions from './column-definitions';

const intl = createIntl({ locale: 'en', messages: {} }, createIntlCache());

const row = {
  key: 'my-extension',
  destination: { type: 'HTTP' },
  triggers: [{ resourceTypeId: 'cart' }, { resourceTypeId: 'order' }],
  timeoutInMs: 1500,
  createdAt: '2024-01-02T03:04:05.000Z',
  lastModifiedAt: '2024-02-03T04:05:06.000Z',
} as unknown as TExtension;

const columns = createColumnDefinitions(intl);
const value = (id: string, r: TExtension = row) => {
  const column = columns.find((c) => c.id === id);
  if (!column) throw new Error(`no column ${id}`);
  return (column.accessor as (r: TExtension) => unknown)(r);
};

describe('extensions list column definitions', () => {
  it('defines the expected columns in order', () => {
    expect(columns.map((c) => c.id)).toEqual([
      'key',
      'destination',
      'triggers',
      'timeoutInMs',
      'createdAt',
      'lastModifiedAt',
    ]);
  });

  it('makes key the row header and every column sortable', () => {
    expect(columns.find((c) => c.id === 'key')?.isRowHeader).toBe(true);
    expect(columns.every((c) => c.isSortable)).toBe(true);
  });

  it('maps key, destination type, timeout', () => {
    expect(value('key')).toBe('my-extension');
    expect(value('destination')).toBe('HTTP');
    expect(value('timeoutInMs')).toBe(1500);
  });

  it('joins trigger resource types', () => {
    expect(value('triggers')).toBe('cart, order');
  });

  it('renders no triggers as an empty string', () => {
    expect(value('triggers', { ...row, triggers: [] })).toBe('');
  });

  it('formats dates as "<date> <time>"', () => {
    expect(value('createdAt')).toBe(
      `${intl.formatDate(row.createdAt)} ${intl.formatTime(row.createdAt)}`
    );
  });
});
