import { FC } from 'react';
import { useCustomerFetcher } from '../../../hooks/use-customers-hook';
import { ContentNotification } from '@commercetools-uikit/notifications';
import Text from '@commercetools-uikit/text';
import { getErrorMessage } from '../../../helpers';
import Spacings from '@commercetools-uikit/spacings';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import {
  PageContentNarrow,
  PageNotFound,
} from '@commercetools-frontend/application-components';
import { Formik } from 'formik';
import { FormattedMessage, useIntl } from 'react-intl';
import { Step3 } from '../cart-create/conversion';
import { StepProps } from '../cart-create/cart-create';
import { useHistory } from 'react-router';
import Constraints from '@commercetools-uikit/constraints';
import CollapsiblePanel from '@commercetools-uikit/collapsible-panel';
import messages from './messages';
import CartCreateCustomerAddressesList from '../cart-create-customer-addresses-list';
import { SHORT_ADDRESS_TYPE } from '../../../constants';
import { TCart, TCartUpdateAction } from '../../../types/generated/ctp';
import { DOMAINS } from '@commercetools-frontend/constants';
import { useCartUpdater } from '../../../hooks/use-carts-hook';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { useShowNotification } from '@commercetools-frontend/actions-global';
import omit from 'lodash/omit';
import { SaveToolbar } from 'commercetools-demo-shared-save-toolbar';

type Props = StepProps & { cart: TCart };

const CartCreateCustomerAddresses: FC<Props> = ({
  currentStep,
  goToNextStep,
  totalSteps,
  linkToWelcome,
  cart,
  goToPreviousStep,
}) => {
  const intl = useIntl();
  const history = useHistory();
  const { customer, loading, error } = useCustomerFetcher({
    id: cart.customerId || '',
  });
  const showNotification = useShowNotification();
  const { dataLocale } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
  }));
  const cartUpdater = useCartUpdater();
  if (error) {
    return (
      <ContentNotification type="error">
        <Text.Body>{getErrorMessage(error)}</Text.Body>
      </ContentNotification>
    );
  }
  if (loading) {
    return (
      <Spacings.Stack alignItems="center">
        <LoadingSpinner />
      </Spacings.Stack>
    );
  }

  if (!customer) {
    return <PageNotFound />;
  }

  const renderEmpty = () => (
    <Spacings.Stack scale="xs">
      <Text.Body intlMessage={messages.noAddresses} />
    </Spacings.Stack>
  );

  return (
    <Formik<Step3>
      enableReinitialize={true}
      initialValues={{
        shippingAddress: cart.shippingAddress || undefined,
        billingAddress: cart.billingAddress || undefined,
      }}
      onSubmit={async (values) => {
        const updateActions: Array<TCartUpdateAction> = [];
        if (values.shippingAddress) {
          updateActions.push({
            setShippingAddress: {
              address: omit(values.shippingAddress, ['__typename']),
            },
          });
        }
        if (values.billingAddress) {
          updateActions.push({
            setBillingAddress: {
              address: omit(values.billingAddress, ['__typename']),
            },
          });
        }
        await cartUpdater.execute({
          actions: updateActions,
          id: cart.id,
          version: cart.version,
          locale: dataLocale,
        });
        showNotification({
          kind: 'success',
          domain: DOMAINS.SIDE,
          text: intl.formatMessage(messages.updateSuccess),
        });
        goToNextStep && goToNextStep();
      }}
    >
      {(formikProps) => {
        return (
          <>
            <PageContentNarrow>
              <Spacings.Stack scale="xl">
                <Spacings.Stack scale="xxxl">
                  <CollapsiblePanel
                    header={
                      <CollapsiblePanel.Header>
                        <FormattedMessage {...messages.titleShippingAddress} />
                      </CollapsiblePanel.Header>
                    }
                  >
                    <Constraints.Horizontal>
                      <Spacings.Stack>
                        {customer.addresses.length > 0 ? (
                          <CartCreateCustomerAddressesList
                            addressType={SHORT_ADDRESS_TYPE.SHIPPING}
                            customer={customer}
                            formik={formikProps}
                          />
                        ) : (
                          renderEmpty()
                        )}
                      </Spacings.Stack>
                    </Constraints.Horizontal>
                  </CollapsiblePanel>
                  <CollapsiblePanel
                    header={
                      <CollapsiblePanel.Header>
                        <FormattedMessage {...messages.titleBillingAddress} />
                      </CollapsiblePanel.Header>
                    }
                  >
                    <Constraints.Horizontal>
                      <Spacings.Stack>
                        {customer.addresses.length > 0 ? (
                          <CartCreateCustomerAddressesList
                            addressType={SHORT_ADDRESS_TYPE.BILLING}
                            customer={customer}
                            formik={formikProps}
                          />
                        ) : (
                          renderEmpty()
                        )}
                      </Spacings.Stack>
                    </Constraints.Horizontal>
                  </CollapsiblePanel>
                </Spacings.Stack>
              </Spacings.Stack>
            </PageContentNarrow>
            <SaveToolbar
              isVisible={true}
              buttonProps={{
                next: {
                  isDisabled:
                    !formikProps.isValid ||
                    !(
                      formikProps.values.shippingAddress !== undefined &&
                      formikProps.values.billingAddress !== undefined
                    ),
                },
              }}
              currentStep={currentStep}
              totalSteps={totalSteps}
              onNext={() => {
                formikProps.handleSubmit();
              }}
              onSave={() => {
                formikProps.handleSubmit();
              }}
              onBack={goToPreviousStep}
              onCancel={() => {
                history.replace({
                  pathname: linkToWelcome + '/carts',
                });
              }}
            />
          </>
        );
      }}
    </Formik>
  );
};

export default CartCreateCustomerAddresses;
