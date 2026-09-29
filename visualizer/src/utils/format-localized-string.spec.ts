import { formatLocalizedString } from './format-localized-string';

describe('formatLocalizedString', () => {
  it('returns the value for the requested locale', () => {
    expect(
      formatLocalizedString(
        [
          { locale: 'en', value: 'Hello' },
          { locale: 'de', value: 'Hallo' },
        ],
        'de',
        ['en']
      )
    ).toEqual('Hallo');
  });

  it('falls back through projectLanguages when the requested locale is missing', () => {
    // The l10n library marks a fallback-locale value with an `(EN)` suffix
    // so the UI can indicate it's not the requested locale's own value.
    expect(
      formatLocalizedString([{ locale: 'en', value: 'Hello' }], 'de', ['en'])
    ).toEqual('Hello (EN)');
  });

  it('falls back to the provided fallback value when nothing matches', () => {
    expect(formatLocalizedString([], 'de', ['fr'], 'no value')).toEqual(
      'no value'
    );
  });

  it('falls back to the NO_VALUE_FALLBACK default when no fallback is given', () => {
    expect(formatLocalizedString(undefined, 'de', ['fr'])).toBeDefined();
  });
});
