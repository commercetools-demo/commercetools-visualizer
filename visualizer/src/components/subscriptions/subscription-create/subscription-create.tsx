import { FC, useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { Route, Switch, useHistory, useParams } from 'react-router';
import { useFormik } from 'formik';

import {
  TApiErrorNotificationOptions,
  useShowApiErrorNotification,
  useShowNotification,
} from '@commercetools-frontend/actions-global';
import { DOMAINS } from '@commercetools-frontend/constants';
import Steps from '../../steps';
import messages from './messages';

import { TSubscriptionDraft } from '../../../types/generated/ctp';
import { transformErrors } from '../transform-errors';
import { useSubscriptionCreator } from '../../../hooks/use-subscription-connector';
import { InfoDetailPage } from '@commercetools-frontend/application-components';
import { ContextData } from './subscription-create-configuration';
import SubscriptionCreateDetailsStep from './subscription-create-details-step/subscription-create-details-step';
import SubscriptionCreateDestination from './subscription-create-destination/subscription-create-destination';
import SubscriptionCreateDestinationConfigure from './subscription-create-destination-configure/subscription-create-destination-configure';
import SubscriptionCreateChanges from './subscription-create-changes/subscription-create-changes';
import SubscriptionCreateMessages from './subscription-create-messages/subscription-create-messages';

type Props = {
  linkToWelcome: string;
};

export const SUBSCRIPTION_CREATE_TAB_NAMES = {
  DEFINE_KEY: 'define-key',
  SELECT_PROVIDER: 'select-provider',
  CONFIGURE_PROVIDER: 'configure-provider',
  CHANGES: 'changes',
  MESSAGES: 'messages',
};

const SubscriptionCreate: FC<Props> = ({ linkToWelcome }) => {
  const intl = useIntl();
  const history = useHistory();
  const subscriptionCreator = useSubscriptionCreator();

  const showNotification = useShowNotification();
  const showApiErrorNotification = useShowApiErrorNotification();

  const handleSubmit = useCallback(
    async (formikValues: ContextData, formikHelpers) => {
      try {
        const subscriptionDraft: TSubscriptionDraft = {
          key:
            formikValues.subscriptionStepsDraft[1].key &&
              formikValues.subscriptionStepsDraft[1].key !== ''
              ? formikValues.subscriptionStepsDraft[1].key
              : undefined,
          ...formikValues.subscriptionStepsDraft[3],
          changes:
            formikValues.subscriptionStepsDraft[4].changes &&
              formikValues.subscriptionStepsDraft[4].changes.length > 0
              ? formikValues.subscriptionStepsDraft[4].changes
              : undefined,
          messages:
            formikValues.subscriptionStepsDraft[5].messages &&
              formikValues.subscriptionStepsDraft[5].messages.length > 0
              ? formikValues.subscriptionStepsDraft[5].messages
              : undefined,
        };
        const createdSubscription = await subscriptionCreator.execute({
          draft: subscriptionDraft,
        });
        showNotification({
          kind: 'success',
          domain: DOMAINS.SIDE,
          text: intl.formatMessage(messages.subscriptionCreated, {
            subscriptionKey:
              createdSubscription.data?.createSubscription?.id || '',
          }),
        });
        history.push({
          pathname:
            linkToWelcome +
            '/subscriptions/',
          state: { refetch: true }
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
    [intl, subscriptionCreator]
  );

  const formik = useFormik<ContextData>({
    initialValues: {
      subscriptionStepsDraft: {
        1: { key: null },
        2: { destinationType: null },
        3: {
          destination: {},
        },
        4: { changes: [] },
        5: { messages: [] },
      },
    },
    onSubmit: handleSubmit,
    enableReinitialize: true,
    validateOnChange: true,
  });

  const createStepsDefinition = useMemo(
    () => [
      {
        key: SUBSCRIPTION_CREATE_TAB_NAMES.DEFINE_KEY,
        label: intl.formatMessage(messages.stepKey),
      },
      {
        key: SUBSCRIPTION_CREATE_TAB_NAMES.SELECT_PROVIDER,
        label: intl.formatMessage(messages.stepSelectProvider),
      },
      {
        key: SUBSCRIPTION_CREATE_TAB_NAMES.CONFIGURE_PROVIDER,
        label: intl.formatMessage(messages.stepConfigureProvider),
      },
      {
        key: SUBSCRIPTION_CREATE_TAB_NAMES.CHANGES,
        label: intl.formatMessage(messages.stepChanges),
      },
      {
        key: SUBSCRIPTION_CREATE_TAB_NAMES.MESSAGES,
        label: intl.formatMessage(messages.stepMessages),
      },
    ],
    [intl]
  );

  const { step = SUBSCRIPTION_CREATE_TAB_NAMES.DEFINE_KEY } = useParams<{
    step: string;
  }>();

  const current = createStepsDefinition.findIndex((item) => {
    return item.key === step;
  });

  return (
    <InfoDetailPage
      onPreviousPathClick={() => history.push(linkToWelcome + '/subscriptions')}
      title={intl.formatMessage(messages.subscriptionAdd)}
      subtitle={<Steps steps={createStepsDefinition} activeStepKey={step} />}
    >
      <div>
        <Switch>
          <Route exact path={linkToWelcome + '/subscription/new'}>
            <SubscriptionCreateDetailsStep
              currentStep={current + 1}
              goToNextStep={() => {
                history.replace({
                  pathname:
                    linkToWelcome +
                    '/subscription/new/' +
                    createStepsDefinition[current + 1].key,
                });
              }}
              totalSteps={createStepsDefinition.length}
              linkToWelcome={linkToWelcome}
              formik={formik}
            />
          </Route>
          <Route
            exact
            path={
              linkToWelcome +
              '/subscription/new/' +
              SUBSCRIPTION_CREATE_TAB_NAMES.SELECT_PROVIDER
            }
          >
            <SubscriptionCreateDestination
              currentStep={current + 1}
              goToNextStep={() => {
                history.replace({
                  pathname:
                    linkToWelcome +
                    '/subscription/new/' +
                    createStepsDefinition[current + 1].key,
                });
              }}
              totalSteps={createStepsDefinition.length}
              linkToWelcome={linkToWelcome}
              formik={formik}
            />
          </Route>

          <Route
            exact
            path={
              linkToWelcome +
              '/subscription/new/' +
              SUBSCRIPTION_CREATE_TAB_NAMES.CONFIGURE_PROVIDER
            }
          >
            <SubscriptionCreateDestinationConfigure
              currentStep={current + 1}
              goToNextStep={() => {
                history.replace({
                  pathname:
                    linkToWelcome +
                    '/subscription/new/' +
                    createStepsDefinition[current + 1].key,
                });
              }}
              totalSteps={createStepsDefinition.length}
              linkToWelcome={linkToWelcome}
              formik={formik}
            />
          </Route>

          <Route
            exact
            path={
              linkToWelcome +
              '/subscription/new/' +
              SUBSCRIPTION_CREATE_TAB_NAMES.CHANGES
            }
          >
            <SubscriptionCreateChanges
              currentStep={current + 1}
              goToNextStep={() => {
                history.replace({
                  pathname:
                    linkToWelcome +
                    '/subscription/new/' +
                    createStepsDefinition[current + 1].key,
                });
              }}
              totalSteps={createStepsDefinition.length}
              linkToWelcome={linkToWelcome}
              formik={formik}
            />
          </Route>

          <Route
            exact
            path={
              linkToWelcome +
              '/subscription/new/' +
              SUBSCRIPTION_CREATE_TAB_NAMES.MESSAGES
            }
          >
            <SubscriptionCreateMessages
              currentStep={current + 1}
              goToNextStep={() => {
                formik.handleSubmit();
              }}
              totalSteps={createStepsDefinition.length}
              linkToWelcome={linkToWelcome}
              formik={formik}
            />
          </Route>
        </Switch>
      </div>
    </InfoDetailPage>
  );
};

export default SubscriptionCreate;
