import {
  Accordion,
  Checkbox,
  Grid,
  Heading,
  Stack,
} from '@commercetools/nimbus';
import { useField } from 'formik';
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
  const [field, , helpers] =
    useField<Array<TMessageSubscriptionInput>>('messages');

  const isChecked = (resourceTypeId: string, name: string) =>
    Boolean(
      field.value?.find(
        (item) =>
          item.resourceTypeId === resourceTypeId &&
          item.types?.indexOf(name) !== -1
      )
    );

  const toggle = (
    resourceTypeId: string,
    name: string,
    isSelected: boolean
  ) => {
    const others = (field.value ?? []).filter(
      (item) => item.resourceTypeId !== resourceTypeId
    );
    const existingTypes =
      field.value?.find((item) => item.resourceTypeId === resourceTypeId)
        ?.types ?? [];
    const nextTypes = isSelected
      ? [...existingTypes, name]
      : existingTypes.filter((type) => type !== name);

    helpers.setValue(
      nextTypes.length > 0
        ? [...others, { resourceTypeId, types: nextTypes }]
        : others
    );
  };

  return (
    <Stack direction="column" gap="200">
      <Heading as="h2" size="md">
        {intl.formatMessage(messages.messagesLabel)}
      </Heading>
      <Accordion.Root
        allowsMultipleExpanded
        expandedKeys={entries().map((item) => item.resourceTypeId)}
      >
        {entries().map((item) => (
          <Accordion.Item key={item.resourceTypeId} value={item.resourceTypeId}>
            <Accordion.Header>
              {intl.formatMessage(messages.resourceTypeLabel, {
                label: item.resourceTypeName,
                amount: item.amountOfMessage,
              })}
            </Accordion.Header>
            <Accordion.Content>
              <Grid
                templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
                gap="200"
              >
                {item.types.map((entry) => (
                  <Checkbox
                    key={entry.key}
                    isSelected={isChecked(item.resourceTypeId, entry.key)}
                    isReadOnly={isReadOnly}
                    onChange={(isSelected) =>
                      toggle(item.resourceTypeId, entry.key, isSelected)
                    }
                  >
                    {entry.value}
                  </Checkbox>
                ))}
              </Grid>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </Stack>
  );
};
export default SubscriptionMessagesForm;
