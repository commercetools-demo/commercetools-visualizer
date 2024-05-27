import { FC, useRef } from 'react';
import { FormikProps } from 'formik';
import { TAddress, TCustomer } from '../../../types/generated/ctp';
import { SHORT_ADDRESS_TYPE } from '../../../constants';
import SelectablePanel from '../selectable-panel';
import CartCreateCustomerAddressTitle from '../cart-create-customer-address-title';
import CartCreateCustomerAddressDetails from '../cart-create-customer-address-details';
import { Step3 } from '../cart-create/conversion';

interface Props {
  address: TAddress;
  customer: TCustomer;
  addressType: SHORT_ADDRESS_TYPE;
  formik: FormikProps<Step3>;
}

const CartCreateCustomerAddressForm: FC<Props> = ({
  address,
  addressType,
  customer,
  formik,
}) => {
  const panelRef = useRef(null);

  const addressDraftId =
    addressType === SHORT_ADDRESS_TYPE.SHIPPING
      ? formik.values.shippingAddress?.id
      : formik.values.billingAddress?.id;

  return (
    <form ref={panelRef}>
      <SelectablePanel
        header={
          <CartCreateCustomerAddressTitle
            address={address}
            customer={customer}
            isDisabled={false}
            onSelectAddress={() => {
              formik.setFieldValue(addressType + 'Address', address);
            }}
            formik={formik}
            type={addressType}
          />
        }
        isOpen={addressDraftId === address.id}
      >
        <CartCreateCustomerAddressDetails address={address} />
      </SelectablePanel>
    </form>
  );
};

export default CartCreateCustomerAddressForm;
