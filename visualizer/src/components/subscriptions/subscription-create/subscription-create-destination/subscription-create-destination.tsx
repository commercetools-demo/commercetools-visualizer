import { FC } from 'react';
import { useHistory } from 'react-router';
import {
  Step2,
  SubscriptionStepProps,
} from '../subscription-create-configuration';
import { Formik } from 'formik';
import { Stack } from '@commercetools/nimbus';
import SubscriptionDestinationTypeForm from '../../subscription-destination-type-form/subscription-destination-type-form';
import { SaveToolbar } from 'commercetools-demo-shared-save-toolbar';

const SubscriptionCreateDestination: FC<SubscriptionStepProps> = ({
  currentStep,
  goToNextStep,
  totalSteps,
  linkToWelcome,
  formik,
}) => {
  const history = useHistory();
  const initialErrors = formik?.errors?.subscriptionStepsDraft?.[2];
  const initialTouched = formik?.touched?.subscriptionStepsDraft?.[2];
  const initialValues = formik?.values?.subscriptionStepsDraft?.[2];
  return (
    <Formik<Step2>
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
            <SubscriptionDestinationTypeForm />
          </Stack>
          <SaveToolbar
            isVisible={formikProps.dirty || formik?.dirty}
            buttonProps={{ next: { isDisabled: !formikProps.isValid } }}
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={() => {
              formikProps.handleSubmit();
            }}
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

export default SubscriptionCreateDestination;
