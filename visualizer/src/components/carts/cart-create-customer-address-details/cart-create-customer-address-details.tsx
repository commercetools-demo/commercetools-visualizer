import { FC } from 'react';
import { FormattedMessage } from 'react-intl';

import messages from './messages';
import TextField from '@commercetools-uikit/text-field';
import Spacings from '@commercetools-uikit/spacings';
import Constraints from '@commercetools-uikit/constraints';
import MultilineTextField from '@commercetools-uikit/multiline-text-field';
import { TAddress } from '../../../types/generated/ctp';

interface Props {
  address: TAddress;
}

const CartCreateCustomerAddressDetails: FC<Props> = ({ address }) => {
  const renderMultiLineAttributes = (attributes: Array<string>) =>
    attributes.map((attribute) => {
      return (
        <Constraints.Horizontal key={attribute} max="scale">
          <MultilineTextField
            isDisabled={true}
            name={attribute}
            // @ts-ignore
            title={<FormattedMessage {...messages[`${attribute}Label`]} />}
            value={(address[attribute as keyof TAddress] as string) || ''}
            onChange={() => {}}
          />
        </Constraints.Horizontal>
      );
    });

  const renderAttributes = (attributes: Array<string>) =>
    attributes.map((attribute) => {
      return (
        <Constraints.Horizontal key={attribute} max="scale">
          <TextField
            isDisabled={true}
            name={attribute}
            title={
              <FormattedMessage
                // @ts-ignore
                {...messages[`${attribute as keyof TAddress}Label`]}
              />
            }
            value={(address[attribute as keyof TAddress] as string) || ''}
            onChange={() => {}}
          />
        </Constraints.Horizontal>
      );
    });

  return (
    <Spacings.Stack scale="l">
      <Spacings.Stack scale="xl">
        <Spacings.Inline scale="m">
          {renderAttributes(['firstName', 'lastName'])}
        </Spacings.Inline>
        {renderAttributes(['phone'])}
        {renderAttributes(['email'])}
        {renderAttributes(['company'])}
        <Spacings.Inline scale="m">
          {renderAttributes(['streetName', 'streetNumber'])}
        </Spacings.Inline>
        <Spacings.Inline scale="m">
          {renderAttributes(['apartment', 'city'])}
        </Spacings.Inline>
        <Spacings.Inline scale="m">
          {renderAttributes(['postalCode', 'region'])}
        </Spacings.Inline>
        <Spacings.Inline scale="m">
          {renderAttributes(['state', 'country'])}
        </Spacings.Inline>
        {renderMultiLineAttributes(['additionalAddressInfo'])}
        {renderMultiLineAttributes(['additionalStreetInfo'])}
      </Spacings.Stack>
    </Spacings.Stack>
  );
};

export default CartCreateCustomerAddressDetails;
