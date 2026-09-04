import { TState, TStateDraft, TStateType } from '../../../types/generated/ctp';
import { TFormValues } from './states-form';
import { LocalizedField, type LocalizedString } from '@commercetools/nimbus';
import {
  transformLocalizedFieldToLocalizedString,
  transformLocalizedStringToLocalizedField,
} from '@commercetools-frontend/l10n';

// `LocalizedField.omitEmptyTranslations` returns Nimbus' `LocalizedString`
// (values typed `string | undefined`). It has already dropped empty
// translations, so the remaining values are defined strings — narrow the type
// to `Record<string, string>` for `@commercetools-frontend/l10n`, dropping any
// stray nullish values defensively.
const omitEmptyTranslations = (
  value: LocalizedString
): Record<string, string> =>
  Object.fromEntries(
    Object.entries(LocalizedField.omitEmptyTranslations(value)).filter(
      ([, translation]) => translation != null
    )
  ) as Record<string, string>;

export const stateToFormValues = (
  projectLanguages: Array<string>,
  state?: Partial<TState>
): TFormValues => {
  return {
    id: state?.id,
    initial: state?.initial ?? false,
    stateType: state?.type || TStateType.LineItemState,
    key: state?.key || '',
    name: LocalizedField.createLocalizedString(
      projectLanguages,
      transformLocalizedFieldToLocalizedString(state?.nameAllLocales ?? []) ??
        {}
    ),
    description: LocalizedField.createLocalizedString(
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
      omitEmptyTranslations(formValues.name)
    ),
    description: transformLocalizedStringToLocalizedField(
      omitEmptyTranslations(formValues.description)
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
