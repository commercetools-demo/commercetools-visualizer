import { Builder } from '@commercetools-test-data/core';
import generator from './generator';
import transformers from './transformers';
import type { TCreateSubscriptionBuilder, TSubscription } from './types';

const Model: TCreateSubscriptionBuilder = () =>
  Builder<TSubscription>({
    generator,
    transformers,
  });

export default Model;
