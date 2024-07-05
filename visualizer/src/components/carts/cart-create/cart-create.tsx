import { FC, Fragment } from 'react';
import { useIntl } from 'react-intl';
import messages from './messages';
import { InfoDetailPage } from '@commercetools-frontend/application-components';
import { Route, useHistory, useParams } from 'react-router';
import Steps from '../../steps';
import { Switch } from 'react-router-dom';
import CartCreateSelectCurrency from '../cart-create-select-currency/cart-create-select-currency';
import CartCreateCustomerPick from '../cart-create-customer-pick/cart-create-customer-pick';
import CartCreateCustomerAddresses from '../cart-create-customer-addresses/cart-create-customer-addresses';
import CartCreatePickItems from '../cart-create-pick-items/cart-create-pick-items';
import CartConnector from '../cart-connector';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import CartCreateSetShippingMethod from '../cart-create-set-shipping-method';
import memoize from 'memoize-one';

export type StepProps = {
  currentStep: number;
  goToNextStep: (id?: string) => void;
  goToPreviousStep?: () => void;
  totalSteps: number;
  linkToWelcome: string;
};

type Props = {
  linkToWelcome: string;
};

export const CART_CREATE_TAB_NAMES = {
  CURRENCY: 'currency',
  CUSTOMER: 'customer',
  ADDRESS: 'address',
  ITEMS: 'items',
  SHIPPING: 'shipping',
  REVIEW: 'review',
};

export const createStepsDefinition = memoize((intl) => [
  {
    key: CART_CREATE_TAB_NAMES.CURRENCY,
    label: intl.formatMessage(messages.stepCurrency),
  },
  {
    key: CART_CREATE_TAB_NAMES.CUSTOMER,
    label: intl.formatMessage(messages.stepCustomer),
  },
  {
    key: CART_CREATE_TAB_NAMES.ADDRESS,
    label: intl.formatMessage(messages.stepAddress),
  },
  {
    key: CART_CREATE_TAB_NAMES.ITEMS,
    label: intl.formatMessage(messages.stepItems),
  },
  {
    key: CART_CREATE_TAB_NAMES.SHIPPING,
    label: intl.formatMessage(messages.stepShipping),
  },
  {
    key: CART_CREATE_TAB_NAMES.REVIEW,
    label: intl.formatMessage(messages.stepReview),
  },
]);

const CartCreate: FC<Props> = ({ linkToWelcome }) => {
  const intl = useIntl();
  const history = useHistory();

  const { step = CART_CREATE_TAB_NAMES.CURRENCY, id } = useParams<{
    step: string;
    id: string;
  }>();

  const stepsDefinition = createStepsDefinition(intl);

  const current = stepsDefinition.findIndex((item) => {
    return item.key === step;
  });

  return (
    <InfoDetailPage
      onPreviousPathClick={() => history.push(linkToWelcome + '/carts')}
      title={intl.formatMessage(messages.title)}
      subtitle={<Steps steps={stepsDefinition} activeStepKey={step} />}
    >
      <Switch>
        <Route exact path={linkToWelcome + '/carts/new'}>
          <CartCreateSelectCurrency
            currentStep={current + 1}
            goToNextStep={(newId) => {
              history.replace({
                pathname: `${linkToWelcome}/carts/new/${newId}/${
                  stepsDefinition[current + 1].key
                }`,
              });
            }}
            totalSteps={stepsDefinition.length}
            linkToWelcome={linkToWelcome}
          />
        </Route>
        <Route
          exact
          path={`${linkToWelcome}/carts/new/${id}/${CART_CREATE_TAB_NAMES.CURRENCY}`}
        >
          <CartConnector cartId={id}>
            {({ cartFetcher }) =>
              cartFetcher.isLoading ? (
                <LoadingSpinner />
              ) : (
                <Fragment>
                  {cartFetcher.cart && (
                    <CartCreateSelectCurrency
                      currentStep={current + 1}
                      goToNextStep={() => {
                        history.replace({
                          pathname: `${linkToWelcome}/carts/new/${id}/${
                            stepsDefinition[current + 1].key
                          }`,
                        });
                      }}
                      cart={cartFetcher.cart}
                      totalSteps={stepsDefinition.length}
                      linkToWelcome={linkToWelcome}
                    />
                  )}
                </Fragment>
              )
            }
          </CartConnector>
        </Route>
        <Route
          exact
          path={`${linkToWelcome}/carts/new/${id}/${CART_CREATE_TAB_NAMES.CUSTOMER}`}
        >
          <CartConnector cartId={id}>
            {({ cartFetcher }) =>
              cartFetcher.isLoading ? (
                <LoadingSpinner />
              ) : (
                <Fragment>
                  {cartFetcher.cart && (
                    <CartCreateCustomerPick
                      currentStep={current + 1}
                      goToNextStep={() => {
                        history.replace({
                          pathname: `${linkToWelcome}/carts/new/${id}/${
                            stepsDefinition[current + 1].key
                          }`,
                        });
                      }}
                      goToPreviousStep={() => {
                        history.replace({
                          pathname: `${linkToWelcome}/carts/new/${id}/${
                            stepsDefinition[current - 1].key
                          }`,
                        });
                      }}
                      totalSteps={stepsDefinition.length}
                      linkToWelcome={linkToWelcome}
                      cart={cartFetcher.cart}
                    />
                  )}
                </Fragment>
              )
            }
          </CartConnector>
        </Route>
        <Route
          exact
          path={`${linkToWelcome}/carts/new/${id}/${CART_CREATE_TAB_NAMES.ADDRESS}`}
        >
          <CartConnector cartId={id}>
            {({ cartFetcher }) =>
              cartFetcher.isLoading ? (
                <LoadingSpinner />
              ) : (
                <Fragment>
                  {cartFetcher.cart && (
                    <CartCreateCustomerAddresses
                      currentStep={current + 1}
                      goToNextStep={() => {
                        history.replace({
                          pathname: `${linkToWelcome}/carts/new/${id}/${
                            stepsDefinition[current + 1].key
                          }`,
                        });
                      }}
                      goToPreviousStep={() => {
                        history.replace({
                          pathname: `${linkToWelcome}/carts/new/${id}/${
                            stepsDefinition[current - 1].key
                          }`,
                        });
                      }}
                      totalSteps={stepsDefinition.length}
                      linkToWelcome={linkToWelcome}
                      cart={cartFetcher.cart}
                    />
                  )}
                </Fragment>
              )
            }
          </CartConnector>
        </Route>
        <Route
          exact
          path={`${linkToWelcome}/carts/new/${id}/${CART_CREATE_TAB_NAMES.ITEMS}`}
        >
          <CartConnector cartId={id}>
            {({ cartFetcher }) =>
              cartFetcher.isLoading ? (
                <LoadingSpinner />
              ) : (
                <Fragment>
                  {cartFetcher.cart && (
                    <CartCreatePickItems
                      currentStep={current + 1}
                      goToNextStep={() => {
                        history.replace({
                          pathname: `${linkToWelcome}/carts/new/${id}/${
                            stepsDefinition[current + 1].key
                          }`,
                        });
                      }}
                      goToPreviousStep={() => {
                        history.replace({
                          pathname: `${linkToWelcome}/carts/new/${id}/${
                            stepsDefinition[current - 1].key
                          }`,
                        });
                      }}
                      totalSteps={stepsDefinition.length}
                      linkToWelcome={linkToWelcome}
                      cart={cartFetcher.cart}
                    />
                  )}
                </Fragment>
              )
            }
          </CartConnector>
        </Route>
        <Route
          exact
          path={`${linkToWelcome}/carts/new/${id}/${CART_CREATE_TAB_NAMES.SHIPPING}`}
        >
          <CartConnector cartId={id}>
            {({ cartFetcher }) =>
              cartFetcher.isLoading ? (
                <LoadingSpinner />
              ) : (
                <Fragment>
                  {cartFetcher.cart && (
                    <CartCreateSetShippingMethod
                      currentStep={current + 1}
                      goToNextStep={() => {
                        history.replace({
                          pathname: `${linkToWelcome}/carts/new/${id}/${
                            stepsDefinition[current + 1].key
                          }`,
                        });
                      }}
                      goToPreviousStep={() => {
                        history.replace({
                          pathname: `${linkToWelcome}/carts/new/${id}/${
                            stepsDefinition[current - 1].key
                          }`,
                        });
                      }}
                      totalSteps={stepsDefinition.length}
                      linkToWelcome={linkToWelcome}
                      cart={cartFetcher.cart}
                    />
                  )}
                </Fragment>
              )
            }
          </CartConnector>
        </Route>
      </Switch>
    </InfoDetailPage>
  );
};

export default CartCreate;
