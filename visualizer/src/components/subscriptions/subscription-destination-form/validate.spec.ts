import { validateInput } from './validate';

describe('validateInput', () => {
  it('flags an empty string as missing, as a JSON string', () => {
    expect(validateInput('')).toBe('{"missing":true}');
    expect(JSON.parse(validateInput('') as string)).toEqual({ missing: true });
  });

  it('accepts any non-empty value', () => {
    expect(validateInput('x')).toBeUndefined();
    expect(validateInput('https://example.com')).toBeUndefined();
  });

  // Documents current behaviour: whitespace-only counts as provided.
  it('does not trim whitespace-only values', () => {
    expect(validateInput('   ')).toBeUndefined();
  });
});
