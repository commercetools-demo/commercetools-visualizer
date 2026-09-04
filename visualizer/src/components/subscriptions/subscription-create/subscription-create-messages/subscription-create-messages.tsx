import { FC } from 'react';
import {
  Step5,
  SubscriptionStepProps,
} from '../subscription-create-configuration';
import { Formik } from 'formik';
import { Stack } from '@commercetools/nimbus';

import { useHistory } from 'react-router';
import SubscriptionMessagesForm from '../../subscription-messages-form/subscription-messages-form';
import { SaveToolbar } from 'commercetools-demo-shared-save-toolbar';

const SubscriptionCreateMessages: FC<SubscriptionStepProps> = ({
  currentStep,
  goToNextStep,
  totalSteps,
  linkToWelcome,
  formik,
}) => {
  const history = useHistory();
  const initialErrors = formik?.errors?.subscriptionStepsDraft?.[5];
  const initialTouched = formik?.touched?.subscriptionStepsDraft?.[5];
  const initialValues = formik?.values?.subscriptionStepsDraft?.[5];

  return (
    <Formik<Step5>
      enableReinitialize={true}
      initialValues={initialValues}
      initialErrors={initialErrors}
      initialTouched={initialTouched}
      onSubmit={(values) => {
        formik?.setFieldValue(`subscriptionStepsDraft.${currentStep}`, values);
        goToNextStep();
      }}
    >
      {(formikProps) => (
        <>
          <Stack direction="column" gap="800">
            <SubscriptionMessagesForm />
          </Stack>
          <SaveToolbar
            isVisible={formikProps.dirty || formik?.dirty}
            buttonProps={{ next: { isDisabled: !formikProps.isValid } }}
            currentStep={currentStep}
            totalSteps={totalSteps}
            onSave={formikProps.handleSubmit}
            onCancel={() => {
              history.replace({
                pathname: linkToWelcome + '/subscriptions',
              });
            }}
          />
        </>
      )}
    </Formik>
  );
};

export default SubscriptionCreateMessages;
