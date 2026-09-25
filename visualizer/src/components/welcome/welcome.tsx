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
  viewButtonLabel: string;
  target: string;
};

const InfoCard: FC<TInfoCardProps> = ({
  title,
  content,
  viewButtonLabel,
  target,
}) => {
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
          {viewButtonLabel}
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
            title={intl.formatMessage(messages.typesTitle)}
            content={intl.formatMessage(messages.typesContent)}
            viewButtonLabel={intl.formatMessage(messages.typesViewButton)}
            target={'types'}
          />

          <InfoCard
            title={intl.formatMessage(messages.subscriptionsTitle)}
            content={intl.formatMessage(messages.subscriptionsContent)}
            viewButtonLabel={intl.formatMessage(
              messages.subscriptionsViewButton
            )}
            target={'subscriptions'}
          />
          <InfoCard
            title={intl.formatMessage(messages.statesTitle)}
            content={intl.formatMessage(messages.statesContent)}
            viewButtonLabel={intl.formatMessage(messages.statesViewButton)}
            target={'states'}
          />
          <InfoCard
            title={intl.formatMessage(messages.extensionsTitle)}
            content={intl.formatMessage(messages.extensionsContent)}
            viewButtonLabel={intl.formatMessage(messages.extensionsViewButton)}
            target={'extensions'}
          />
          <InfoCard
            title={intl.formatMessage(messages.customObjectsTitle)}
            content={intl.formatMessage(messages.customObjectsContent)}
            viewButtonLabel={intl.formatMessage(
              messages.customObjectsViewButton
            )}
            target={'custom-objects'}
          />
        </Grid>
      </DefaultPage.Content>
    </DefaultPage.Root>
  );
};
Welcome.displayName = 'Welcome';

export default Welcome;
