import { FC } from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import {
  TabularMainPage,
  TabHeader,
} from '@commercetools-frontend/application-components';
import {
  CART_CREATE_TAB_NAMES,
  createStepsDefinition,
} from '../cart-create/cart-create';
import { useIntl } from 'react-intl';

type Props = {};

export const CartEdit: FC<Props> = ({}) => {
  const match = useRouteMatch();
  const intl = useIntl();

  return (
    <TabularMainPage
      title="Main page"
      tabControls={createStepsDefinition(intl).map((entry, index) => {
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
          1
        </Route>
        <Route path={`${match.path}/${CART_CREATE_TAB_NAMES.CUSTOMER}`}>
          2
        </Route>
        <Route path={`${match.path}/${CART_CREATE_TAB_NAMES.ADDRESS}`}>3</Route>
        <Route path={`${match.path}/${CART_CREATE_TAB_NAMES.ITEMS}`}>4</Route>
        <Route path={`${match.path}/${CART_CREATE_TAB_NAMES.SHIPPING}`}>
          5
        </Route>
        <Route path={`${match.path}/${CART_CREATE_TAB_NAMES.REVIEW}`}>6</Route>
      </Switch>
    </TabularMainPage>
  );
};

export default CartEdit;
