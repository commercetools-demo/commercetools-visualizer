import { FC } from 'react';
import {
  Step4,
  SubscriptionStepProps,
} from '../subscription-create-configuration';
import { Formik } from 'formik';
import Spacings from '@commercetools-uikit/spacings';
import { useHistory } from 'react-router';
import SubscriptionChangesForm from '../../subscription-changes-form/subscription-changes-form';
import { PageContentWide } from '@commercetools-frontend/application-components';
import { SaveToolbar } from 'commercetools-demo-shared-save-toolbar';

const SubscriptionCreateChanges: FC<SubscriptionStepProps> = ({
  currentStep,
  goToNextStep,
  totalSteps,
  linkToWelcome,
  formik,
}) => {
  const history = useHistory();
  const initialErrors = formik?.errors?.subscriptionStepsDraft?.[4];
  const initialTouched = formik?.touched?.subscriptionStepsDraft?.[4];
  const initialValues = formik?.values?.subscriptionStepsDraft?.[4];

  return (
    <Formik<Step4>
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
          <PageContentWide>
            <Spacings.Stack scale="xxxl">
              <SubscriptionChangesForm />
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

export default SubscriptionCreateChanges;
