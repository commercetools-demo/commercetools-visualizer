import { FC, useState } from 'react';
import { useIntl } from 'react-intl';

import messages from './messages';
import { PlusBoldIcon } from '@commercetools-uikit/icons';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import TextField from '@commercetools-uikit/text-field';
import Spacings from '@commercetools-uikit/spacings';
import { TTextFieldProps } from '@commercetools-uikit/text-field/dist/declarations/src/text-field';

interface Props {
  isDisabled?: boolean;
  onApplyDiscountCode: (code: string) => Promise<boolean>;
  resetErrors?: (...args: unknown[]) => unknown;
  error?: {
    code?: string;
  };
}

const CartAddDiscountCode: FC<Props> = ({
  onApplyDiscountCode = () => Promise.resolve(),
  resetErrors = () => null,
  error,
  isDisabled,
}) => {
  const intl = useIntl();

  const [codeValue, setCodeValue] = useState('');

  const handleInputChange: TTextFieldProps['onChange'] = (event) => {
    setCodeValue(event.target.value);
    if (error && resetErrors) resetErrors();
  };

  const handleApplyDiscountCode = () => {
    onApplyDiscountCode(codeValue).then(
      // clear the field only if there are no errors returned from the server
      (res) => {
        if (res) setCodeValue('');
      }
    );
  };

  const renderError = (key: string) =>
    // @ts-ignore
    messages[key] ? intl.formatMessage(messages[key]) : null;

  const getError = (error: any) => {
    const errorCode = error?.extensions?.code ?? error?.code;
    return errorCode ? { [errorCode]: true } : {};
  };

  return (
    <Spacings.Inline alignItems="flex-end">
      <TextField
        // should be true to display errors
        errors={getError(error)}
        horizontalConstraint={7}
        isDisabled={isDisabled}
        name="add-discount-code"
        onChange={handleInputChange}
        renderError={renderError}
        title={intl.formatMessage(messages.addDiscountCodeLabel)}
        touched={Boolean(error)}
        value={codeValue}
      />
      <SecondaryButton
        iconLeft={<PlusBoldIcon />}
        isDisabled={codeValue === '' || isDisabled}
        label={intl.formatMessage(messages.applyLabel)}
        onClick={handleApplyDiscountCode}
        type="submit"
      />
    </Spacings.Inline>
  );
};

export default CartAddDiscountCode;
