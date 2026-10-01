import { createIntl, createIntlCache } from 'react-intl';
import type { TCommercetoolsSubscription } from '../../../types/generated/ctp';
import createColumnDefinitions from './column-definitions';

const intl = createIntl({ locale: 'en', messages: {} }, createIntlCache());

const makeRow = (destinationType: string) =>
  ({
    key: 'my-sub',
    version: 7,
    createdAt: '2024-01-02T03:04:05.000Z',
    destination: { type: destinationType },
  } as unknown as TCommercetoolsSubscription);

const columns = createColumnDefinitions({ intl });
const value = (id: string, r = makeRow('SQS')) => {
  const column = columns.find((c) => c.id === id);
  if (!column) throw new Error(`no column ${id}`);
  return (column.accessor as (r: TCommercetoolsSubscription) => unknown)(r);
};

describe('subscription list column definitions', () => {
  it('defines the expected columns in order', () => {
    expect(columns.map((c) => c.id)).toEqual([
      'key',
      'version',
      'createdAt',
      'destinationType',
    ]);
  });

  it('makes key the sortable row header', () => {
    const key = columns.find((c) => c.id === 'key');
    expect(key?.isRowHeader).toBe(true);
    expect(key?.isSortable).toBe(true);
  });

  it('maps key and version', () => {
    expect(value('key')).toBe('my-sub');
    expect(value('version')).toBe(7);
  });

  it.each([
    ['SQS', 'destinationSQS'],
    ['SNS', 'destinationSNS'],
    ['EventBridge', 'destinationEventBridge'],
    ['GoogleCloudPubSub', 'destinationGoogleCloudPubSub'],
    ['ConfluentCloud', 'destinationConfluentCloud'],
    ['AzureServiceBus', 'destinationAzureServiceBus'],
    ['EventGrid', 'destinationEventGrid'],
  ])('shows a human readable label for %s', (type) => {
    const label = value('destinationType', makeRow(type));
    expect(typeof label).toBe('string');
    expect(label).not.toBe('');
    // A resolved label differs from the raw API enum value.
    expect(label).not.toBe(type);
  });

  it('falls back to the raw type for an unknown destination', () => {
    expect(value('destinationType', makeRow('SomethingNew'))).toBe(
      'SomethingNew'
    );
  });
});
