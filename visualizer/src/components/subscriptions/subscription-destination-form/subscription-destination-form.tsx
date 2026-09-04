import { FC } from 'react';
import { Stack } from '@commercetools/nimbus';
import GoogleCloudPubSubDestination from './subscription-destination-form-gcp';
import SQSDestination from './subscription-destination-form-sqs';
import ConfluentCloudDestination from './subscription-destination-form-confluent-cloud';

type Props = {
  destinationType: string;
  isReadOnly?: boolean;
};

const SubscriptionDestinationForm: FC<Props> = ({
  destinationType,
  isReadOnly,
}) => {
  let toRender = <div>No mapping defined so far for {destinationType}</div>;
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
  }

  return (
    <Stack direction="column" gap="400">
      {toRender}
    </Stack>
  );
};

export default SubscriptionDestinationForm;
