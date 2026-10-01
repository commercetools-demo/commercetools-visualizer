import { render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { NimbusProvider } from '@commercetools/nimbus';
import type { TFieldType } from '../../../types/generated/ctp';
import { FieldType } from '@commercetools-test-data/type';
import {
  enumFieldType,
  localizedEnumFieldType,
  referenceFieldType,
  setFieldType,
  simpleFieldType,
} from '../../../test-utils/models/types';
import { renderAttributeTypeName } from './render-attribute-type-name';

const renderType = (fieldType: unknown) =>
  render(
    <IntlProvider locale="en" messages={{}}>
      <NimbusProvider locale="en" loadFonts={false}>
        {renderAttributeTypeName(fieldType as TFieldType)}
      </NimbusProvider>
    </IntlProvider>
  );

// Nimbus injects a theme-bootstrapping <script> into the container, so assert
// on the rendered text outside of it.
const visibleText = (container: HTMLElement) => {
  const clone = container.cloneNode(true) as HTMLElement;
  // eslint-disable-next-line testing-library/no-node-access
  clone.querySelectorAll('script, style').forEach((el) => el.remove());
  return clone.textContent;
};

const built = (builder: ReturnType<typeof simpleFieldType>) =>
  builder.buildGraphql();

describe('renderAttributeTypeName', () => {
  it.each([
    ['Boolean', 'Boolean'],
    ['Date', 'Date / Time (Date)'],
    ['DateTime', 'Date / Time (Date and Time)'],
    ['Money', 'Money'],
    ['Number', 'Number'],
    ['Time', 'Date / Time (Time)'],
  ] as const)('renders a label for %s', (name, label) => {
    renderType(built(simpleFieldType(name)));
    expect(screen.getByText(label)).toBeInTheDocument();
    expect(screen.queryByText(/localized/i)).not.toBeInTheDocument();
  });

  it('renders Enum without a localized badge', () => {
    renderType(built(enumFieldType([{ key: 'a', label: 'A' }])));
    expect(screen.getByText('List (enum)')).toBeInTheDocument();
    expect(screen.queryByText(/localized/i)).not.toBeInTheDocument();
  });

  it('renders LocalizedEnum as Enum plus a localized badge', () => {
    renderType(built(localizedEnumFieldType([{ key: 'a', label: 'A' }])));
    expect(screen.getByText('List (enum)')).toBeInTheDocument();
    expect(screen.getByText(/localized/i)).toBeInTheDocument();
  });

  it('renders LocalizedString as Text plus a localized badge', () => {
    renderType(built(simpleFieldType('LocalizedString')));
    expect(screen.getByText(/text/i)).toBeInTheDocument();
    expect(screen.getByText(/localized/i)).toBeInTheDocument();
  });

  it('renders String as plain Text', () => {
    renderType(built(simpleFieldType('String')));
    expect(screen.getByText(/text/i)).toBeInTheDocument();
    expect(screen.queryByText(/localized/i)).not.toBeInTheDocument();
  });

  it('renders the legacy Text type name as Text', () => {
    renderType({ name: 'Text' });
    expect(screen.getByText(/text/i)).toBeInTheDocument();
  });

  it.each(['product', 'category', 'customer', 'order'])(
    'includes the referenced resource type %s for Reference',
    (referenceTypeId) => {
      renderType(built(referenceFieldType(referenceTypeId)));
      expect(
        screen.getByText(new RegExp(referenceTypeId, 'i'))
      ).toBeInTheDocument();
    }
  );

  it.each([
    ['Boolean', simpleFieldType('Boolean'), 'Boolean'],
    ['Money', simpleFieldType('Money'), 'Money'],
    ['Number', simpleFieldType('Number'), 'Number'],
    ['Reference', referenceFieldType('product'), /product/i],
    ['Enum', enumFieldType([{ key: 'a', label: 'A' }]), 'List (enum)'],
  ] as const)(
    'renders a Set of %s as its element type',
    (_n, element, label) => {
      renderType(built(setFieldType(element)));
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  );

  it('keeps the localized badge for a Set of LocalizedString', () => {
    renderType(built(setFieldType(simpleFieldType('LocalizedString'))));
    expect(screen.getByText(/text/i)).toBeInTheDocument();
    expect(screen.getByText(/localized/i)).toBeInTheDocument();
  });

  it('works for random field types produced by the test-data builder', () => {
    for (let i = 0; i < 25; i += 1) {
      const fieldType = FieldType.random().buildGraphql<TFieldType>();
      const { container, unmount } = renderType(fieldType);
      expect(visibleText(container)).toMatch(/\S/);
      unmount();
    }
  });

  it('falls back to the raw name for unknown types', () => {
    renderType({ name: 'Mystery' });
    expect(screen.getByText('Mystery')).toBeInTheDocument();
  });

  it('renders empty text for a missing field type', () => {
    const { container } = renderType(undefined);
    expect(visibleText(container)).toBe('');
  });
});
