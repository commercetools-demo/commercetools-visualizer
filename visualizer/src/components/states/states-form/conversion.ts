import {
  TState,
  TStateDraft,
  TStateRole,
  TStateType,
} from '../../../types/generated/ctp';
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
    // `transitions` unset means "any transition is allowed" (validation off), an empty list
    // means "no transition is allowed" (a final state) — they are different, so remember
    // which one the state has.
    restrictTransitions: state?.transitions != null,
    transitions:
      state?.transitions?.map((value) => {
        return value.id;
      }) || [],
    roles: state?.roles ?? [],
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
    // Left out when not restricted: the API then does not validate transitions.
    transitions: formValues.restrictTransitions
      ? formValues.transitions.map((transition) => ({
          typeId: formValues.stateType,
          id: transition,
        }))
      : undefined,
    roles:
      formValues.roles.length > 0
        ? (formValues.roles as TStateRole[])
        : undefined,
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
      omitEmptyTranslations(formValues.name)
    ),
    descriptionAllLocales: transformLocalizedStringToLocalizedField(
      omitEmptyTranslations(formValues.description)
    ),
    transitions: formValues.restrictTransitions
      ? formValues.transitions.map(
          (transition) => ({ id: transition } as TState)
        )
      : undefined,
    roles: formValues.roles as TStateRole[],
    initial: formValues.initial,
  };
};
