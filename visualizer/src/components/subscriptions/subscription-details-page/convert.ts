import { TFormValues } from '../subscription-details-form/subscription-details-form';
import { TCommercetoolsSubscription } from 'commercetools-demo-shared-helpers';

export const convertFormValuesToSubscription = (
  formValues: TFormValues
): Pick<
  TCommercetoolsSubscription,
  'key' | 'destination' | 'changes' | 'messages'
> => {
  return {
    key: formValues.key,
    destination: {
      ...formValues.destination?.[formValues.destinationType],
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
