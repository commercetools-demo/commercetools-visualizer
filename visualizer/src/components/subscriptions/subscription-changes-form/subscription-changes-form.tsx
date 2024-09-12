import Grid from '@commercetools-uikit/grid';
import { designTokens } from '@commercetools-uikit/design-system';
import Constraints from '@commercetools-uikit/constraints';
import Card from '@commercetools-uikit/card';
import CheckboxGroup from '../../checkbox/CheckboxGroup';
import { TChangeSubscriptionInput } from '../../../types/generated/ctp';
import messages from './messages';
import { IntlShape, useIntl } from 'react-intl';
import { FC } from 'react';

const possibilities = (intl: IntlShape) => {
  return [
    {
      key: 'discount-code',
      value: intl.formatMessage(messages['discount-code']),
    },
    { key: 'extension', value: intl.formatMessage(messages['extension']) },
    {
      key: 'inventory-entry',
      value: intl.formatMessage(messages['inventory-entry']),
    },
    {
      key: 'key-value-document',
      value: intl.formatMessage(messages['key-value-document']),
    },
    { key: 'order', value: intl.formatMessage(messages['order']) },
    { key: 'order-edit', value: intl.formatMessage(messages['order-edit']) },
    { key: 'payment', value: intl.formatMessage(messages['payment']) },
    { key: 'product', value: intl.formatMessage(messages['product']) },
    {
      key: 'product-discount',
      value: intl.formatMessage(messages['product-discount']),
    },
    {
      key: 'product-price',
      value: intl.formatMessage(messages['product-price']),
    },
    {
      key: 'product-selection',
      value: intl.formatMessage(messages['product-selection']),
    },
    {
      key: 'product-type',
      value: intl.formatMessage(messages['product-type']),
    },
    { key: 'quote', value: intl.formatMessage(messages['quote']) },
    {
      key: 'quote-request',
      value: intl.formatMessage(messages['quote-request']),
    },
    { key: 'review', value: intl.formatMessage(messages['review']) },
    {
      key: 'shipping-method',
      value: intl.formatMessage(messages['shipping-method']),
    },
    {
      key: 'shopping-list',
      value: intl.formatMessage(messages['shopping-list']),
    },
    {
      key: 'staged-quote',
      value: intl.formatMessage(messages['staged-quote']),
    },
    {
      key: 'standalone-price',
      value: intl.formatMessage(messages['standalone-price']),
    },
    { key: 'state', value: intl.formatMessage(messages['state']) },
    { key: 'store', value: intl.formatMessage(messages['store']) },
    {
      key: 'subscription',
      value: intl.formatMessage(messages['subscription']),
    },
    {
      key: 'tax-category',
      value: intl.formatMessage(messages['tax-category']),
    },
    { key: 'type', value: intl.formatMessage(messages['type']) },
    { key: 'zone', value: intl.formatMessage(messages['zone']) },
  ];
};

type Props = {
  isReadOnly?: boolean;
};
const SubscriptionChangesForm: FC<Props> = ({ isReadOnly }) => {
  const intl = useIntl();

  const isChecked = (
    values: Array<TChangeSubscriptionInput> | undefined,
    value: string
  ) => {
    return Boolean(
      values && values.find((item) => item.resourceTypeId === value)
    );
  };

  const addItem = (
    values: Array<TChangeSubscriptionInput> | undefined,
    value: string
  ) => {
    const toAdd: TChangeSubscriptionInput = {
      resourceTypeId: value,
    };
    if (values) {
      return [...values, toAdd];
    } else {
      return [toAdd];
    }
  };

  const removeItem = (
    values: Array<TChangeSubscriptionInput> | undefined,
    value: string
  ) => {
    return values
      ? values.filter((item) => {
          const toRemove: TChangeSubscriptionInput = item as any;
          return toRemove.resourceTypeId !== value;
        })
      : [];
  };
  return (
    <Constraints.Horizontal max="scale">
      <Grid
        gridGap={designTokens.spacing50}
        gridTemplateColumns={`repeat(auto-fill, '')`}
      >
        <Grid.Item>
          <Constraints.Horizontal max="scale">
            <Card insetScale="s" type="flat">
              <CheckboxGroup
                name="changes"
                label="Choose Changes you want to listen to."
              >
                {possibilities(intl).map((entry, index) => {
                  return (
                    <CheckboxGroup.Item
                      key={index}
                      label={entry.value}
                      value={entry.key}
                      isChecked={isChecked}
                      addItem={addItem}
                      removeItem={removeItem}
                      isReadOnly={isReadOnly}
                    />
                  );
                })}
              </CheckboxGroup>
            </Card>
          </Constraints.Horizontal>
        </Grid.Item>
      </Grid>
    </Constraints.Horizontal>
  );
};
export default SubscriptionChangesForm;
