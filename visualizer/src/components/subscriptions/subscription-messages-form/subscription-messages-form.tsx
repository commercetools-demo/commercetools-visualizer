import Grid from '@commercetools-uikit/grid';
import { customProperties } from '@commercetools-uikit/design-system';
import Constraints from '@commercetools-uikit/constraints';
import Card from '@commercetools-uikit/card';
import CheckboxGroup from '../../checkbox/CheckboxGroup';
import { TMessageSubscriptionInput } from '../../../types/generated/ctp';
import messages from './messages';
import { IntlShape, useIntl } from 'react-intl';
import Text from '@commercetools-uikit/text';
import Spacings from '@commercetools-uikit/spacings';

const entries = (intl: IntlShape) => {
  return [
    {
      resourceTypeId: 'business-unit',
      label: intl.formatMessage(messages['resourceTypeId.business-unit']),
      types: [
        {
          key: 'BusinessUnitAddressAdded',
          value: intl.formatMessage(messages.BusinessUnitAddressAdded),
        },
        {
          key: 'BusinessUnitAddressChanged',
          value: intl.formatMessage(messages.BusinessUnitAddressChanged),
        },
        {
          key: 'BusinessUnitAddressRemoved',
          value: intl.formatMessage(messages.BusinessUnitAddressRemoved),
        },
        {
          key: 'BusinessUnitAssociateAdded',
          value: intl.formatMessage(messages.BusinessUnitAssociateAdded),
        },
        {
          key: 'BusinessUnitAssociateChanged',
          value: intl.formatMessage(messages.BusinessUnitAssociateChanged),
        },
        {
          key: 'BusinessUnitAssociateRemoved',
          value: intl.formatMessage(messages.BusinessUnitAssociateRemoved),
        },
        {
          key: 'BusinessUnitAssociatesSet',
          value: intl.formatMessage(messages.BusinessUnitAssociatesSet),
        },
        {
          key: 'BusinessUnitBillingAddressAdded',
          value: intl.formatMessage(messages.BusinessUnitBillingAddressAdded),
        },
        {
          key: 'BusinessUnitBillingAddressRemoved',
          value: intl.formatMessage(messages.BusinessUnitBillingAddressRemoved),
        },
        {
          key: 'BusinessUnitContactEmailSet',
          value: intl.formatMessage(messages.BusinessUnitContactEmailSet),
        },
        {
          key: 'BusinessUnitCreated',
          value: intl.formatMessage(messages.BusinessUnitCreated),
        },
        {
          key: 'BusinessUnitDefaultBillingAddressSet',
          value: intl.formatMessage(
            messages.BusinessUnitDefaultBillingAddressSet
          ),
        },
        {
          key: 'BusinessUnitDefaultShippingAddressSet',
          value: intl.formatMessage(
            messages.BusinessUnitDefaultShippingAddressSet
          ),
        },
        {
          key: 'BusinessUnitDeleted',
          value: intl.formatMessage(messages.BusinessUnitDeleted),
        },
        {
          key: 'BusinessUnitNameChanged',
          value: intl.formatMessage(messages.BusinessUnitNameChanged),
        },
        {
          key: 'BusinessUnitShippingAddressAdded',
          value: intl.formatMessage(messages.BusinessUnitShippingAddressAdded),
        },
        {
          key: 'BusinessUnitShippingAddressRemoved',
          value: intl.formatMessage(
            messages.BusinessUnitShippingAddressRemoved
          ),
        },
        {
          key: 'BusinessUnitStatusChanged',
          value: intl.formatMessage(messages.BusinessUnitStatusChanged),
        },
        {
          key: 'BusinessUnitStoreAdded',
          value: intl.formatMessage(messages.BusinessUnitStoreAdded),
        },
        {
          key: 'BusinessUnitStoreModeChanged',
          value: intl.formatMessage(messages.BusinessUnitStoreModeChanged),
        },
        {
          key: 'BusinessUnitStoreRemoved',
          value: intl.formatMessage(messages.BusinessUnitStoreRemoved),
        },
        {
          key: 'BusinessUnitStoresSet',
          value: intl.formatMessage(messages.BusinessUnitStoresSet),
        },
      ],
    },

    {
      resourceTypeId: 'category',
      label: intl.formatMessage(messages['resourceTypeId.category']),
      types: [
        {
          key: 'CategoryCreated',
          value: intl.formatMessage(messages.CategoryCreated),
        },
        {
          key: 'CategorySlugChanged',
          value: intl.formatMessage(messages.CategorySlugChanged),
        },
      ],
    },

    {
      resourceTypeId: 'customer',
      label: intl.formatMessage(messages['resourceTypeId.customer']),
      types: [
        {
          key: 'CustomerAddressAdded',
          value: intl.formatMessage(messages.CustomerAddressAdded),
        },
        {
          key: 'CustomerAddressChanged',
          value: intl.formatMessage(messages.CustomerAddressChanged),
        },
        {
          key: 'CustomerAddressRemoved',
          value: intl.formatMessage(messages.CustomerAddressRemoved),
        },
        {
          key: 'CustomerCompanyNameSet',
          value: intl.formatMessage(messages.CustomerCompanyNameSet),
        },
        {
          key: 'CustomerCreated',
          value: intl.formatMessage(messages.CustomerCreated),
        },
        {
          key: 'CustomerDateOfBirthSet',
          value: intl.formatMessage(messages.CustomerDateOfBirthSet),
        },
        {
          key: 'CustomerDeleted',
          value: intl.formatMessage(messages.CustomerDeleted),
        },
        {
          key: 'CustomerEmailChanged',
          value: intl.formatMessage(messages.CustomerEmailChanged),
        },
        {
          key: 'CustomerEmailVerified',
          value: intl.formatMessage(messages.CustomerEmailVerified),
        },
        {
          key: 'CustomerFirstNameSet',
          value: intl.formatMessage(messages.CustomerFirstNameSet),
        },
        {
          key: 'CustomerGroupSet',
          value: intl.formatMessage(messages.CustomerGroupSet),
        },
        {
          key: 'CustomerLastNameSet',
          value: intl.formatMessage(messages.CustomerLastNameSet),
        },
        {
          key: 'CustomerPasswordUpdated',
          value: intl.formatMessage(messages.CustomerPasswordUpdated),
        },
        {
          key: 'CustomerTitleSet',
          value: intl.formatMessage(messages.CustomerTitleSet),
        },
      ],
    },

    {
      resourceTypeId: 'inventory-entry',
      label: intl.formatMessage(messages['resourceTypeId.inventory-entry']),
      types: [
        {
          key: 'InventoryEntryCreated',
          value: intl.formatMessage(messages.InventoryEntryCreated),
        },
        {
          key: 'InventoryEntryDeleted',
          value: intl.formatMessage(messages.InventoryEntryDeleted),
        },
        {
          key: 'InventoryEntryQuantitySet',
          value: intl.formatMessage(messages.InventoryEntryQuantitySet),
        },
      ],
    },

    {
      resourceTypeId: 'order',
      label: intl.formatMessage(messages['resourceTypeId.order']),
      types: [
        {
          key: 'CustomLineItemStateTransition',
          value: intl.formatMessage(messages.CustomLineItemStateTransition),
        },
        {
          key: 'DeliveryAdded',
          value: intl.formatMessage(messages.DeliveryAdded),
        },
        {
          key: 'DeliveryAddressSet',
          value: intl.formatMessage(messages.DeliveryAddressSet),
        },
        {
          key: 'DeliveryItemsUpdated',
          value: intl.formatMessage(messages.DeliveryItemsUpdated),
        },
        {
          key: 'DeliveryRemoved',
          value: intl.formatMessage(messages.DeliveryRemoved),
        },
        {
          key: 'LineItemStateTransition',
          value: intl.formatMessage(messages.LineItemStateTransition),
        },
        {
          key: 'OrderBillingAddressSet',
          value: intl.formatMessage(messages.OrderBillingAddressSet),
        },
        {
          key: 'OrderCreated',
          value: intl.formatMessage(messages.OrderCreated),
        },
        {
          key: 'OrderCustomLineItemAdded',
          value: intl.formatMessage(messages.OrderCustomLineItemAdded),
        },
        {
          key: 'OrderCustomLineItemDiscountSet',
          value: intl.formatMessage(messages.OrderCustomLineItemDiscountSet),
        },
        {
          key: 'OrderCustomLineItemQuantityChanged',
          value: intl.formatMessage(
            messages.OrderCustomLineItemQuantityChanged
          ),
        },
        {
          key: 'OrderCustomLineItemRemoved',
          value: intl.formatMessage(messages.OrderCustomLineItemRemoved),
        },
        {
          key: 'OrderCustomerEmailSet',
          value: intl.formatMessage(messages.OrderCustomerEmailSet),
        },
        {
          key: 'OrderCustomerGroupSet',
          value: intl.formatMessage(messages.OrderCustomerGroupSet),
        },
        {
          key: 'OrderCustomerSet',
          value: intl.formatMessage(messages.OrderCustomerSet),
        },
        {
          key: 'OrderDeleted',
          value: intl.formatMessage(messages.OrderDeleted),
        },
        {
          key: 'OrderDiscountCodeAdded',
          value: intl.formatMessage(messages.OrderDiscountCodeAdded),
        },
        {
          key: 'OrderDiscountCodeRemoved',
          value: intl.formatMessage(messages.OrderDiscountCodeRemoved),
        },
        {
          key: 'OrderDiscountCodeStateSet',
          value: intl.formatMessage(messages.OrderDiscountCodeStateSet),
        },
        {
          key: 'OrderEditApplied',
          value: intl.formatMessage(messages.OrderEditApplied),
        },
        {
          key: 'OrderImported',
          value: intl.formatMessage(messages.OrderImported),
        },
        {
          key: 'OrderLineItemAdded',
          value: intl.formatMessage(messages.OrderLineItemAdded),
        },
        {
          key: 'OrderLineItemDiscountSet',
          value: intl.formatMessage(messages.OrderLineItemDiscountSet),
        },
        {
          key: 'OrderLineItemDistributionChannelSet',
          value: intl.formatMessage(
            messages.OrderLineItemDistributionChannelSet
          ),
        },
        {
          key: 'OrderLineItemRemoved',
          value: intl.formatMessage(messages.OrderLineItemRemoved),
        },
        {
          key: 'OrderPaymentAdded',
          value: intl.formatMessage(messages.OrderPaymentAdded),
        },
        {
          key: 'OrderPaymentStateChanged',
          value: intl.formatMessage(messages.OrderPaymentStateChanged),
        },
        {
          key: 'OrderReturnShipmentStateChanged',
          value: intl.formatMessage(messages.OrderReturnShipmentStateChanged),
        },
        {
          key: 'OrderShipmentStateChanged',
          value: intl.formatMessage(messages.OrderShipmentStateChanged),
        },
        {
          key: 'OrderShippingAddressSet',
          value: intl.formatMessage(messages.OrderShippingAddressSet),
        },
        {
          key: 'OrderShippingInfoSet',
          value: intl.formatMessage(messages.OrderShippingInfoSet),
        },
        {
          key: 'OrderShippingRateInputSet',
          value: intl.formatMessage(messages.OrderShippingRateInputSet),
        },
        {
          key: 'OrderStateChanged',
          value: intl.formatMessage(messages.OrderStateChanged),
        },
        {
          key: 'OrderStateTransition',
          value: intl.formatMessage(messages.OrderStateTransition),
        },
        {
          key: 'OrderStoreSet',
          value: intl.formatMessage(messages.OrderStoreSet),
        },
        {
          key: 'ParcelAddedToDelivery',
          value: intl.formatMessage(messages.ParcelAddedToDelivery),
        },
        {
          key: 'ParcelItemsUpdated',
          value: intl.formatMessage(messages.ParcelItemsUpdated),
        },
        {
          key: 'ParcelMeasurementsUpdated',
          value: intl.formatMessage(messages.ParcelMeasurementsUpdated),
        },
        {
          key: 'ParcelRemovedFromDelivery',
          value: intl.formatMessage(messages.ParcelRemovedFromDelivery),
        },
        {
          key: 'ParcelTrackingDataUpdated',
          value: intl.formatMessage(messages.ParcelTrackingDataUpdated),
        },
        {
          key: 'ReturnInfoAdded',
          value: intl.formatMessage(messages.ReturnInfoAdded),
        },
        {
          key: 'ReturnInfoSet',
          value: intl.formatMessage(messages.ReturnInfoSet),
        },
      ],
    },

    {
      resourceTypeId: 'payment',
      label: intl.formatMessage(messages['resourceTypeId.payment']),
      types: [
        {
          key: 'PaymentCreated',
          value: intl.formatMessage(messages.PaymentCreated),
        },
        {
          key: 'PaymentInteractionAdded',
          value: intl.formatMessage(messages.PaymentInteractionAdded),
        },
        {
          key: 'PaymentStatusInterfaceCodeSet',
          value: intl.formatMessage(messages.PaymentStatusInterfaceCodeSet),
        },
        {
          key: 'PaymentStatusStateTransition',
          value: intl.formatMessage(messages.PaymentStatusStateTransition),
        },
        {
          key: 'PaymentTransactionAdded',
          value: intl.formatMessage(messages.PaymentTransactionAdded),
        },
        {
          key: 'PaymentTransactionStateChanged',
          value: intl.formatMessage(messages.PaymentTransactionStateChanged),
        },
      ],
    },

    {
      resourceTypeId: 'product',
      label: intl.formatMessage(messages['resourceTypeId.product']),
      types: [
        {
          key: 'ProductAddedToCategory',
          value: intl.formatMessage(messages.ProductAddedToCategory),
        },
        {
          key: 'ProductCreated',
          value: intl.formatMessage(messages.ProductCreated),
        },
        {
          key: 'ProductDeleted',
          value: intl.formatMessage(messages.ProductDeleted),
        },
        {
          key: 'ProductImageAdded',
          value: intl.formatMessage(messages.ProductImageAdded),
        },
        {
          key: 'ProductPriceDiscountsSet',
          value: intl.formatMessage(messages.ProductPriceDiscountsSet),
        },
        {
          key: 'ProductPriceExternalDiscountSet',
          value: intl.formatMessage(messages.ProductPriceExternalDiscountSet),
        },
        {
          key: 'ProductPublished',
          value: intl.formatMessage(messages.ProductPublished),
        },
        {
          key: 'ProductRemovedFromCategory',
          value: intl.formatMessage(messages.ProductRemovedFromCategory),
        },
        {
          key: 'ProductRevertedStagedChanges',
          value: intl.formatMessage(messages.ProductRevertedStagedChanges),
        },
        {
          key: 'ProductSlugChanged',
          value: intl.formatMessage(messages.ProductSlugChanged),
        },
        {
          key: 'ProductStateTransition',
          value: intl.formatMessage(messages.ProductStateTransition),
        },
        {
          key: 'ProductUnpublished',
          value: intl.formatMessage(messages.ProductUnpublished),
        },
        {
          key: 'ProductVariantAdded',
          value: intl.formatMessage(messages.ProductVariantAdded),
        },
        {
          key: 'ProductVariantDeleted',
          value: intl.formatMessage(messages.ProductVariantDeleted),
        },
      ],
    },

    {
      resourceTypeId: 'product-selection',
      label: intl.formatMessage(messages['resourceTypeId.product-selection']),
      types: [
        {
          key: 'ProductSelectionCreated',
          value: intl.formatMessage(messages.ProductSelectionCreated),
        },
        {
          key: 'ProductSelectionDeleted',
          value: intl.formatMessage(messages.ProductSelectionDeleted),
        },
        {
          key: 'ProductSelectionProductAdded',
          value: intl.formatMessage(messages.ProductSelectionProductAdded),
        },
        {
          key: 'ProductSelectionProductRemoved',
          value: intl.formatMessage(messages.ProductSelectionProductRemoved),
        },
        {
          key: 'ProductSelectionVariantSelectionChanged',
          value: intl.formatMessage(
            messages.ProductSelectionVariantSelectionChanged
          ),
        },
      ],
    },

    {
      resourceTypeId: 'quote',
      label: intl.formatMessage(messages['resourceTypeId.quote']),
      types: [
        {
          key: 'QuoteCreated',
          value: intl.formatMessage(messages.QuoteCreated),
        },
        {
          key: 'QuoteDeleted',
          value: intl.formatMessage(messages.QuoteDeleted),
        },
        {
          key: 'QuoteStateChanged',
          value: intl.formatMessage(messages.QuoteStateChanged),
        },
        {
          key: 'QuoteStateTransition',
          value: intl.formatMessage(messages.QuoteStateTransition),
        },
      ],
    },

    {
      resourceTypeId: 'quote-request',
      label: intl.formatMessage(messages['resourceTypeId.quote-request']),
      types: [
        {
          key: 'QuoteRequestCreated',
          value: intl.formatMessage(messages.QuoteRequestCreated),
        },
        {
          key: 'QuoteRequestDeleted',
          value: intl.formatMessage(messages.QuoteRequestDeleted),
        },
        {
          key: 'QuoteRequestStateChanged',
          value: intl.formatMessage(messages.QuoteRequestStateChanged),
        },
        {
          key: 'QuoteRequestStateTransition',
          value: intl.formatMessage(messages.QuoteRequestStateTransition),
        },
      ],
    },
    {
      resourceTypeId: 'staged-quote',
      label: intl.formatMessage(messages['resourceTypeId.staged-quote']),
      types: [
        {
          key: 'StagedQuoteCreated',
          value: intl.formatMessage(messages.StagedQuoteCreated),
        },
        {
          key: 'StagedQuoteDeleted',
          value: intl.formatMessage(messages.StagedQuoteDeleted),
        },
        {
          key: 'StagedQuoteStateChanged',
          value: intl.formatMessage(messages.StagedQuoteStateChanged),
        },
        {
          key: 'StagedQuoteStateTransition',
          value: intl.formatMessage(messages.StagedQuoteStateTransition),
        },
      ],
    },

    {
      resourceTypeId: 'standalone-price',
      label: intl.formatMessage(messages['resourceTypeId.standalone-price']),
      types: [
        {
          key: 'StandalonePriceActiveChanged',
          value: intl.formatMessage(messages.StandalonePriceActiveChanged),
        },
        {
          key: 'StandalonePriceCreated',
          value: intl.formatMessage(messages.StandalonePriceCreated),
        },
        {
          key: 'StandalonePriceDeleted',
          value: intl.formatMessage(messages.StandalonePriceDeleted),
        },
        {
          key: 'StandalonePriceDiscountSet',
          value: intl.formatMessage(messages.StandalonePriceDiscountSet),
        },
        {
          key: 'StandalonePriceExternalDiscountSet',
          value: intl.formatMessage(
            messages.StandalonePriceExternalDiscountSet
          ),
        },
        {
          key: 'StandalonePriceStagedChangesApplied',
          value: intl.formatMessage(
            messages.StandalonePriceStagedChangesApplied
          ),
        },
        {
          key: 'StandalonePriceValueChanged',
          value: intl.formatMessage(messages.StandalonePriceValueChanged),
        },
      ],
    },

    {
      resourceTypeId: 'store',
      label: intl.formatMessage(messages['resourceTypeId.store']),
      types: [
        {
          key: 'StoreCreated',
          value: intl.formatMessage(messages.StoreCreated),
        },
        {
          key: 'StoreDeleted',
          value: intl.formatMessage(messages.StoreDeleted),
        },
        {
          key: 'StoreDistributionChannelsChanged',
          value: intl.formatMessage(messages.StoreDistributionChannelsChanged),
        },
        {
          key: 'StoreLanguagesChanged',
          value: intl.formatMessage(messages.StoreLanguagesChanged),
        },
        {
          key: 'StoreNameSet',
          value: intl.formatMessage(messages.StoreNameSet),
        },
        {
          key: 'StoreProductSelectionsChanged',
          value: intl.formatMessage(messages.StoreProductSelectionsChanged),
        },
        {
          key: 'StoreSupplyChannelsChanged',
          value: intl.formatMessage(messages.StoreSupplyChannelsChanged),
        },
      ],
    },
  ];
};
const SubscriptionMessagesForm = () => {
  const intl = useIntl();

  const isChecked = (
    values: Array<TMessageSubscriptionInput> | undefined,
    value: string
  ) => {
    return Boolean(
      values &&
        values.find((item) => {
          if (!item || !item.types) {
            return false;
          }
          const [resourceTypeId, name] = value.split('#');
          return (
            item.resourceTypeId === resourceTypeId &&
            item.types.indexOf(name) >= 0
          );
        })
    );
  };

  const addItem = (
    values: Array<TMessageSubscriptionInput> | undefined,
    value: string
  ) => {
    const [resourceTypeId, name] = value.split('#');
    if (values) {
      const inValues = values.find((entry) => {
        return entry.resourceTypeId === resourceTypeId;
      });
      if (inValues) {
        const removed = values.filter((item) => {
          return item.resourceTypeId !== resourceTypeId;
        });
        if (inValues.types) {
          return [
            ...removed,
            {
              resourceTypeId: resourceTypeId,
              types: [...inValues.types, name],
            },
          ];
        } else {
          return [
            ...removed,
            {
              resourceTypeId: resourceTypeId,
              types: [name],
            },
          ];
        }
      }
      return [
        ...values,
        {
          resourceTypeId: resourceTypeId,
          types: [name],
        },
      ];
    } else {
      return [
        {
          resourceTypeId: resourceTypeId,
          types: [name],
        },
      ];
    }
  };

  const removeItem = (
    values: Array<TMessageSubscriptionInput> | undefined,
    value: string
  ) => {
    if (!values) {
      return [];
    }
    const [resourceTypeId, name] = value.split('#');
    const inValues = values.find((entry) => {
      return entry.resourceTypeId === resourceTypeId;
    });
    if (inValues && inValues.types) {
      const removed = values.filter((item) => {
        return item.resourceTypeId !== resourceTypeId;
      });
      if (inValues.types.length > 1) {
        return [
          ...removed,
          {
            resourceTypeId: resourceTypeId,
            types: inValues.types.filter((item) => {
              return item !== name;
            }),
          },
        ];
      } else {
        return removed;
      }
    }
    return values;
  };

  return (
    <Constraints.Horizontal max="scale">
      <Grid
        gridGap={customProperties.spacing50}
        gridTemplateColumns={`repeat(auto-fill, '')`}
      >
        <Grid.Item>
          <Constraints.Horizontal max="scale">
            <Card insetScale="s" type="flat">
              <Spacings.Stack scale="s">
                <Text.Headline as={'h2'}>
                  {intl.formatMessage(messages.messagesLabel)}
                </Text.Headline>
                {entries(intl).map((item) => {
                  return (
                    <CheckboxGroup
                      key={item.resourceTypeId}
                      name="messages"
                      label={item.label}
                      columns={3}
                    >
                      {item.types.map((entry, index) => {
                        return (
                          <CheckboxGroup.Item
                            key={index}
                            label={entry.value}
                            value={item.resourceTypeId + '#' + entry.key}
                            isChecked={isChecked}
                            addItem={addItem}
                            removeItem={removeItem}
                          />
                        );
                      })}
                    </CheckboxGroup>
                  );
                })}
              </Spacings.Stack>
            </Card>
          </Constraints.Horizontal>
        </Grid.Item>
      </Grid>
    </Constraints.Horizontal>
  );
};
export default SubscriptionMessagesForm;
