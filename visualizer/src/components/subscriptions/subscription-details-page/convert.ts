import { TFormValues } from '../subscription-details-form/subscription-details-form';
import { TCommercetoolsSubscription } from '../../../types/generated/ctp';

type TKnownDestinationType = keyof NonNullable<TFormValues['destination']>;

const isKnownDestinationType = (
  destinationType: TFormValues['destinationType']
): destinationType is TKnownDestinationType =>
  destinationType === 'GoogleCloudPubSub' ||
  destinationType === 'SQS' ||
  destinationType === 'ConfluentCloud' ||
  destinationType === 'SNS' ||
  destinationType === 'EventBridge' ||
  destinationType === 'AzureServiceBus' ||
  destinationType === 'EventGrid';

export const convertFormValuesToSubscription = (
  formValues: TFormValues
): Pick<
  TCommercetoolsSubscription,
  'key' | 'destination' | 'changes' | 'messages'
> => {
  return {
    key: formValues.key,
    destination: {
      ...(isKnownDestinationType(formValues.destinationType)
        ? formValues.destination?.[formValues.destinationType]
        : undefined),
      type: formValues.destinationType,
    },
    changes: formValues.changes || [],
    messages:
      formValues.messages?.map((message) => ({
        resourceTypeId: message.resourceTypeId,
        types: message.types || [],
      })) || [],
  };
};
