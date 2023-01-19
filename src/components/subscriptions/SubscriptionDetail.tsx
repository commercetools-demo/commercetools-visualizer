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
import {
  useShowNotification,
  useShowApiErrorNotification,
  type TApiErrorNotificationOptions,
} from '@commercetools-frontend/actions-global';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { getErrorMessage } from '../../helpers';
import { PERMISSIONS } from '../../constants';
import SubscriptionDetailsForm from './SubscriptionDetailsForm';
import messages from './messages';
import { transformErrors } from './transform-errors';
import {
  useSubscriptionDeleter,
  useSubscriptionFetcher,
  useSubscriptionKeyUpdater,
} from './subscription-connectors';

type Props = {
  linkToWelcome: string;
};

const SubscriptionDetail: FC<Props> = ({ linkToWelcome }) => {
  const subscriptionKeyUpdater = useSubscriptionKeyUpdater();
  const subscriptionDeleter = useSubscriptionDeleter();
  const intl = useIntl();
  const history = useHistory();
  const showNotification = useShowNotification();
  const showApiErrorNotification = useShowApiErrorNotification();
  const canManage = useIsAuthorized({
    demandedPermissions: [PERMISSIONS.Manage],
  });

  const { dataLocale } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
  }));

  const params = useParams<{ id: string }>();
  const { loading, error, subscription } = useSubscriptionFetcher(params);

  const handleSubmit = useCallback(
    async (formikValues, formikHelpers) => {
      try {
        subscription &&
          (await subscriptionKeyUpdater.execute({
            originalDraft: subscription,
            nextDraft: formikValues,
          }));
        showNotification({
          kind: 'success',
          domain: DOMAINS.SIDE,
          text: intl.formatMessage(messages.subscriptionUpdated, {
            subscriptionKey: subscription?.key,
          }),
        });
      } catch (graphQLErrors) {
        const transformedErrors = transformErrors(graphQLErrors);
        if (transformedErrors.unmappedErrors.length > 0) {
          showApiErrorNotification({
            errors:
              transformedErrors.unmappedErrors as TApiErrorNotificationOptions['errors'],
          });
        }

        formikHelpers.setErrors(transformedErrors.formErrors);
      }
    },
    [
      subscription,
      intl,
      showApiErrorNotification,
      showNotification,
      subscriptionKeyUpdater,
    ]
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
    });
  };

  return (
    <SubscriptionDetailsForm
      initialValues={{
        id: subscription.id,
        key: subscription.key,
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

export default SubscriptionDetail;
