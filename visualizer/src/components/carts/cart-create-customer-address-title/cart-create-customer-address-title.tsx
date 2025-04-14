import { FC } from 'react';
import formatCustomerName from '../../../utils/format-customer-name';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import { PaperBillInvertedIcon, TruckIcon } from '@commercetools-uikit/icons';
import { TAddress, TCustomer } from '../../../types/generated/ctp';
import RadioInput from '@commercetools-uikit/radio-input';
import { SHORT_ADDRESS_TYPE } from '../../../constants';
import { FormikProps } from 'formik';
import { Step3 } from '../cart-create/conversion';
import { formatAddress } from 'commercetools-demo-shared-helpers';

interface Props {
  type: SHORT_ADDRESS_TYPE;
  address: TAddress;
  customer: TCustomer;
  onSelectAddress: (type: SHORT_ADDRESS_TYPE, id: TAddress['id']) => void;
  isDisabled?: boolean;
  formik: FormikProps<Step3>;
}
const CartCreateCustomerAddressTitle: FC<Props> = ({
  type,
  address,
  customer,
  onSelectAddress,
  formik,
}) => (
  <Spacings.Inline alignItems="center">
    <RadioInput.Option
      isChecked={
        type === 'shipping'
          ? address?.id === formik.values.shippingAddress?.id
          : address?.id === formik.values.billingAddress?.id
      }
      onChange={() => onSelectAddress(type, address.id)}
      value={`${address?.id}-checkbox`}
    >
      {''}
    </RadioInput.Option>
    {address?.firstName && address.lastName && (
      <Text.Body fontWeight={'bold'}>{formatCustomerName(address)}</Text.Body>
    )}
    <Text.Detail tone="secondary">{formatAddress(address) || ' '}</Text.Detail>
    {address?.id === customer.defaultBillingAddressId && (
      <PaperBillInvertedIcon color="info" size="medium" />
    )}
    {address?.id === customer.defaultShippingAddressId && (
      <TruckIcon color="info" size="medium" />
    )}
  </Spacings.Inline>
);

export default CartCreateCustomerAddressTitle;
