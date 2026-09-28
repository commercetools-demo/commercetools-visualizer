import { validateKey } from './validate-key';

describe('validateKey', () => {
  it.each([undefined, null, ''])('flags %p as missing', (value) => {
    expect(validateKey(value)).toEqual({ missing: true });
  });

  it.each(['a', 'a'.repeat(257), 'invalid key', 'invalid!', 'ü'])(
    'flags %p as invalidInput',
    (value) => {
      expect(validateKey(value)).toEqual({ invalidInput: true });
    }
  );

  it.each(['ab', 'a'.repeat(256), 'valid-key_123'])(
    'accepts %p as valid',
    (value) => {
      expect(validateKey(value)).toEqual({});
    }
  );

  it('trims surrounding whitespace before validating', () => {
    expect(validateKey('  valid-key  ')).toEqual({});
    expect(validateKey('  a  ')).toEqual({ invalidInput: true });
  });

  it('flags a whitespace-only value as invalidInput, not missing', () => {
    // Only an empty string short-circuits to `missing`; a non-empty string
    // that trims down to nothing instead fails the length/regex check below.
    expect(validateKey('   ')).toEqual({ invalidInput: true });
  });
});
