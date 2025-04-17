import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import Stamp, { TTone } from '@commercetools-uikit/stamp';

interface FacetedFilterStatusProps {
  tone: TTone;
  label?: string;
  amount?: number;
  isDisabled?: boolean;
}

const FacetedFilterStatus = ({
  tone,
  label,
  amount,
  isDisabled,
}: FacetedFilterStatusProps) => {
  return (
    <Spacings.Inline alignItems="center">
      <Stamp isCondensed tone={tone} label={label} />
      {amount && (
        <Text.Detail tone={isDisabled ? 'secondary' : 'inherit'}>
          <span>{`(${amount})`}</span>
        </Text.Detail>
      )}
    </Spacings.Inline>
  );
};

export default FacetedFilterStatus;
