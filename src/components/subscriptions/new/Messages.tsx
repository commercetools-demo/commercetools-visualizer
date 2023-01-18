import { TMessageSubscriptionInput } from '../../../types/generated/ctp';
import CheckboxGroup from '../../checkbox/CheckboxGroup';

const Messages = () => {
  const entries = [
    {
      resourceTypeId: 'business-unit',
      types: [
        'BusinessUnitAddressAdded',
        'BusinessUnitAddressChanged',
        'BusinessUnitAddressRemoved',
        'BusinessUnitAssociateAdded',
        'BusinessUnitAssociateChanged',
        'BusinessUnitAssociateRemoved',
        'BusinessUnitAssociatesSet',
        'BusinessUnitBillingAddressAdded',
        'BusinessUnitBillingAddressRemoved',
        'BusinessUnitContactEmailSet',
        'BusinessUnitCreated',
        'BusinessUnitDefaultBillingAddressSet',
        'BusinessUnitDefaultShippingAddressSet',
        'BusinessUnitDeleted',
        'BusinessUnitNameChanged',
        'BusinessUnitShippingAddressAdded',
        'BusinessUnitShippingAddressRemoved',
        'BusinessUnitStatusChanged',
        'BusinessUnitStoreAdded',
        'BusinessUnitStoreModeChanged',
        'BusinessUnitStoreRemoved',
        'BusinessUnitStoresSet',
      ],
    },

    {
      resourceTypeId: 'category',
      types: ['CategoryCreated', 'CategorySlugChanged'],
    },

    {
      resourceTypeId: 'customer',
      types: [
        'CustomerAddressAdded',
        'CustomerAddressChanged',
        'CustomerAddressRemoved',
        'CustomerCompanyNameSet',
        'CustomerCreated',
        'CustomerDateOfBirthSet',
        'CustomerDeleted',
        'CustomerEmailChanged',
        'CustomerEmailVerified',
        'CustomerFirstNameSet',
        'CustomerGroupSet',
        'CustomerLastNameSet',
        'CustomerPasswordUpdated',
        'CustomerTitleSet',
      ],
    },

    {
      resourceTypeId: 'inventory-entry',
      types: [
        'InventoryEntryCreated',
        'InventoryEntryDeleted',
        'InventoryEntryQuantitySet',
      ],
    },

    {
      resourceTypeId: 'order',
      types: [
        'CustomLineItemStateTransition',
        'DeliveryAdded',
        'DeliveryAddressSet',
        'DeliveryItemsUpdated',
        'DeliveryRemoved',
        'LineItemStateTransition',
        'OrderBillingAddressSet',
        'OrderCreated',
        'OrderCustomLineItemAdded',
        'OrderCustomLineItemDiscountSet',
        'OrderCustomLineItemQuantityChanged',
        'OrderCustomLineItemRemoved',
        'OrderCustomerEmailSet',
        'OrderCustomerGroupSet',
        'OrderCustomerSet',
        'OrderDeleted',
        'OrderDiscountCodeAdded',
        'OrderDiscountCodeRemoved',
        'OrderDiscountCodeStateSet',
        'OrderEditApplied',
        'OrderImported',
        'OrderLineItemAdded',
        'OrderLineItemDiscountSet',
        'OrderLineItemDistributionChannelSet',
        'OrderLineItemRemoved',
        'OrderPaymentAdded',
        'OrderPaymentStateChanged',
        'OrderReturnShipmentStateChanged',
        'OrderShipmentStateChanged',
        'OrderShippingAddressSet',
        'OrderShippingInfoSet',
        'OrderShippingRateInputSet',
        'OrderStateChanged',
        'OrderStateTransition',
        'OrderStoreSet',
        'ParcelAddedToDelivery',
        'ParcelItemsUpdated',
        'ParcelMeasurementsUpdated',
        'ParcelRemovedFromDelivery',
        'ParcelTrackingDataUpdated',
        'ReturnInfoAdded',
        'ReturnInfoSet',
      ],
    },

    {
      resourceTypeId: 'payment',
      types: [
        'PaymentCreated',
        'PaymentInteractionAdded',
        'PaymentStatusInterfaceCodeSet',
        'PaymentStatusStateTransition',
        'PaymentTransactionAdded',
        'PaymentTransactionStateChanged',
      ],
    },

    {
      resourceTypeId: 'product',
      types: [
        'ProductAddedToCategory',
        'ProductCreated',
        'ProductDeleted',
        'ProductImageAdded',
        'ProductPriceDiscountsSet',
        'ProductPriceExternalDiscountSet',
        'ProductPublished',
        'ProductRemovedFromCategory',
        'ProductRevertedStagedChanges',
        'ProductSlugChanged',
        'ProductStateTransition',
        'ProductUnpublished',
        'ProductVariantAdded',
        'ProductVariantDeleted',
      ],
    },

    {
      resourceTypeId: 'product-selection',
      types: [
        'ProductSelectionCreated',
        'ProductSelectionDeleted',
        'ProductSelectionProductAdded',
        'ProductSelectionProductRemoved',
        'ProductSelectionVariantSelectionChanged',
      ],
    },

    {
      resourceTypeId: 'quote',
      types: [
        'QuoteCreated',
        'QuoteDeleted',
        'QuoteStateChanged',
        'QuoteStateTransition',
      ],
    },

    {
      resourceTypeId: 'quote-request',
      types: [
        'QuoteRequestCreated',
        'QuoteRequestDeleted',
        'QuoteRequestStateChanged',
        'QuoteRequestStateTransition',
      ],
    },

    {
      resourceTypeId: 'review',
      types: ['ReviewCreated', 'ReviewRatingSet', 'ReviewStateTransition'],
    },

    {
      resourceTypeId: 'staged-quote',
      types: [
        'StagedQuoteCreated',
        'StagedQuoteDeleted',
        'StagedQuoteStateChanged',
        'StagedQuoteStateTransition',
      ],
    },

    {
      resourceTypeId: 'standalone-price',
      types: [
        'StandalonePriceActiveChanged',
        'StandalonePriceCreated',
        'StandalonePriceDeleted',
        'StandalonePriceDiscountSet',
        'StandalonePriceExternalDiscountSet',
        'StandalonePriceStagedChangesApplied',
        'StandalonePriceValueChanged',
      ],
    },

    {
      resourceTypeId: 'store',
      types: [
        'StoreCreated',
        'StoreDeleted',
        'StoreDistributionChannelsChanged',
        'StoreLanguagesChanged',
        'StoreNameSet',
        'StoreProductSelectionsChanged',
        'StoreSupplyChannelsChanged',
      ],
    },
  ];
  return (
    <>
      {entries.map((item) => {
        return (
          <CheckboxGroup
            key={item.resourceTypeId}
            name="messages"
            label={item.resourceTypeId}
            columns={3}
          >
            {item.types.map((entry, index) => {
              return (
                <CheckboxGroup.Item
                  key={index}
                  label={entry}
                  value={item.resourceTypeId + '#' + entry}
                  isChecked={(
                    values: Array<string> | undefined,
                    value: string
                  ) => {
                    return Boolean(
                      values &&
                        values.find((item) => {
                          const i = item as any as TMessageSubscriptionInput;
                          if (!i || !i.types) {
                            return false;
                          }
                          const [resourceTypeId, name] = value.split('#');
                          return (
                            i.resourceTypeId === resourceTypeId &&
                            i.types.indexOf(name) >= 0
                          );
                        })
                    );
                  }}
                  addItem={(
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
                        { resourceTypeId: resourceTypeId, types: [name] },
                      ];
                    }
                  }}
                  removeItem={(
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
                  }}
                />
              );
            })}
          </CheckboxGroup>
        );
      })}
    </>
  );
};

export default Messages;
