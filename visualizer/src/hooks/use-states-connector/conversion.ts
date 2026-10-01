import { TState } from '../../types/generated/ctp';
import { State } from '@commercetools/platform-sdk';
import { transformLocalizedFieldToLocalizedString } from '../shared/graphql-helpers';

export type PickedState = Partial<
  Partial<
    Pick<
      TState,
      | 'key'
      | 'type'
      | 'nameAllLocales'
      | 'descriptionAllLocales'
      | 'initial'
      | 'transitions'
      | 'roles'
    >
  >
>;

type PickedReturnState = Partial<
  Partial<
    Pick<
      State,
      | 'key'
      | 'type'
      | 'name'
      | 'description'
      | 'initial'
      | 'transitions'
      | 'roles'
    >
  >
>;

// GraphQL --> REST
export const convertTStateToState = (draft: PickedState): PickedReturnState => {
  return {
    key: draft.key || undefined,
    type: draft.type,
    name: transformLocalizedFieldToLocalizedString(draft.nameAllLocales),
    description: transformLocalizedFieldToLocalizedString(
      draft.descriptionAllLocales
    ),
    transitions: draft.transitions?.map((transition) => ({
      typeId: 'state',
      id: transition.id,
    })),
    initial: draft.initial,
    // Always an array, sorted, so that sync-actions' addRoles/removeRoles diff compares like
    // with like (a missing list and an empty one are the same: no roles).
    roles: [...(draft.roles ?? [])].sort() as PickedReturnState['roles'],
  };
};
