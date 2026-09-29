import { FC } from 'react';
import { useIntl } from 'react-intl';
import { Stack } from '@commercetools/nimbus';
import GoogleCloudPubSubDestination from './subscription-destination-form-gcp';
import SQSDestination from './subscription-destination-form-sqs';
import ConfluentCloudDestination from './subscription-destination-form-confluent-cloud';
import SNSDestination from './subscription-destination-form-sns';
import EventBridgeDestination from './subscription-destination-form-event-bridge';
import AzureServiceBusDestination from './subscription-destination-form-azure-service-bus';
import AzureEventGridDestination from './subscription-destination-form-event-grid';
import messages from './messages';

type Props = {
  destinationType: string;
  isReadOnly?: boolean;
};

const SubscriptionDestinationForm: FC<Props> = ({
  destinationType,
  isReadOnly,
}) => {
  const intl = useIntl();
  let toRender = (
    <div>
      {intl.formatMessage(messages.noMappingDefined, { destinationType })}
    </div>
  );
  switch (destinationType) {
    case 'GoogleCloudPubSub':
      toRender = <GoogleCloudPubSubDestination isReadOnly={isReadOnly} />;
      break;
    case 'SQS':
      toRender = <SQSDestination isReadOnly={isReadOnly} />;
      break;
    case 'ConfluentCloud':
      toRender = <ConfluentCloudDestination isReadOnly={isReadOnly} />;
      break;
    case 'SNS':
      toRender = <SNSDestination isReadOnly={isReadOnly} />;
      break;
    case 'EventBridge':
      toRender = <EventBridgeDestination isReadOnly={isReadOnly} />;
      break;
    case 'AzureServiceBus':
      toRender = <AzureServiceBusDestination isReadOnly={isReadOnly} />;
      break;
    case 'EventGrid':
      toRender = <AzureEventGridDestination isReadOnly={isReadOnly} />;
      break;
  }

  return (
    <Stack direction="column" gap="400">
      {toRender}
    </Stack>
  );
};

export default SubscriptionDestinationForm;
