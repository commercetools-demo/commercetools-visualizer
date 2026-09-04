import { Heading, Stack } from '@commercetools/nimbus';
import {
  CheckboxGroup,
  CheckboxGroupItem,
} from 'commercetools-demo-shared-checkbox-group';
import { TMessageSubscriptionInput } from '../../../types/generated/ctp';
import messages from './messages';
import { useIntl } from 'react-intl';
import { FC } from 'react';
import { subscriptionMessageTypes } from './subscription-message-types';

const messagesConfig = [
  { resourceTypeId: 'approval-flow', resourceTypeName: 'ApprovalFlow' },
  { resourceTypeId: 'approval-rule', resourceTypeName: 'ApprovalRule' },
  { resourceTypeId: 'associate-role', resourceTypeName: 'AssociateRole' },
  { resourceTypeId: 'business-unit', resourceTypeName: 'BusinessUnit' },
  { resourceTypeId: 'category', resourceTypeName: 'Category' },
  { resourceTypeId: 'cart-discount', resourceTypeName: 'CartDiscount' },
  { resourceTypeId: 'customer', resourceTypeName: 'Customer' },
  { resourceTypeId: 'discount-code', resourceTypeName: 'DiscountCode' },
  {
    resourceTypeId: 'inventory-entry',
    resourceTypeName: 'InventoryEntry',
  },
  {
    resourceTypeId: 'order',
    resourceTypeName: [
      'CustomLineItem',
      'Delivery',
      'LineItem',
      'Order',
      'Parcel',
      'ReturnInfo',
    ],
    label: 'Order',
  },
  {
    resourceTypeId: 'payment',
    resourceTypeName: 'Payment',
  },
  {
    resourceTypeId: 'product-selection',
    resourceTypeName: 'ProductSelection',
  },
  {
    resourceTypeId: 'product-tailoring',
    resourceTypeName: ['ProductTailoring', 'ProductVariantTailoring'],
  },
  {
    resourceTypeId: 'product',
    resourceTypeName: 'Product',
  },
  {
    resourceTypeId: 'quote-request',
    resourceTypeName: 'QuoteRequest',
  },
  {
    resourceTypeId: 'quote',
    resourceTypeName: 'Quote',
  },
  {
    resourceTypeId: 'review',
    resourceTypeName: 'Review',
  },
  {
    resourceTypeId: 'staged-quote',
    resourceTypeName: 'StagedQuote',
  },
  {
    resourceTypeId: 'standalone-price',
    resourceTypeName: 'StandalonePrice',
  },
  {
    resourceTypeId: 'store',
    resourceTypeName: 'Store',
  },
];

const formatCamelCase = (input: string): string => {
  return input.replace(/([a-z])([A-Z])/g, '$1 $2'); // Add a space between lowercase and uppercase letters
};

const filterMessages = (
  messages: Array<string>,
  filter: string,
  removePrefix = false
) => {
  const result: Array<string> = [];

  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].startsWith(filter)) {
      result.push(messages[i]);
      messages.splice(i, 1);
    }
  }

  return result.map((item) => ({
    key: item,
    value: formatCamelCase(removePrefix ? item.substring(filter.length) : item),
  }));
};

const entries = () => {
  const messageNameClone = [...subscriptionMessageTypes];

  return messagesConfig
    .map((entry) => {
      let names = entry.resourceTypeName;
      if (!Array.isArray(names)) {
        names = [names];
      }
      const messageNames = names
        .map((resourceTypeName) =>
          filterMessages(
            messageNameClone,
            resourceTypeName,
            !Array.isArray(entry.resourceTypeName)
          )
        )
        .flat();

      return {
        resourceTypeId: entry.resourceTypeId,
        resourceTypeName: formatCamelCase(
          entry.label
            ? entry.label
            : Array.isArray(entry.resourceTypeName)
            ? entry.resourceTypeName[0]
            : entry.resourceTypeName
        ),
        amountOfMessage: messageNames.length,
        types: messageNames,
      };
    })
    .sort((a, b) => a.resourceTypeId.localeCompare(b.resourceTypeId));
};

type Props = {
  isReadOnly?: boolean;
};
const SubscriptionMessagesForm: FC<Props> = ({ isReadOnly }) => {
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
    <Stack direction="column" gap="200">
      <Heading as="h2" size="md">
        {intl.formatMessage(messages.messagesLabel)}
      </Heading>
      {entries().map((item) => {
        return (
          <CheckboxGroup
            key={item.resourceTypeId}
            name="messages"
            label={intl.formatMessage(messages.resourceTypeLabel, {
              label: item.resourceTypeName,
              amount: item.amountOfMessage,
            })}
          >
            {item.types.map((entry, index) => {
              return (
                <CheckboxGroupItem
                  key={index}
                  label={entry.value}
                  value={item.resourceTypeId + '#' + entry.key}
                  isChecked={isChecked}
                  addItem={addItem}
                  removeItem={removeItem}
                  isReadOnly={isReadOnly}
                />
              );
            })}
          </CheckboxGroup>
        );
      })}
    </Stack>
  );
};
export default SubscriptionMessagesForm;
