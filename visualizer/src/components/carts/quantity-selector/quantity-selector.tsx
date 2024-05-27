import { useState, FC } from 'react';
import { useIntl } from 'react-intl';
import messages from './messages';
import PrimaryButton from '@commercetools-uikit/primary-button';
import Spacings from '@commercetools-uikit/spacings';
import Constraints from '@commercetools-uikit/constraints';
import NumberInput, {
  TNumberInputProps,
} from '@commercetools-uikit/number-input';

interface Props {
  onChange: (quantity: number) => void;
  quantity?: number;
  handleCurrentInput?: () => void;
}

const QuantitySelector: FC<Props> = ({ quantity = 1, onChange }) => {
  const intl = useIntl();

  const [numberValue, setNumberValue] = useState<number | ''>(quantity);

  const handleNumericInputChange: TNumberInputProps['onChange'] = (event) => {
    setNumberValue(parseFloat(event.target.value));
  };

  const handleApplyNumericInputChange = () => {
    numberValue && onChange(numberValue);
  };
  return (
    <Spacings.Inline alignItems="center">
      <Constraints.Horizontal max="scale">
        <NumberInput
          onChange={handleNumericInputChange}
          value={numberValue || ''}
        />
      </Constraints.Horizontal>
      <PrimaryButton
        isDisabled={
          numberValue === '' || !numberValue || numberValue === quantity
        }
        label={intl.formatMessage(messages.apply)}
        onClick={handleApplyNumericInputChange}
      />
    </Spacings.Inline>
  );
};

export default QuantitySelector;
