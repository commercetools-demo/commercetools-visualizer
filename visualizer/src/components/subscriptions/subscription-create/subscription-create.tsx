import { FC, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useHistory } from 'react-router';
import { FormikHelpers } from 'formik';

import { useShowNotification } from '@commercetools-frontend/actions-global';
import { DOMAINS } from '@commercetools-frontend/constants';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import messages from './messages';

import {
  TDestinationInput,
  TSubscriptionDraft,
} from '../../../types/generated/ctp';
import { useSubscriptionCreator, graphQLErrorHandler } from '../../../hooks';
import { Button, DefaultPage, Group } from '@commercetools/nimbus';
import { PERMISSIONS } from '../../../constants';
import SubscriptionDetailsForm, {
  TFormValues,
} from '../subscription-details-form/subscription-details-form';

type Props = {
  linkToWelcome: string;
};

const SubscriptionCreate: FC<Props> = ({ linkToWelcome }) => {
  const intl = useIntl();
  const history = useHistory();
  const subscriptionCreator = useSubscriptionCreator();
  const showNotification = useShowNotification();
  const canManage = useIsAuthorized({
    demandedPermissions: [PERMISSIONS.Manage],
  });

  const handleSubmit = useCallback(
    async (
      formikValues: TFormValues,
      formikHelpers: FormikHelpers<TFormValues>
    ) => {
      const subscriptionDraft: TSubscriptionDraft = {
        key: formikValues.key || undefined,
        destination: formikValues.destination as unknown as TDestinationInput,
        changes:
          formikValues.changes && formikValues.changes.length > 0
            ? formikValues.changes
            : undefined,
        messages:
          formikValues.messages && formikValues.messages.length > 0
            ? formikValues.messages
            : undefined,
      };
      await subscriptionCreator
        .execute({
          draft: subscriptionDraft,
        })
        .then(({ createSubscription }) => {
          showNotification({
            kind: 'success',
            domain: DOMAINS.SIDE,
            text: intl.formatMessage(messages.subscriptionCreated, {
              subscriptionKey: createSubscription?.id || '',
            }),
          });
          history.push({
            pathname: linkToWelcome + '/subscriptions/',
            state: { refetch: true },
          });
        })
        .catch(graphQLErrorHandler(showNotification, formikHelpers));
    },
    [subscriptionCreator]
  );

  return (
    <SubscriptionDetailsForm
      initialValues={{
        id: '',
        key: '',
        destinationType: '',
        destination: undefined,
        changes: [],
        messages: [],
      }}
      onSubmit={handleSubmit}
      dataLocale=""
      isReadOnly={!canManage}
    >
      {(formProps) => (
        <DefaultPage.Root>
          <DefaultPage.Header>
            <DefaultPage.BackLink
              href="#"
              onClick={(event) => {
                event.preventDefault();
                history.push(linkToWelcome + '/subscriptions');
              }}
            >
              {intl.formatMessage(messages.backToSubscriptions)}
            </DefaultPage.BackLink>
            <DefaultPage.Title>
              {intl.formatMessage(messages.subscriptionAdd)}
            </DefaultPage.Title>
          </DefaultPage.Header>
          <DefaultPage.Content>{formProps.formElements}</DefaultPage.Content>
          <DefaultPage.Footer>
            <Group
              aria-label={intl.formatMessage(messages.formActionsLabel)}
              gap="300"
            >
              <Button
                variant="outline"
                onPress={() => history.push(linkToWelcome + '/subscriptions')}
              >
                {intl.formatMessage(messages.cancelButton)}
              </Button>
              <Button
                variant="solid"
                colorPalette="primary"
                isDisabled={formProps.isSubmitting || !canManage}
                onPress={() => formProps.submitForm()}
              >
                {intl.formatMessage(messages.createButton)}
              </Button>
            </Group>
          </DefaultPage.Footer>
        </DefaultPage.Root>
      )}
    </SubscriptionDetailsForm>
  );
};

export default SubscriptionCreate;
