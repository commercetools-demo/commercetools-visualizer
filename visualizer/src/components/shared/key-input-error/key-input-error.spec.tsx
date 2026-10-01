import { render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import KeyInputError, { type TKeyInputResourceType } from './key-input-error';

const renderError = (props: React.ComponentProps<typeof KeyInputError>) =>
  render(
    <IntlProvider locale="en" messages={{}}>
      <div data-testid="out">
        <KeyInputError {...props} />
      </div>
    </IntlProvider>
  );

describe('KeyInputError', () => {
  it('renders nothing without an error', () => {
    renderError({ resourceType: 'type' });
    expect(screen.getByTestId('out')).toBeEmptyDOMElement();
  });

  it('renders nothing for an empty error object', () => {
    renderError({ error: {}, resourceType: 'type' });
    expect(screen.getByTestId('out')).toBeEmptyDOMElement();
  });

  it('renders the required message when the key is missing', () => {
    renderError({ error: { missing: true }, resourceType: 'type' });
    expect(screen.getByText(/this field is required/i)).toBeInTheDocument();
  });

  it('renders the format message for an invalid key', () => {
    renderError({ error: { invalidInput: true }, resourceType: 'type' });
    expect(
      screen.getByText(/between 2 and 256 alphanumeric characters/i)
    ).toBeInTheDocument();
  });

  it.each<[TKeyInputResourceType, string]>([
    ['type', 'type'],
    ['state', 'state'],
    ['extension', 'extension'],
    ['subscription', 'subscription'],
    ['customObject', 'custom object'],
    ['field', 'field'],
  ])('names the %s resource in the duplicate message', (resourceType, noun) => {
    renderError({ error: { duplicate: true }, resourceType });
    expect(
      screen.getByText(
        new RegExp(`a ${noun} with this key already exists`, 'i')
      )
    ).toBeInTheDocument();
  });

  it('prioritises invalid over duplicate over missing', () => {
    renderError({
      error: { invalidInput: true, duplicate: true, missing: true },
      resourceType: 'type',
    });
    expect(screen.getByText(/alphanumeric/i)).toBeInTheDocument();
    expect(screen.queryByText(/already exists/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/field is required/i)).not.toBeInTheDocument();
  });

  it('prefers duplicate over missing', () => {
    renderError({
      error: { duplicate: true, missing: true },
      resourceType: 'state',
    });
    expect(screen.getByText(/already exists/i)).toBeInTheDocument();
    expect(screen.queryByText(/field is required/i)).not.toBeInTheDocument();
  });
});
