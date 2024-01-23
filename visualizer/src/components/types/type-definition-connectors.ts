// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../../@types/commercetools__sync-actions/index.d.ts" />

import {
  useMcMutation,
  useMcQuery,
} from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import { transformLocalizedFieldToLocalizedString } from '@commercetools-frontend/l10n';
import LocalizedTextInput from '@commercetools-uikit/localized-text-input';
import {
  TQuery,
  TTypeDefinition,
  TMutation,
  TMutation_UpdateTypeDefinitionArgs,
  TTypeUpdateAction,
} from '../../types/generated/ctp';
import { extractErrorFromGraphQlResponse } from '../../helpers';
import UpdateTypeDefinitionIdMutation from '../../hooks/use-types-connector/update-type.ctp.graphql';
import TypeWithDefinitionByName from './field-definition-input/fetch-type.ctp.graphql';
import { TFormValues } from './types-form/types-form';

export const convertToActionData = (draft: Partial<TTypeDefinition>) => ({
  name: transformLocalizedFieldToLocalizedString(draft.nameAllLocales || []),
  description:
    transformLocalizedFieldToLocalizedString(
      draft.descriptionAllLocales || []
    ) || {},
  key: draft.key,
  fieldDefinitions: draft.fieldDefinitions
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

export const useTypeDefinitionEntryCreator = () => {
  const [createTypeDefinitionEntry, { loading }] = useMcMutation<
    TMutation,
    TMutation_UpdateTypeDefinitionArgs
  >(UpdateTypeDefinitionIdMutation);

  const execute = async ({
    actions,
    id,
    version,
  }: {
    id: string;
    version: number;
    actions: Array<TTypeUpdateAction>;
  }) => {
    try {
      return await createTypeDefinitionEntry({
        context: {
          target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
        },
        variables: {
          id: id,
          version: version || 1,
          actions: actions,
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

export type TQuery_TypeDefinitionWithDefinitionByNameArgs = {
  id: string;
  includeNames: Array<string>;
};

export const useTypeWithDefinitionByNameFetcher = (
  id: string,
  includeNames: Array<string>
) => {
  const { data, error, loading, refetch } = useMcQuery<
    TQuery,
    TQuery_TypeDefinitionWithDefinitionByNameArgs
  >(TypeWithDefinitionByName, {
    variables: {
      id: id,
      includeNames: includeNames,
    },
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });
  return {
    fieldDefinitions: data?.typeDefinition?.fieldDefinitions,
    version: data?.typeDefinition?.version,
    error,
    loading,
    refetch,
  };
};
