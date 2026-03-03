import { transformLocalizedStringToLocalizedField } from '@commercetools-frontend/l10n';
import LocalizedTextInput from '@commercetools-uikit/localized-text-input';
import { TFormValues } from './types-form/types-form';

export const formValuesToDoc = (formValues: TFormValues) => {
  return {
    nameAllLocales: transformLocalizedStringToLocalizedField(
      LocalizedTextInput.omitEmptyTranslations(formValues.name)
    ),
    descriptionAllLocales: transformLocalizedStringToLocalizedField(
      LocalizedTextInput.omitEmptyTranslations(formValues.description)
    ),
    key: formValues.key || undefined,
  };
};
