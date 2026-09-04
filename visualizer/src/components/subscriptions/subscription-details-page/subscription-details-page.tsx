import { PageNotFound } from '@commercetools-frontend/application-components';
import { DOMAINS } from '@commercetools-frontend/constants';
import { FC, useCallback } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import {
  Alert,
  Button,
  DefaultPage,
  Flex,
  LoadingSpinner,
} from '@commercetools/nimbus';
import { useIntl } from 'react-intl';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import { useShowNotification } from '@commercetools-frontend/actions-global';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { PERMISSIONS } from '../../../constants';
import SubscriptionDetailsForm, {
  TFormValues,
} from '../subscription-details-form/subscription-details-form';
import messages from './messages';
import {
  useSubscriptionDeleter,
  useSubscriptionFetcher,
  useSubscriptionUpdater,
  graphQLErrorHandler,
  getErrorMessage,
  calculateSubscriptionUpdateActions,
} from '../../../hooks';
import {
  TConfluentCloudDestination,
  TGoogleCloudPubSubDestination,
  TSqsDestination,
} from '../../../types/generated/ctp';
import { FormikHelpers } from 'formik';
import { convertFormValuesToSubscription } from './convert';

type Props = {
  linkToWelcome: string;
};

const SubscriptionDetailsPage: FC<Props> = ({ linkToWelcome }) => {
  const subscriptionKeyUpdater = useSubscriptionUpdater();
  const subscriptionDeleter = useSubscriptionDeleter();
  const intl = useIntl();
  const history = useHistory();
  const showNotification = useShowNotification();
  const canManage = useIsAuthorized({
    demandedPermissions: [PERMISSIONS.Manage],
  });

  const { dataLocale } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
  }));

  const params = useParams<{ id: string }>();
  const { loading, error, subscription, refetch } =
    useSubscriptionFetcher(params);

  const handleSubmit = useCallback(
    async (
      formikValues: TFormValues,
      formikHelpers: FormikHelpers<TFormValues>
    ) => {
      if (subscription) {
        const mapped = convertFormValuesToSubscription(formikValues);
        const updateActions = calculateSubscriptionUpdateActions(
          subscription,
          mapped
        );
        if (updateActions.length > 0) {
          await subscriptionKeyUpdater
            .execute({
              actions: updateActions,
              version: subscription.version,
              id: subscription.id,
            })
            .then(() => {
              showNotification({
                kind: 'success',
                domain: DOMAINS.SIDE,
                text: intl.formatMessage(messages.subscriptionUpdated, {
                  subscriptionKey: subscription?.key,
                }),
              });
              return refetch();
            })
            .catch(graphQLErrorHandler(showNotification, formikHelpers));
        }
      }
    },
    [subscription, subscriptionKeyUpdater]
  );

  if (error) {
    return (
      <Alert.Root colorPalette="critical">
        <Alert.Title>{intl.formatMessage(messages.title)}</Alert.Title>
        <Alert.Description>{getErrorMessage(error)}</Alert.Description>
      </Alert.Root>
    );
  }
  if (loading) {
    return (
      <Flex justifyContent="center" padding="600">
        <LoadingSpinner aria-label={intl.formatMessage(messages.title)} />
      </Flex>
    );
  }
  if (!subscription) {
    return <PageNotFound />;
  }

  const handleDelete = async () => {
    await subscriptionDeleter
      .execute({
        id: subscription.id,
        version: subscription.version,
      })
      .then(() => {
        showNotification({
          kind: 'success',
          domain: DOMAINS.SIDE,
          text: intl.formatMessage(messages.subscriptionUpdated, {
            subscriptionKey: subscription?.key,
          }),
        });
        history.replace({
          pathname: linkToWelcome + '/subscriptions',
          state: { refetch: true },
        });
      })
      .catch(graphQLErrorHandler);
  };
  let dest:
    | {
        GoogleCloudPubSub?: TGoogleCloudPubSubDestination;
        SQS?: TSqsDestination;
        ConfluentCloud?: TConfluentCloudDestination;
      }
    | undefined;

  if (subscription.destination.type === 'GoogleCloudPubSub') {
    dest = {
      GoogleCloudPubSub:
        subscription.destination as TGoogleCloudPubSubDestination,
    };
  } else if (subscription.destination.type === 'SQS') {
    dest = {
      SQS: subscription.destination as TSqsDestination,
    };
  } else if (subscription.destination.type === 'ConfluentCloud') {
    dest = {
      ConfluentCloud: subscription.destination as TConfluentCloudDestination,
    };
  }

  return (
    <SubscriptionDetailsForm
      initialValues={{
        id: subscription.id,
        key: subscription.key || '',
        destinationType: subscription.destination.type || '',
        destination: dest,
        changes: subscription.changes,
        messages: subscription.messages,
      }}
      onSubmit={handleSubmit}
      isReadOnly={!canManage}
      dataLocale={dataLocale}
    >
      {(formProps) => {
        return (
          <DefaultPage.Root>
            <DefaultPage.Header>
              <DefaultPage.BackLink
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  history.push(linkToWelcome);
                }}
              >
                {intl.formatMessage(messages.title)}
              </DefaultPage.BackLink>
              <DefaultPage.Title>
                {formProps.values?.key ||
                  intl.formatMessage(messages.subscriptionKeyLabel)}
              </DefaultPage.Title>
            </DefaultPage.Header>
            <DefaultPage.Content>
              {subscription && formProps.formElements}
            </DefaultPage.Content>
            <DefaultPage.Footer>
              <Button
                variant="outline"
                isDisabled={!formProps.isDirty}
                onPress={formProps.handleReset}
              >
                {intl.formatMessage(messages.revertButton)}
              </Button>
              <Button
                colorPalette="primary"
                variant="solid"
                isDisabled={
                  formProps.isSubmitting || !formProps.isDirty || !canManage
                }
                onPress={() => formProps.submitForm()}
              >
                {intl.formatMessage(messages.saveButton)}
              </Button>
              <Button
                colorPalette="critical"
                variant="outline"
                isDisabled={!canManage}
                onPress={() => handleDelete()}
              >
                {intl.formatMessage(messages.deleteButton)}
              </Button>
            </DefaultPage.Footer>
          </DefaultPage.Root>
        );
      }}
    </SubscriptionDetailsForm>
  );
};

export default SubscriptionDetailsPage;
