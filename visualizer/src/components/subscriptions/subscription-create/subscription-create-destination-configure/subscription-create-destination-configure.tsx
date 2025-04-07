import { FC } from 'react';
import {
  Step3,
  SubscriptionStepProps,
} from '../subscription-create-configuration';
import { Formik } from 'formik';
import Spacings from '@commercetools-uikit/spacings';
import { PageContentWide } from '@commercetools-frontend/application-components';

import { useHistory } from 'react-router';
import SubscriptionDestinationForm from '../../subscription-destination-form/subscription-destination-form';
import { SaveToolbar } from 'commercetools-demo-shared-save-toolbar';
const SubscriptionCreateDestinationConfigure: FC<SubscriptionStepProps> = ({
  currentStep,
  goToNextStep,
  totalSteps,
  linkToWelcome,
  formik,
}) => {
  const history = useHistory();
  const initialErrors = formik?.errors?.subscriptionStepsDraft?.[3];
  const initialTouched = formik?.touched?.subscriptionStepsDraft?.[3];
  const initialValues = formik?.values?.subscriptionStepsDraft?.[3];
  const destinationType =
    formik?.values?.subscriptionStepsDraft?.[2].destinationType || '';

  return (
    <Formik<Step3>
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
              <SubscriptionDestinationForm destinationType={destinationType} />
            </Spacings.Stack>
          </PageContentWide>
          <SaveToolbar
            isVisible={formikProps.dirty || formik?.dirty}
            buttonProps={{ next: { isDisabled: !formikProps.isValid } }}
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={formikProps.handleSubmit}
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

export default SubscriptionCreateDestinationConfigure;
