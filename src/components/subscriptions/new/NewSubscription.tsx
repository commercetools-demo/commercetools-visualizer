import { FC, useCallback } from 'react';
import Text from '@commercetools-uikit/text';
import { useIntl } from 'react-intl';
import { Route, Switch, useHistory, useParams } from 'react-router';
import TextField from '@commercetools-uikit/text-field';
import { useFormik, FormikProvider } from 'formik';

import SelectField from '@commercetools-uikit/select-field';
import type { FormikErrors } from 'formik';
import omitEmpty from 'omit-empty-es';
import TextInput from '@commercetools-uikit/text-input';
import Steps from '../../steps';
import StepperToolbar from '../../save-toolbar/StepperToolbar';
import { TFormValues } from '../../../types';
import messages from '../messages';

import styles from '../subscriptions.module.css';
import { TSubscriptionDraft } from '../../../types/generated/ctp';
import { TErrors } from '../SubscriptionDetail';
import Destinations from './Destinations';
import Changes from './Changes';
import Messages from './Messages';

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

type SubscriptionDraft = { destinationType: string } & TSubscriptionDraft;

const NewSubscription: FC<Props> = ({ linkToWelcome }) => {
  const intl = useIntl();
  const history = useHistory();

  const handleSubmit = useCallback(async (formikValues, formikHelpers) => {
    console.log(formikValues);
  }, []);

  const validate = (
    formikValues: SubscriptionDraft
  ): FormikErrors<SubscriptionDraft> => {
    const errors: TErrors = {
      key: {},
    };

    if (!formikValues.key || TextInput.isEmpty(formikValues.key)) {
      errors.key.missing = true;
    }
    return omitEmpty(errors);
  };

  const formik = useFormik<SubscriptionDraft>({
    initialValues: {
      key: 'pho-test',
      destination: {
        GoogleCloudPubSub: {
          topic: 'ct-sales-207211',
          projectId: 'learn-pho-subscription-topic',
        },
      },
      destinationType: 'GoogleCloudPubSub',
      changes: [{ resourceTypeId: 'product' }],
      messages: [
        { resourceTypeId: 'product', types: ['ProductRevertedStagedChanges'] },
        {
          resourceTypeId: 'business-unit',
          types: ['BusinessUnitAddressAdded'],
        },
      ],
    },
    onSubmit: handleSubmit,
    validate: validate,
    enableReinitialize: true,
  });

  const createStepsDefinition = [
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
  ];

  const { step = SUBSCRIPTION_CREATE_TAB_NAMES.DEFINE_KEY } = useParams<{
    step: string;
  }>();

  const current = createStepsDefinition.findIndex((item) => {
    return item.key === step;
  });

  console.log(formik.values);

  return (
    <div className={styles.subscriptionNewPage}>
      <div className={styles.subscriptionNewHeader}>
        <div>
          <Text.Headline as="h2">
            {intl.formatMessage(messages.subscriptionAdd)}
          </Text.Headline>
          <div className={styles['add-subscription-page-module__tabs-list']}>
            <Steps steps={createStepsDefinition} activeStepKey={step} />
          </div>
        </div>
      </div>
      <div className={styles.subscriptionNewContent}>
        <FormikProvider value={formik}>
          <Switch>
            <Route exact path={linkToWelcome + '/subscription/new'}>
              <TextField
                name="key"
                title="Key"
                isRequired={false}
                value={formik.values.key || ''}
                errors={TextField.toFieldErrors<TFormValues>(formik.errors).key}
                touched={formik.touched.key}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                renderError={(errorKey) => {
                  if (errorKey === 'duplicate') {
                    return intl.formatMessage(messages.duplicateKey);
                  }
                  return null;
                }}
              />
            </Route>
            <Route
              exact
              path={
                linkToWelcome +
                '/subscription/new/' +
                SUBSCRIPTION_CREATE_TAB_NAMES.DEFINE_KEY
              }
            >
              <TextField
                name="key"
                title="Key"
                isRequired={false}
                value={formik.values.key || ''}
                horizontalConstraint={10}
                errors={TextField.toFieldErrors<TFormValues>(formik.errors).key}
                touched={formik.touched.key}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                renderError={(errorKey) => {
                  if (errorKey === 'duplicate') {
                    return intl.formatMessage(messages.duplicateKey);
                  }
                  return null;
                }}
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
              <SelectField
                title={'Destination'}
                description={'Destination'}
                name="destinationType"
                isRequired={true}
                horizontalConstraint={10}
                isDisabled={formik.isSubmitting}
                isClearable={true}
                isSearchable={true}
                options={[
                  { value: 'AzureEventGrid', label: 'AzureEventGrid' },
                  { value: 'AzureServiceBus', label: 'AzureServiceBus' },
                  { value: 'EventBridge', label: 'EventBridge' },
                  { value: 'GoogleCloudPubSub', label: 'GCP Pub/Sub' },
                  { value: 'IronMq', label: 'IronMq' },
                  {
                    value: 'sns',
                    label: 'Amazon Simple Notification Service (SNS)',
                  },
                  { value: 'Sqs', label: 'Sqs' },
                ]}
                value={formik.values.destinationType}
                // errors={validationErrors}
                // renderError={renderError}
                touched={formik.touched.destinationType}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
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
              <Destinations formik={formik} />
            </Route>

            <Route
              exact
              path={
                linkToWelcome +
                '/subscription/new/' +
                SUBSCRIPTION_CREATE_TAB_NAMES.CHANGES
              }
            >
              <Changes />
            </Route>

            <Route
              exact
              path={
                linkToWelcome +
                '/subscription/new/' +
                SUBSCRIPTION_CREATE_TAB_NAMES.MESSAGES
              }
            >
              <Messages />
            </Route>
          </Switch>
        </FormikProvider>
      </div>
      <StepperToolbar
        isVisible={true}
        currentStep={current + 1}
        totalSteps={createStepsDefinition.length}
        onSave={() => {
          formik.submitForm();
        }}
        onNext={() => {
          history.replace({
            pathname:
              linkToWelcome +
              '/subscription/new/' +
              createStepsDefinition[current + 1].key,
          });
          return;
        }}
        onBack={() => {
          history.replace({
            pathname:
              linkToWelcome +
              '/subscription/new/' +
              createStepsDefinition[current - 1].key,
          });
        }}
        onCancel={() => {
          history.replace({
            pathname: linkToWelcome + '/subscriptions',
          });
        }}
      />
    </div>
  );
};

export default NewSubscription;
