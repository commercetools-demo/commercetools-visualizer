import { FC } from 'react';
import GoogleCloudPubSubDestination from './subscription-destination-form-gcp';
import Constraints from '@commercetools-uikit/constraints';
import Grid from '@commercetools-uikit/grid';
import { customProperties } from '@commercetools-uikit/design-system';
import Card from '@commercetools-uikit/card';
import Spacings from '@commercetools-uikit/spacings';

type Props = {
  destinationType: string;
};

const SubscriptionDestinationForm: FC<Props> = ({ destinationType }) => {
  let toRender = <div>No mapping defined so far for {destinationType}</div>;
  switch (destinationType) {
    case 'GoogleCloudPubSub':
      toRender = <GoogleCloudPubSubDestination />;
      break;
  }

  return (
    <Constraints.Horizontal max="scale">
      <Grid
        gridGap={customProperties.spacing50}
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
