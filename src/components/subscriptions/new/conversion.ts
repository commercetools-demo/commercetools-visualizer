import TextInput from '@commercetools-uikit/text-input';
import type { FormikErrors } from 'formik';
import omitEmpty from 'omit-empty-es';
import { TErrors } from '../SubscriptionDetail';

export type SubscriptionType = {
  // changes?: InputMaybe<Array<TChangeSubscriptionInput>>;
  //destination: TDestinationInput;
  // format?: InputMaybe<TSubscriptionFormatInput>;
  key?: string;
  // messages?: InputMaybe<Array<TMessageSubscriptionInput>>;
  destinationType?: string;
  GoogleCloudPubSub?: { projectId: string; topic: string };

  // AzureServiceBus?: InputMaybe<TAzureServiceBusDestinationInput>;
  // EventBridge?: InputMaybe<TEventBridgeDestinationInput>;
  // EventGrid?: InputMaybe<TEventGridDestinationInput>;
  // GoogleCloudPubSub?: InputMaybe<TGoogleCloudPubSubDestinationInput>;
  // SNS?: InputMaybe<TSnsDestinationInput>;
  // SQS?: InputMaybe<TSqsDestinationInput>;
  changes: Array<string>;
  messages: Array<string>;
};

export const validate = (
  formikValues: SubscriptionType
): FormikErrors<SubscriptionType> => {
  const errors: TErrors = {
    key: {},
  };

  if (!formikValues.key || TextInput.isEmpty(formikValues.key)) {
    errors.key.missing = true;
  }
  return omitEmpty(errors);
};
