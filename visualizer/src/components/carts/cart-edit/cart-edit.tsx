import { FC } from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import {
  TabularMainPage,
  TabHeader,
  PageNotFound,
} from '@commercetools-frontend/application-components';
import {
  CART_CREATE_TAB_NAMES,
  createStepsDefinition,
} from '../cart-create/cart-create';
import { useIntl } from 'react-intl';
import CartCreateSelectCurrency from '../cart-create-select-currency/cart-create-select-currency';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import { useParams } from 'react-router';
import CartCreateCustomerPick from '../cart-create-customer-pick/cart-create-customer-pick';
import CartCreateCustomerAddresses from '../cart-create-customer-addresses/cart-create-customer-addresses';
import { useCartFetcher } from 'commercetools-demo-shared-data-fetching-hooks';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { ContentNotification } from '@commercetools-uikit/notifications';
import Text from '@commercetools-uikit/text';
import { getErrorMessage } from '../../../helpers';
import Spacings from '@commercetools-uikit/spacings';
import CartCreatePickItems from '../cart-create-pick-items/cart-create-pick-items';
import CartCreateSetShippingMethod from '../cart-create-set-shipping-method';

type Props = {
  linkToWelcome: string;
};

export const CartEdit: FC<Props> = ({ linkToWelcome }) => {
  const match = useRouteMatch();
  const intl = useIntl();

  const { id } = useParams<{
    id: string;
  }>();

  const { dataLocale } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
  }));

  const { cart, loading, error } = useCartFetcher({
    id: id || '',
    locale: dataLocale,
  });

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
  if (!cart) {
    return <PageNotFound />;
  }

  const stepsDefinition = createStepsDefinition(intl).slice(
    undefined,
    createStepsDefinition.length - 1
  );

  return (
    <TabularMainPage
      title={`Update cart (${cart?.id})`}
      tabControls={stepsDefinition.map((entry, index) => {
        return (
          <TabHeader
            key={entry.key}
            to={`${match.url}${index === 0 ? '' : '/' + entry.key}`}
            label={entry.label}
            exactPathMatch={true}
          />
        );
      })}
    >
      <Switch>
        <Route
          path={[match.path, `${match.path}/${CART_CREATE_TAB_NAMES.CURRENCY}`]}
          exact={true}
        >
          <CartCreateSelectCurrency
            currentStep={1}
            cart={cart}
            totalSteps={1}
            linkToWelcome={linkToWelcome}
          />
        </Route>
        <Route path={`${match.path}/${CART_CREATE_TAB_NAMES.CUSTOMER}`}>
          <CartCreateCustomerPick
            currentStep={1}
            cart={cart}
            totalSteps={1}
            linkToWelcome={linkToWelcome}
          />
        </Route>
        <Route path={`${match.path}/${CART_CREATE_TAB_NAMES.ADDRESS}`}>
          <CartCreateCustomerAddresses
            currentStep={1}
            totalSteps={1}
            linkToWelcome={linkToWelcome}
            cart={cart}
          />
        </Route>
        <Route path={`${match.path}/${CART_CREATE_TAB_NAMES.ITEMS}`}>
          <CartCreatePickItems
            currentStep={1}
            totalSteps={1}
            linkToWelcome={linkToWelcome}
            cart={cart}
          />
        </Route>
        <Route path={`${match.path}/${CART_CREATE_TAB_NAMES.SHIPPING}`}>
          <CartCreateSetShippingMethod
            currentStep={1}
            totalSteps={1}
            linkToWelcome={linkToWelcome}
            cart={cart}
          />
        </Route>
        <Route path={`${match.path}/${CART_CREATE_TAB_NAMES.REVIEW}`}>6</Route>
      </Switch>
    </TabularMainPage>
  );
};

export default CartEdit;
