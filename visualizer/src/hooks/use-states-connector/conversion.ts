import { TState } from 'commercetools-demo-shared-helpers';
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
    >
  >
>;

type PickedReturnState = Partial<
  Partial<
    Pick<
      State,
      'key' | 'type' | 'name' | 'description' | 'initial' | 'transitions'
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
  };
};
