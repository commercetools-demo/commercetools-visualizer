import { TState, TStateDraft, TStateType } from '../../../types/generated/ctp';
import { TFormValues } from './states-form';
import LocalizedTextInput from '@commercetools-uikit/localized-text-input';
import {
  transformLocalizedFieldToLocalizedString,
  transformLocalizedStringToLocalizedField,
} from '@commercetools-frontend/l10n';

export const stateToFormValues = (
  projectLanguages: Array<string>,
  state?: Partial<TState>
): TFormValues => {
  return {
    id: state?.id,
    initial: state?.initial ?? false,
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
    transitions:
      state?.transitions?.map((value) => {
        return value.id;
      }) || [],
  };
};
// Shape sent to the `createState` mutation (StateDraft: name/description).
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
    transitions: formValues.transitions.map((transition) => ({
      typeId: formValues.stateType,
      id: transition,
    })),
    initial: formValues.initial,
  };
};

// Shape used to diff against the fetched state when computing update actions.
// `calculateStateUpdateActions` reads `nameAllLocales`/`descriptionAllLocales`
// (not the StateDraft `name`/`description`), so the form values must be mapped
// to this shape — otherwise name/description edits are never detected and never
// saved.
export const formValuesToStatePartial = (
  formValues: TFormValues
): Partial<TState> => {
  return {
    type: formValues.stateType as TStateType,
    key: formValues.key || undefined,
    nameAllLocales: transformLocalizedStringToLocalizedField(
      LocalizedTextInput.omitEmptyTranslations(formValues.name)
    ),
    descriptionAllLocales: transformLocalizedStringToLocalizedField(
      LocalizedTextInput.omitEmptyTranslations(formValues.description)
    ),
    transitions: formValues.transitions.map(
      (transition) => ({ id: transition } as TState)
    ),
    initial: formValues.initial,
  };
};
