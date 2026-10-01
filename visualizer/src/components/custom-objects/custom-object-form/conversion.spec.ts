import type { TCustomObject } from '../../../types/generated/ctp';
import {
  customObjectToFormValues,
  formValuesToTCustomObject,
} from './conversion';

describe('customObjectToFormValues', () => {
  it('returns empty defaults when there is no custom object (create mode)', () => {
    expect(customObjectToFormValues()).toEqual({
      key: '',
      container: '',
      value: '{}',
    });
  });

  it('serializes the value to a JSON string for the editor', () => {
    const customObject = {
      key: 'my-key',
      container: 'my-container',
      value: { a: 1, nested: { b: [true, null] } },
    } as unknown as TCustomObject;

    const result = customObjectToFormValues(customObject);

    expect(result.key).toBe('my-key');
    expect(result.container).toBe('my-container');
    expect(JSON.parse(result.value)).toEqual({
      a: 1,
      nested: { b: [true, null] },
    });
  });

  it('falls back to "{}" for a missing/null value', () => {
    const customObject = {
      key: 'k1',
      container: 'c1',
      value: null,
    } as unknown as TCustomObject;
    expect(customObjectToFormValues(customObject).value).toBe('{}');
  });

  // Documents current behaviour: the `|| {}` fallback applies to every falsy
  // value, so a legitimately-stored primitive such as `0`, `false` or `""`
  // is shown as `{}` in the editor.
  it.each([0, false, ''])(
    'replaces the falsy primitive %p with "{}"',
    (value) => {
      const customObject = {
        key: 'k1',
        container: 'c1',
        value,
      } as unknown as TCustomObject;
      expect(customObjectToFormValues(customObject).value).toBe('{}');
    }
  );

  it('keeps truthy primitives and arrays', () => {
    const make = (value: unknown) =>
      customObjectToFormValues({
        key: 'k',
        container: 'c',
        value,
      } as unknown as TCustomObject).value;
    expect(make(42)).toBe('42');
    expect(make('text')).toBe('"text"');
    expect(make([1, 2])).toBe('[1,2]');
  });
});

describe('formValuesToTCustomObject', () => {
  it('maps the form values to a draft without touching the value string', () => {
    expect(
      formValuesToTCustomObject({
        key: 'my-key',
        container: 'my-container',
        value: '{"a":1}',
      })
    ).toEqual({ key: 'my-key', container: 'my-container', value: '{"a":1}' });
  });

  it('round-trips through customObjectToFormValues', () => {
    const customObject = {
      key: 'k',
      container: 'c',
      value: { x: [1, 2, 3] },
    } as unknown as TCustomObject;
    const draft = formValuesToTCustomObject(
      customObjectToFormValues(customObject)
    );
    expect(draft.key).toBe('k');
    expect(draft.container).toBe('c');
    expect(JSON.parse(draft.value as string)).toEqual({ x: [1, 2, 3] });
  });
});
