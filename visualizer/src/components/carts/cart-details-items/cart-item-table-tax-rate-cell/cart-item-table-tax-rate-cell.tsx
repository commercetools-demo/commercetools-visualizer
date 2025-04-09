import { useModalState } from '@commercetools-frontend/application-components';
import { NO_VALUE_FALLBACK } from '@commercetools-frontend/constants';

import messages from './messages';
import {
  TCustomLineItem,
  TLineItem,
  TShipping,
} from '../../../../types/generated/ctp';
import { FC } from 'react';
import {
  convertRatioToPercentage,
  formatPercentage,
  isLineItem,
} from '../../../../helpers';
import {
  filterPerMethodTaxRateByTarget,
  isTaxRateSameInMultiMode,
} from 'commercetools-demo-shared-cart-summary-pricing-breakdown';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import IconButton from '@commercetools-uikit/icon-button';
import { InformationIcon } from '@commercetools-uikit/icons';
import CartItemsTablePricingBreakdownPerTaxRate from '../cart-items-table-pricing-breakdown-per-tax-rate';

export const getNumberOfDecimals = (value: number) =>
  String(value).split('.')[1].length;

export const displayPercentage = (percentage: number) => {
  // If the value is an integer just return the formatted string
  if (Number.isInteger(percentage)) return formatPercentage(percentage);
  const numberOfDecimals = getNumberOfDecimals(percentage);

  // In case the percentage has more than 2 decimals we indicate with "..." that the value
  // is longer than the one that we display
  return numberOfDecimals > 2
    ? `${percentage.toFixed(2)}...%`
    : formatPercentage(percentage);
};

interface Props {
  currencySymbol: string;
  shipping?: Array<TShipping>;
  lineItem: TLineItem | TCustomLineItem;
}

export const CartItemTableTaxRateCell: FC<Props> = ({
  lineItem,
  currencySymbol,
  shipping,
}) => {
  const { openModal, isModalOpen, closeModal } = useModalState();

  if (isLineItem(lineItem) && lineItem.lineItemMode === 'GiftLineItem') {
    return <>{NO_VALUE_FALLBACK}</>;
  }

  if (lineItem.perMethodTaxRate?.length > 0) {
    const filteredPerMethodTaxRate = filterPerMethodTaxRateByTarget(lineItem);

    if (isTaxRateSameInMultiMode(lineItem)) {
      const taxRateAmount = filteredPerMethodTaxRate[0]?.taxRate?.amount;

      return taxRateAmount ? (
        <>{displayPercentage(convertRatioToPercentage(taxRateAmount))}</>
      ) : (
        <>{NO_VALUE_FALLBACK}</>
      );
    } else {
      return (
        <Spacings.Inline alignItems="center" justifyContent="flex-end">
          <Text.Detail intlMessage={messages.multipleTaxes} />
          <IconButton
            icon={<InformationIcon />}
            label="item pricing breakdown by tax rate"
            onClick={openModal}
            size="small"
          />
          <CartItemsTablePricingBreakdownPerTaxRate
            currencySymbol={currencySymbol}
            isOpen={isModalOpen}
            lineItem={lineItem}
            onClose={closeModal}
            shipping={shipping}
          />
        </Spacings.Inline>
      );
    }
  }

  const taxRateAmount = lineItem.taxRate?.amount;

  return taxRateAmount ? (
    <>{displayPercentage(convertRatioToPercentage(taxRateAmount))}</>
  ) : (
    <>{NO_VALUE_FALLBACK}</>
  );
};

export default CartItemTableTaxRateCell;
