import { TState, TStateDraft, TStateType } from '../../../types/generated/ctp';
import { TFormValues } from '../states-form/states-form';
import LocalizedTextInput from '@commercetools-uikit/localized-text-input';
import {
  transformLocalizedFieldToLocalizedString,
  transformLocalizedStringToLocalizedField,
} from '@commercetools-frontend/l10n';

export const stateToFormValues = (
  projectLanguages: Array<string>,
  state?: TState
): TFormValues => {
  return {
    stateType: state?.type || TStateType.LineItemState,
    key: state?.key || '',
    name: LocalizedTextInput.createLocalizedString(
      projectLanguages,
      transformLocalizedFieldToLocalizedString(state?.nameAllLocales ?? []) ??
        {}
    ),
    description: LocalizedTextInput.createLocalizedString(
      projectLanguages,
      transformLocalizedFieldToLocalizedString(
        state?.descriptionAllLocales ?? []
      ) ?? {}
    ),
  };
};
export const formValuesToState = (formValues: TFormValues): TStateDraft => {
  return {
    type: formValues.stateType as TStateType,
    key: formValues.key || '',
    name: transformLocalizedStringToLocalizedField(
      LocalizedTextInput.omitEmptyTranslations(formValues.name)
    ),
    description: transformLocalizedStringToLocalizedField(
      LocalizedTextInput.omitEmptyTranslations(formValues.description)
    ),
  };
};
