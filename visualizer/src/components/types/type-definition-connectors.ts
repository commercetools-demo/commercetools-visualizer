import { transformLocalizedStringToLocalizedField } from '@commercetools-frontend/l10n';
import { LocalizedField, type LocalizedString } from '@commercetools/nimbus';
import { TFormValues } from './types-form/types-form';

// `LocalizedField.omitEmptyTranslations` returns Nimbus' `LocalizedString`
// (values typed `string | undefined`). It has already dropped empty
// translations, so the remaining values are defined strings — narrow the type
// to `Record<string, string>` for `@commercetools-frontend/l10n`, dropping any
// stray nullish values defensively.
export const omitEmptyTranslations = (
  value: LocalizedString
): Record<string, string> =>
  Object.fromEntries(
    Object.entries(LocalizedField.omitEmptyTranslations(value)).filter(
      ([, translation]) => translation != null
    )
  ) as Record<string, string>;

export const formValuesToDoc = (formValues: TFormValues) => {
  return {
    nameAllLocales: transformLocalizedStringToLocalizedField(
      omitEmptyTranslations(formValues.name)
    ),
    descriptionAllLocales: transformLocalizedStringToLocalizedField(
      omitEmptyTranslations(formValues.description)
    ),
    key: formValues.key || undefined,
  };
};
