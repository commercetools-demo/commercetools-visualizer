import memoize from 'memoize-one';
import messages from './messages';
import { TColumn } from '@commercetools-uikit/data-table';

export default memoize(
  (intl): Array<TColumn> => [
    {
      key: 'check',
      label: '',
      width: 'min-content',
    },
    {
      key: 'name',
      label: intl.formatMessage(messages.shippingMethodNameColumn),
    },
    {
      key: 'shippingRate',
      label: intl.formatMessage(messages.shippingMethodRateColumn),
      align: 'right',
    },
    {
      key: 'taxCategory',
      label: intl.formatMessage(messages.shippingMethodTaxCategoryColumn),
    },
    {
      key: 'freeAbove',
      label: intl.formatMessage(messages.shippingMethodFreeAboveColumn),
      align: 'right',
    },
    {
      key: 'isDefault',
      label: intl.formatMessage(messages.shippingMethodIsDefaultColumn),
    },
    {
      key: 'description',
      label: intl.formatMessage(messages.shippingMethodDescriptionColumn),
    },
  ]
);
