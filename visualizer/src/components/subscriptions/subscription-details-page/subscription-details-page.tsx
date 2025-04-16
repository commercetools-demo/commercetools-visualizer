import {
  CustomFormDetailPage,
  CustomFormModalPage,
  FormModalPage,
  PageNotFound,
} from '@commercetools-frontend/application-components';
import { DOMAINS } from '@commercetools-frontend/constants';
import { FC, useCallback } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import { ContentNotification } from '@commercetools-uikit/notifications';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
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
} from 'commercetools-demo-shared-data-fetching-hooks';
import {
  TGoogleCloudPubSubDestination,
  TSqsDestination,
} from '../../../types/generated/ctp';

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
    async (formikValues: TFormValues, formikHelpers) => {
      if (subscription) {
        const updateActions = calculateSubscriptionUpdateActions(
          subscription,
          formikValues
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
      <ContentNotification type="error">
        <Text.Body>{getErrorMessage(error)}</Text.Body>
      </ContentNotification>
    );
  }
  if (loading) {
    return (
      <Spacings.Stack alignItems="center">
        <LoadingSpinner />
      </Spacings.Stack>
    );
  }
  if (!subscription) {
    return <PageNotFound />;
  }

  const handleDelete = async () => {
    await subscriptionDeleter.execute({
      id: subscription.id,
      version: subscription.version,
    });
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
  };
  let dest:
    | {
        GoogleCloudPubSub?: TGoogleCloudPubSubDestination;
        SQS?: TSqsDestination;
      }
    | undefined;

  if (subscription.destination.type === 'GoogleCloudPubSub') {
    dest = {
      GoogleCloudPubSub:
        subscription.destination as TGoogleCloudPubSubDestination,
    };
  }
  if (subscription.destination.type === 'SQS') {
    dest = {
      SQS: subscription.destination as TSqsDestination,
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
          <CustomFormDetailPage
            title={
              formProps.values?.key ||
              intl.formatMessage(messages.subscriptionKeyLabel)
            }
            onPreviousPathClick={() => history.push(linkToWelcome)}
            formControls={
              <>
                <CustomFormDetailPage.FormSecondaryButton
                  label={FormModalPage.Intl.revert}
                  isDisabled={!formProps.isDirty}
                  onClick={formProps.handleReset}
                />
                <CustomFormDetailPage.FormPrimaryButton
                  isDisabled={
                    formProps.isSubmitting || !formProps.isDirty || !canManage
                  }
                  onClick={() => formProps.submitForm()}
                  label={FormModalPage.Intl.save}
                />
                <CustomFormModalPage.FormDeleteButton
                  onClick={() => handleDelete()}
                />
              </>
            }
          >
            {subscription && formProps.formElements}
          </CustomFormDetailPage>
        );
      }}
    </SubscriptionDetailsForm>
  );
};

export default SubscriptionDetailsPage;
