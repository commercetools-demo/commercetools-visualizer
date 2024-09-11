import { Transformer } from '@commercetools-test-data/core';
import type { TSubscription, TSubscriptionGraphql } from './types';

const buildFields: Array<keyof TSubscription> = ['createdBy', 'lastModifiedBy'];

const transformers = {
  default: Transformer<TSubscription, TSubscription>('default', {
    buildFields,
  }),

  rest: Transformer<TSubscription, TSubscription>('rest', {
    buildFields,
    replaceFields: ({ fields }) => ({
      ...fields,
    }),
  }),

  graphql: Transformer<TSubscription, TSubscriptionGraphql>('graphql', {
    buildFields,
    addFields: () => ({
      __typename: 'CommercetoolsSubscription',
    }),
  }),
};

export default transformers;
