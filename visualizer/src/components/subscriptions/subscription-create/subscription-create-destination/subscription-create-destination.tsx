import { FC } from 'react';
import { useHistory } from 'react-router';
import {
  Step2,
  SubscriptionStepProps,
} from '../subscription-create-configuration';
import { Formik } from 'formik';
import { PageContentWide } from '@commercetools-frontend/application-components';
import Spacings from '@commercetools-uikit/spacings';
import SubscriptionDestinationTypeForm from '../../subscription-destination-type-form/subscription-destination-type-form';
import StepperToolbar from '../../../save-toolbar/StepperToolbar';

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
          <PageContentWide columns="2/1" gapSize="20">
            <Spacings.Stack scale="xxxl">
              <SubscriptionDestinationTypeForm />
            </Spacings.Stack>
          </PageContentWide>
          <StepperToolbar
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
