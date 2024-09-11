import type { Subscription } from '@commercetools/platform-sdk';
import type { TBuilder } from '@commercetools-test-data/core';

//Subscription
export type TSubscription = Subscription;
export type TSubscriptionBuilder = TBuilder<TSubscription>;
export type TCreateSubscriptionBuilder = () => TSubscriptionBuilder;
export type TSubscriptionGraphql = TSubscription & {
  __typename: 'CommercetoolsSubscription';
};
