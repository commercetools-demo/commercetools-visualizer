import type { FC } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import Grid from '@commercetools-uikit/grid';
import { ListIcon } from '@commercetools-uikit/icons';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import messages from './messages';
import { PageContentWide } from '@commercetools-frontend/application-components';
import { customProperties } from '@commercetools-uikit/design-system';
import Card from '@commercetools-uikit/card';
import FlatButton from '@commercetools-uikit/flat-button';
import AccessibleButton from '@commercetools-uikit/accessible-button';

type TInfoCardProps = {
  title: string;
  content: string;
  target: string;
};

const InfoCard: FC<TInfoCardProps> = ({
  title,
  content,
  target,
}: TInfoCardProps) => {
  const { push } = useHistory();
  const match = useRouteMatch();
  return (
    <Grid.Item>
      <Card type={'raised'} insetScale={'m'} theme={'light'}>
        <Spacings.Stack alignItems={'stretch'}>
          <Text.Headline as={'h2'}>{title}</Text.Headline>
          <Text.Body>{content}</Text.Body>
          <FlatButton
            label={`View ${title}`}
            onClick={() => push(`${match.url}/${target}`)}
            icon={
              <AccessibleButton
                as={'a'}
                type={'button'}
                label={`View ${title}`}
              >
                <ListIcon></ListIcon>
              </AccessibleButton>
            }
          ></FlatButton>
        </Spacings.Stack>
      </Card>
    </Grid.Item>
  );
};
InfoCard.displayName = 'InfoCard';

const Welcome = () => {
  return (
    <Spacings.Inset scale="l">
      <PageContentWide>
        <Spacings.Stack scale="xl">
          <Text.Headline as="h1" intlMessage={messages.title} />
          <Grid
            gridTemplateColumns={`repeat(3,1fr)`}
            gridGap={customProperties.spacingM}
            gridAutoColumns={'1fr'}
          >
            <InfoCard
              title={'Types'}
              content={
                ' Types allow you to define additional project-specific fields on resources and data types, so-called "Custom Fields."'
              }
              target={'types'}
            />

            <InfoCard
              title={'Subscriptions'}
              content={
                'Subscriptions allow you to be notified of new messages or changes via a message queue of your choice.'
              }
              target={'subscriptions'}
            />
            <InfoCard
              title={'States'}
              content={
                'States allow you to model finite state machines reflecting custom business logic. '
              }
              target={'states'}
            />
            <InfoCard
              title={'API Extensions'}
              content={
                'Extend the behavior of an API with your business logic.'
              }
              target={'extensions'}
            />
            <InfoCard
              title={'Carts'}
              content={
                'A Cart is a representation of a shopping cart containing items that a customer intends to purchase.'
              }
              target={'carts'}
            />
          </Grid>
        </Spacings.Stack>
      </PageContentWide>
    </Spacings.Inset>
  );
};
Welcome.displayName = 'Welcome';

export default Welcome;
