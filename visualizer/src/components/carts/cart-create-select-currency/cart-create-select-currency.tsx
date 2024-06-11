import { FC } from 'react';
import { Formik } from 'formik';
import SelectField from '@commercetools-uikit/select-field';
import messages from './messages';
import { useIntl } from 'react-intl';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import StepperToolbar from '../../save-toolbar/StepperToolbar';
import { useHistory } from 'react-router';
import { StepProps } from '../cart-create/cart-create';
import { useCartCreator } from '../../../hooks/use-carts-hook';
import { DOMAINS } from '@commercetools-frontend/constants';
import { transformErrors } from '../../subscriptions/transform-errors';
import {
  showApiErrorNotification,
  TApiErrorNotificationOptions,
  useShowNotification,
} from '@commercetools-frontend/actions-global';
import { TCart, TCartDraft } from '../../../types/generated/ctp';
import Spacings from '@commercetools-uikit/spacings';

type Props = StepProps & {
  cart?: TCart;
};

export type Step1 = {
  currency: string | undefined;
  country: string | undefined;
};

export const CartCreateSelectCurrency: FC<Props> = ({
  currentStep,
  totalSteps,
  linkToWelcome,
  goToNextStep,
  cart,
}) => {
  const intl = useIntl();
  const history = useHistory();
  const { currencies, dataLocale, countries } = useApplicationContext(
    (context) => ({
      currencies: context.project?.currencies ?? [],
      countries: context.project?.countries ?? [],
      dataLocale: context.dataLocale ?? '',
    })
  );
  const showNotification = useShowNotification();
  const cartCreator = useCartCreator();
  return (
    <Formik<Step1>
      enableReinitialize={true}
      initialValues={{
        currency: cart?.totalPrice.currencyCode || undefined,
        country: cart?.country || undefined,
      }}
      onSubmit={async (formikValues, formikHelpers) => {
        try {
          const draft: TCartDraft = {
            currency: formikValues.currency || 'EUR',
            country: formikValues.country || undefined,
          };

          const { data } = await cartCreator.execute({
            draft: draft,
            locale: dataLocale,
          });

          if (
            data &&
            data.createCart &&
            data.createCart.id &&
            data.createCart.version
          ) {
            showNotification({
              kind: 'success',
              domain: DOMAINS.SIDE,
              text: intl.formatMessage(messages.createSuccess),
            });
            goToNextStep(data.createCart.id);
          }
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
      }}
    >
      {(formikProps) => (
        <Spacings.Stack scale="xl">
          <SelectField
            name="currency"
            title={intl.formatMessage(messages.currencyTitle)}
            isRequired
            value={formikProps.values.currency}
            options={currencies.map((currency) => {
              return { value: currency, label: currency };
            })}
            errors={
              SelectField.toFieldErrors<Step1>(formikProps.errors).currency
            }
            touched={
              formikProps.touched.currency
                ? formikProps.touched.currency
                : undefined
            }
            onBlur={formikProps.handleBlur}
            onChange={formikProps.handleChange}
            isDisabled={cart !== undefined}
          />
          <SelectField
            name="country"
            title={intl.formatMessage(messages.countryTitle)}
            isRequired
            value={formikProps.values.country}
            options={countries.map((country) => {
              return { value: country, label: country };
            })}
            errors={
              SelectField.toFieldErrors<Step1>(formikProps.errors).country
            }
            touched={
              formikProps.touched.country
                ? formikProps.touched.country
                : undefined
            }
            onBlur={formikProps.handleBlur}
            onChange={formikProps.handleChange}
          />
          <StepperToolbar
            isVisible={formikProps.dirty}
            buttonProps={{ next: { isDisabled: !formikProps.isValid } }}
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={() => {
              formikProps.handleSubmit();
            }}
            onCancel={() => {
              history.replace({
                pathname: linkToWelcome + '/carts',
              });
            }}
          />
        </Spacings.Stack>
      )}
    </Formik>
  );
};

export default CartCreateSelectCurrency;
