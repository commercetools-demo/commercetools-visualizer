// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../../@types/commercetools__sync-actions/index.d.ts" />

import {
  useMcMutation,
  useMcQuery,
} from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import { ApolloError, ApolloQueryResult } from '@apollo/client';
import { transformLocalizedFieldToLocalizedString } from '@commercetools-frontend/l10n';
import LocalizedTextInput from '@commercetools-uikit/localized-text-input';
import { createSyncTypes } from '@commercetools/sync-actions';
import {
  TQuery,
  Maybe,
  TTypeDefinition,
  TQuery_TypeDefinitionArgs,
  TMutation,
  TMutation_UpdateTypeDefinitionArgs,
} from '../../types/generated/ctp';
import {
  createGraphQlUpdateActions,
  extractErrorFromGraphQlResponse,
} from '../../helpers';
import FetchQuery from './edit/fetch-type.ctp.graphql';
import UpdateTypeDefinitionIdMutation from './edit/update-type.ctp.graphql';
import { TFormValues } from './type-form/TypeDefinitionDetailsForm';

const syncTypes = createSyncTypes();

export const convertToActionData = (draft: Partial<TTypeDefinition>) => ({
  //...draft,
  name: transformLocalizedFieldToLocalizedString(draft.nameAllLocales || []),
  description: transformLocalizedFieldToLocalizedString(
    draft.descriptionAllLocales || []
  ),
  key: draft.key,
});

export const formValuesToDoc = (formValues: TFormValues) => ({
  name: LocalizedTextInput.omitEmptyTranslations(formValues.name),
  description: LocalizedTextInput.omitEmptyTranslations(formValues.description),
  key: formValues.key,
});

// export const useSubscriptionCreator = () => {
//   const [createSubscription, { loading }] = useMcMutation<
//     TMutation,
//     TMutation_CreateSubscriptionArgs
//   >(CreateQuery);

//   const execute = async ({ draft }: { draft: TSubscriptionDraft }) => {
//     try {
//       return await createSubscription({
//         context: {
//           target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
//         },
//         variables: {
//           draft: draft,
//         },
//       });
//     } catch (graphQlResponse) {
//       throw extractErrorFromGraphQlResponse(graphQlResponse);
//     }
//   };

//   return {
//     loading,
//     execute,
//   };
// };

export const useTypeDefinitionUpdater = () => {
  const [updateTypeDefinitionId, { loading }] = useMcMutation<
    TMutation,
    TMutation_UpdateTypeDefinitionArgs
  >(UpdateTypeDefinitionIdMutation);

  const execute = async ({
    originalDraft,
    nextDraft,
  }: {
    originalDraft: NonNullable<TTypeDefinition>;
    nextDraft: any;
  }) => {
    const actions = syncTypes.buildActions(
      nextDraft,
      convertToActionData(originalDraft)
    );

    try {
      return await updateTypeDefinitionId({
        context: {
          target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
        },
        variables: {
          id: originalDraft.id,
          version: originalDraft.version,
          actions: createGraphQlUpdateActions(actions),
        },
      });
    } catch (graphQlResponse) {
      throw extractErrorFromGraphQlResponse(graphQlResponse);
    }
  };

  return {
    loading,
    execute,
  };
};

type TUseTypeDefinitionFetcher = (props: { id: string }) => {
  typeDefinition?: Maybe<TTypeDefinition>;
  error?: ApolloError;
  loading: boolean;
  refetch: (
    variables?: Partial<TQuery_TypeDefinitionArgs> | undefined
  ) => Promise<ApolloQueryResult<TQuery>>;
};

export const useTypeDefinitionFetcher: TUseTypeDefinitionFetcher = ({ id }) => {
  const { data, error, loading, refetch } = useMcQuery<
    TQuery,
    TQuery_TypeDefinitionArgs
  >(FetchQuery, {
    variables: {
      id: id,
    },
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });
  return {
    typeDefinition: data?.typeDefinition,
    error,
    loading,
    refetch,
  };
};

// export const useSubscriptionDeleter = () => {
//   const [deleteSubscriptionById, { loading }] = useMcMutation<
//     TMutation,
//     TMutation_DeleteSubscriptionArgs
//   >(DeleteSubscriptionIdMutation);

//   const execute = async ({ id, version }: { id: string; version: number }) => {
//     try {
//       return await deleteSubscriptionById({
//         context: {
//           target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
//         },
//         variables: {
//           id: id,
//           version: version,
//         },
//       });
//     } catch (graphQlResponse) {
//       throw extractErrorFromGraphQlResponse(graphQlResponse);
//     }
//   };

//   return {
//     loading,
//     execute,
//   };
// };
