import { transformLocalizedFieldToLocalizedString } from '@commercetools-frontend/l10n';
import LocalizedTextInput from '@commercetools-uikit/localized-text-input';
import { TTypeDefinition } from '../../types/generated/ctp';
import { TFormValues } from './types-form/types-form';

export const convertToActionData = (
  draft: Partial<TTypeDefinition>,
  ignoreFieldDefinitions = false
) => ({
  name: transformLocalizedFieldToLocalizedString(draft.nameAllLocales || []),
  description:
    transformLocalizedFieldToLocalizedString(
      draft.descriptionAllLocales || []
    ) || {},
  key: draft.key,
  fieldDefinitions:
    !ignoreFieldDefinitions && draft.fieldDefinitions
      ? draft.fieldDefinitions?.map((item) => {
          return {
            name: item.name,
            label: transformLocalizedFieldToLocalizedString(
              item.labelAllLocales || []
            ),
          };
        })
      : undefined,
});

export const formValuesToDoc = (formValues: TFormValues) => ({
  name: LocalizedTextInput.omitEmptyTranslations(formValues.name),
  description: LocalizedTextInput.omitEmptyTranslations(formValues.description),
  key: formValues.key,
});
