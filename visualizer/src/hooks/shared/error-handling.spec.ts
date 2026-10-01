import type { FormikHelpers } from 'formik';
import { graphQLErrorHandler, type ErrorCodeMapping } from './error-handling';

const setup = (mapping?: ErrorCodeMapping, withFormik = true) => {
  const showNotification = jest.fn();
  const setErrors = jest.fn();
  const handler = graphQLErrorHandler<{ key: string }>(
    showNotification,
    withFormik
      ? ({ setErrors } as unknown as FormikHelpers<{ key: string }>)
      : undefined,
    mapping
  );
  return { showNotification, setErrors, handler };
};

const duplicate: ErrorCodeMapping = [
  { errorCode: 'DuplicateField', errorObject: { duplicate: true } },
];

describe('graphQLErrorHandler', () => {
  it('shows an unmapped error as a page notification', () => {
    const { handler, showNotification, setErrors } = setup();

    handler([{ message: 'Boom', extensions: { code: 'General' } }]);

    expect(showNotification).toHaveBeenCalledTimes(1);
    expect(showNotification).toHaveBeenCalledWith({
      kind: 'error',
      domain: 'page',
      text: 'Boom',
    });
    expect(setErrors).toHaveBeenCalledWith({});
  });

  it('shows additional unmapped errors as side notifications', () => {
    const { handler, showNotification } = setup();

    handler([
      { message: 'first' },
      { message: 'second' },
      { message: 'third' },
    ]);

    expect(
      showNotification.mock.calls.map(([n]) => [n.domain, n.text])
    ).toEqual([
      ['page', 'first'],
      ['side', 'second'],
      ['side', 'third'],
    ]);
  });

  it('accepts a single (non-array) error', () => {
    const { handler, showNotification } = setup();
    handler({ message: 'single' });
    expect(showNotification).toHaveBeenCalledWith(
      expect.objectContaining({ text: 'single' })
    );
  });

  it('maps an error code to a form field error instead of notifying', () => {
    const { handler, showNotification, setErrors } = setup(duplicate);

    handler([
      { message: 'dup', extensions: { code: 'DuplicateField', field: 'key' } },
    ]);

    expect(showNotification).not.toHaveBeenCalled();
    expect(setErrors).toHaveBeenCalledWith({ key: { duplicate: true } });
  });

  it('reads code and field from the top level when extensions are absent', () => {
    const { handler, setErrors, showNotification } = setup(duplicate);

    handler([{ message: 'dup', code: 'DuplicateField', field: 'key' }]);

    expect(showNotification).not.toHaveBeenCalled();
    expect(setErrors).toHaveBeenCalledWith({ key: { duplicate: true } });
  });

  it('prefers extensions over top-level code/field', () => {
    const { handler, setErrors } = setup([
      { errorCode: 'A', errorObject: { a: true } },
      { errorCode: 'B', errorObject: { b: true } },
    ]);

    handler([
      {
        message: 'm',
        code: 'B',
        field: 'other',
        extensions: { code: 'A', field: 'key' },
      },
    ]);

    expect(setErrors).toHaveBeenCalledWith({ key: { a: true } });
  });

  it('splits mapped and unmapped errors from the same response', () => {
    const { handler, showNotification, setErrors } = setup(duplicate);

    handler([
      { message: 'dup', extensions: { code: 'DuplicateField', field: 'key' } },
      { message: 'other', extensions: { code: 'Other' } },
    ]);

    expect(showNotification).toHaveBeenCalledTimes(1);
    expect(showNotification).toHaveBeenCalledWith(
      expect.objectContaining({ text: 'other', domain: 'page' })
    );
    expect(setErrors).toHaveBeenCalledWith({ key: { duplicate: true } });
  });

  it('does not map anything when no mapping is provided', () => {
    const { handler, showNotification, setErrors } = setup();

    handler([
      { message: 'dup', extensions: { code: 'DuplicateField', field: 'key' } },
    ]);

    expect(showNotification).toHaveBeenCalledTimes(1);
    expect(setErrors).toHaveBeenCalledWith({});
  });

  it('does not throw when no formik helpers are given', () => {
    const { handler, showNotification } = setup(duplicate, false);
    expect(() =>
      handler([
        {
          message: 'dup',
          extensions: { code: 'DuplicateField', field: 'key' },
        },
      ])
    ).not.toThrow();
    expect(showNotification).not.toHaveBeenCalled();
  });

  it('keeps the last error when two errors map to the same field', () => {
    const { handler, setErrors } = setup([
      { errorCode: 'A', errorObject: { a: true } },
      { errorCode: 'B', errorObject: { b: true } },
    ]);

    handler([
      { message: '', extensions: { code: 'A', field: 'key' } },
      { message: '', extensions: { code: 'B', field: 'key' } },
    ]);

    expect(setErrors).toHaveBeenCalledWith({ key: { b: true } });
  });

  it('does nothing visible for an empty error list', () => {
    const { handler, showNotification, setErrors } = setup();
    handler([]);
    expect(showNotification).not.toHaveBeenCalled();
    expect(setErrors).toHaveBeenCalledWith({});
  });
});
