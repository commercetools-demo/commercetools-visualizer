import { useMcQuery } from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import { ApolloError } from '@apollo/client';
import {
  TQuery,
  Maybe,
  TTypeDefinition,
  TQuery_TypeDefinitionArgs,
} from '../../types/generated/ctp';
import FetchQuery from './edit/fetch-type.ctp.graphql';

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

// export const useSubscriptionKeyUpdater = () => {
//   const [updateSubscriptionKey, { loading }] = useMcMutation<
//     TMutation,
//     TMutation_UpdateSubscriptionArgs
//   >(UpdateSubscriptionKeyMutation);

//   const execute = async ({
//     originalDraft,
//     nextDraft,
//   }: {
//     originalDraft: NonNullable<TCommercetoolsSubscription>;
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     nextDraft: any;
//   }) => {
//     const actions: Array<TSubscriptionUpdateAction> = [
//       { setKey: { key: nextDraft.key } },
//     ];
//     try {
//       return await updateSubscriptionKey({
//         context: {
//           target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
//         },
//         variables: {
//           id: originalDraft.id,
//           version: originalDraft.version,
//           actions: actions,
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

type TUseTypeDefinitionFetcher = (props: { id: string }) => {
  typeDefinition?: Maybe<TTypeDefinition>;
  error?: ApolloError;
  loading: boolean;
};

export const useTypeDefinitionFetcher: TUseTypeDefinitionFetcher = ({ id }) => {
  const { data, error, loading } = useMcQuery<
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
