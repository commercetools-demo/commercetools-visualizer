import { FC } from 'react';

import { useCartFetcher } from '../../hooks/use-carts-hook';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { TCart } from '../../types/generated/ctp';

interface OrderCreateCustomerConnectorProps {
  children: (formProps: {
    cartFetcher: { isLoading: boolean; cart: TCart | undefined | null };
  }) => React.JSX.Element;
  cartId?: string;
}

export const CartConnector: FC<OrderCreateCustomerConnectorProps> = ({
  children,
  cartId,
}) => {
  const { dataLocale } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
  }));
  const { cart, loading } = useCartFetcher({
    id: cartId || '',
    locale: dataLocale,
  });

  return children({
    cartFetcher: {
      isLoading: loading,
      cart: cart,
    },
  });
};

export default CartConnector;
