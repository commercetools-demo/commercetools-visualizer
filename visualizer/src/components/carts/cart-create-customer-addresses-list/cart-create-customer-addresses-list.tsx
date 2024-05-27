import { FC } from 'react';
import { TCustomer } from '../../../types/generated/ctp';
import { SHORT_ADDRESS_TYPE } from '../../../constants';
import CartCreateCustomerAddressForm from '../cart-create-customer-address-form';
import { Step3 } from '../cart-create/conversion';
import { FormikProps } from 'formik';

interface CartCreateCustomerAddressesListProps {
  addressType: SHORT_ADDRESS_TYPE;
  customer: TCustomer;
  formik: FormikProps<Step3>;
}

const CartCreateCustomerAddressesList: FC<
  CartCreateCustomerAddressesListProps
> = ({ addressType, customer, formik }) => {
  return (
    <>
      {customer.addresses.map((address) => (
        <CartCreateCustomerAddressForm
          key={address.id}
          address={address}
          addressType={addressType}
          customer={customer}
          formik={formik}
        />
      ))}
    </>
  );
};

export default CartCreateCustomerAddressesList;
