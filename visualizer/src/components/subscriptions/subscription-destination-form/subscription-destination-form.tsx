import { FC } from 'react';
import GoogleCloudPubSubDestination from './subscription-destination-form-gcp';
import Constraints from '@commercetools-uikit/constraints';
import Grid from '@commercetools-uikit/grid';
import { designTokens } from '@commercetools-uikit/design-system';
import Card from '@commercetools-uikit/card';
import Spacings from '@commercetools-uikit/spacings';
import SQSDestination from './subscription-destination-form-sqs';

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
  }

  return (
    <Constraints.Horizontal max="scale">
      <Grid
        gridGap={designTokens.spacing50}
        gridTemplateColumns={`repeat(auto-fill, '')`}
      >
        <Grid.Item>
          <Constraints.Horizontal max="scale">
            <Card insetScale="s" type="flat">
              <Spacings.Stack scale="m">{toRender}</Spacings.Stack>
            </Card>
          </Constraints.Horizontal>
        </Grid.Item>
      </Grid>
    </Constraints.Horizontal>
  );
};

export default SubscriptionDestinationForm;
