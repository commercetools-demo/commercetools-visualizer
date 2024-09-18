import { FC, useMemo } from 'react';
import memoize from 'memoize-one';
import { useIntl } from 'react-intl';
import { NO_VALUE_FALLBACK } from '@commercetools-frontend/constants';
import messages from './messages';
import { formatMoney, notEmpty } from '../../../helpers';
import IconButton from '@commercetools-uikit/icon-button';
import { BinFilledIcon } from '@commercetools-uikit/icons';
import CollapsiblePanel from '@commercetools-uikit/collapsible-panel';
import DataTable, { TColumn } from '@commercetools-uikit/data-table';
import Constraints from '@commercetools-uikit/constraints';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import CartAddDiscountCode from '../cart-add-discount-code';
import { TBaseMoney, TCart, TDiscountCode } from '../../../types/generated/ctp';
import {
  selectDiscounts,
  selectDiscountsOnTotalPrice,
  selectShippingDiscounts,
} from '../../../utils/cart-selectors';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';

export const MISSING_DISCOUNT_CODE = 'missingDiscountCode';
export const OUTDATED_DISCOUNT_CODE = 'outdatedDiscountCode';

const createAppliedDiscountsColumnsDefinition = memoize(
  (intl): Array<TColumn> => [
    {
      key: 'name',
      label: intl.formatMessage(messages.discountName),
    },
    {
      key: 'amount',
      label: intl.formatMessage(messages.amount),
      align: 'right',
    },
    {
      key: 'discountCodes',
      label: intl.formatMessage(messages.discountCodes),
    },
  ]
);

const createDiscountCodesColumnsDefinition = memoize((intl) => [
  {
    key: 'code',
    label: intl.formatMessage(messages.code),
  },
  {
    key: 'name',
    label: intl.formatMessage(messages.name),
  },
  {
    key: 'actions',
    label: '',
    width: 'min-content',
  },
]);

export interface Discount {
  id: string;
  name: Record<string, string>;
  amount: TBaseMoney;
  discountCodes: string[];
}
interface Error {
  code?: string;
  extensions?: {
    code?: string;
  };
}

interface Props {
  onApplyDiscountCode: (code: string) => Promise<boolean>;
  onRemoveDiscountCode: (id: string) => void;
  cart: TCart;
  resetErrors?: (...args: unknown[]) => unknown;
  errors?: Array<Error>;
}

const CartAppliedDiscountsPanel: FC<Props> = ({
  cart,
  errors,
  onRemoveDiscountCode,
  onApplyDiscountCode,
  resetErrors,
}) => {
  const intl = useIntl();
  const { dataLocale } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
  }));

  const discounts = [
    ...selectDiscounts(cart),
    ...selectShippingDiscounts(cart),
    ...selectDiscountsOnTotalPrice(cart),
  ];

  const renderDiscountItem = (
    discount: Discount,
    column: TColumn<Discount>
  ) => {
    switch (column.key) {
      case 'name':
        return discount.name[dataLocale] || NO_VALUE_FALLBACK;
      case 'amount':
        return formatMoney(discount.amount, intl, {
          minimumFractionDigits: undefined,
        });
      case 'discountCodes':
        return discount.discountCodes.length === 0
          ? NO_VALUE_FALLBACK
          : discount.discountCodes.join(', ');
      default:
        return undefined;
    }
  };

  const renderDiscountCodeItem = (
    discountCode: TDiscountCode,
    column: TColumn<TDiscountCode>
  ) => {
    switch (column.key) {
      case 'name':
        return discountCode.name;
      case 'code':
        return discountCode.code;
      case 'actions':
        return (
          <IconButton
            icon={<BinFilledIcon />}
            label={intl.formatMessage(messages.removeDiscountCodeLabel)}
            onClick={() => onRemoveDiscountCode(discountCode.id)}
            size="medium"
          />
        );
      default:
        return undefined;
    }
  };

  const getErrorByCodes = (codes: Array<string>, errors?: Array<Error>) =>
    errors &&
    errors.find((error) => {
      return (
        error?.extensions?.code ||
        (error.code && codes.includes(error?.extensions?.code ?? error.code))
      );
    });

  const discountCodes = useMemo(
    () =>
      cart.discountCodes
        .map(({ discountCode }) => {
          if (!discountCode) {
            return undefined;
          }
          return {
            ...discountCode,
            id: discountCode?.id || '',
          };
        })
        .filter(notEmpty),
    [cart.discountCodes]
  );

  return (
    <CollapsiblePanel
      condensed
      header={intl.formatMessage(messages.title)}
      theme="light"
    >
      <Constraints.Horizontal>
        <Spacings.Inset scale="s">
          <Spacings.Stack scale="m">
            {discounts.length > 0 ? (
              <DataTable
                columns={createAppliedDiscountsColumnsDefinition(intl)}
                itemRenderer={renderDiscountItem}
                rows={discounts}
              />
            ) : (
              <Text.Detail intlMessage={messages.noDiscounts} isBold={true} />
            )}
            <Spacings.Stack>
              <CartAddDiscountCode
                error={getErrorByCodes(
                  [MISSING_DISCOUNT_CODE, OUTDATED_DISCOUNT_CODE],
                  errors
                )}
                onApplyDiscountCode={onApplyDiscountCode}
                resetErrors={resetErrors}
              />
              {discountCodes.length > 0 && (
                <DataTable
                  columns={createDiscountCodesColumnsDefinition(intl)}
                  itemRenderer={renderDiscountCodeItem}
                  rows={discountCodes}
                  verticalCellAlignment="center"
                />
              )}
            </Spacings.Stack>
          </Spacings.Stack>
        </Spacings.Inset>
      </Constraints.Horizontal>
    </CollapsiblePanel>
  );
};

CartAppliedDiscountsPanel.displayName = 'CartAppliedDiscountsPanel';
CartAppliedDiscountsPanel.defaultProps = {
  errors: [],
  resetErrors: () => null,
};

export default CartAppliedDiscountsPanel;
