import { FC } from 'react';
import {
  Step1,
  SubscriptionStepProps,
} from '../subscription-create-configuration';
import { Formik } from 'formik';
import Spacings from '@commercetools-uikit/spacings';
import SubscriptionGeneralInfoForm from '../../subscription-general-info-form/subscription-general-info-form';
import { PageContentWide } from '@commercetools-frontend/application-components';

import { useHistory } from 'react-router';
import { SaveToolbar } from 'commercetools-demo-shared-save-toolbar';

const SubscriptionCreateDetailsStep: FC<SubscriptionStepProps> = ({
  currentStep,
  goToNextStep,
  totalSteps,
  linkToWelcome,
  formik,
}) => {
  const history = useHistory();
  const initialErrors = formik?.errors?.subscriptionStepsDraft?.[1];
  const initialTouched = formik?.touched?.subscriptionStepsDraft?.[1];
  const initialValues = formik?.values?.subscriptionStepsDraft?.[1];

  return (
    <Formik<Step1>
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
              <SubscriptionGeneralInfoForm />
            </Spacings.Stack>
          </PageContentWide>
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

export default SubscriptionCreateDetailsStep;
