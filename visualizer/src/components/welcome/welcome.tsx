import type { FC } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { useIntl } from 'react-intl';
import {
  Button,
  Card,
  DefaultPage,
  Grid,
  Icon,
  Text,
} from '@commercetools/nimbus';
import { List } from '@commercetools/nimbus-icons';
import messages from './messages';

type TInfoCardProps = {
  title: string;
  content: string;
  target: string;
};

const InfoCard: FC<TInfoCardProps> = ({ title, content, target }) => {
  const { push } = useHistory();
  const match = useRouteMatch();
  return (
    <Card.Root height="100%">
      <Card.Header>
        <Text fontSize="450" fontWeight="600" as="h2">
          {title}
        </Text>
      </Card.Header>
      <Card.Body>
        <Text>{content}</Text>
      </Card.Body>
      <Card.Footer>
        <Button variant="ghost" onPress={() => push(`${match.url}/${target}`)}>
          <Icon as={List} size="2xs" />
          {`View ${title}`}
        </Button>
      </Card.Footer>
    </Card.Root>
  );
};
InfoCard.displayName = 'InfoCard';

const Welcome = () => {
  const intl = useIntl();
  return (
    <DefaultPage.Root>
      <DefaultPage.Header>
        <DefaultPage.Title>
          {intl.formatMessage(messages.title)}
        </DefaultPage.Title>
      </DefaultPage.Header>
      <DefaultPage.Content>
        <Grid
          templateColumns="repeat(3, 1fr)"
          autoRows="minmax(180px, 200px)"
          gap="400"
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
            content={'Extend the behavior of an API with your business logic.'}
            target={'extensions'}
          />
          <InfoCard
            title={'Custom Objects'}
            content={
              'Custom Objects store arbitrary JSON-formatted data on commercetools Composable Commerce.'
            }
            target={'custom-objects'}
          />
        </Grid>
      </DefaultPage.Content>
    </DefaultPage.Root>
  );
};
Welcome.displayName = 'Welcome';

export default Welcome;
