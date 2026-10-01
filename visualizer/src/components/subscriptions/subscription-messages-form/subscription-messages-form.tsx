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
import { subscriptionMessageTypesByResource } from './subscription-message-types';

const formatCamelCase = (input: string): string => {
  return input.replace(/([a-z])([A-Z])/g, '$1 $2'); // Add a space between lowercase and uppercase letters
};

const toPascalCase = (resourceTypeId: string): string =>
  resourceTypeId
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

// One accordion group per resource type a MessageSubscription can target. A message
// name is shown without the resource's name prefix ("ApprovalFlowCreated" -> "Created")
// unless some of the group's messages don't carry it (e.g. an Order's `LineItem*`,
// `Delivery*` and `Parcel*` messages), in which case full names are shown.
export const messageEntries = () =>
  Object.entries(subscriptionMessageTypesByResource)
    .map(([resourceTypeId, names]) => {
      const prefix = toPascalCase(resourceTypeId);
      const stripPrefix = names.every((name) => name.startsWith(prefix));
      return {
        resourceTypeId,
        resourceTypeName: formatCamelCase(prefix),
        amountOfMessage: names.length,
        types: names.map((name) => ({
          key: name,
          value: formatCamelCase(
            stripPrefix ? name.substring(prefix.length) : name
          ),
        })),
      };
    })
    .sort((a, b) => a.resourceTypeId.localeCompare(b.resourceTypeId));

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

  // An entry with no `types` subscribes to *all* messages of the resource.
  const isAllSelected = (resourceTypeId: string) => {
    const entry = field.value?.find(
      (item) => item.resourceTypeId === resourceTypeId
    );
    return Boolean(entry) && (entry?.types?.length ?? 0) === 0;
  };

  const toggleAll = (resourceTypeId: string, isSelected: boolean) => {
    const others = (field.value ?? []).filter(
      (item) => item.resourceTypeId !== resourceTypeId
    );
    helpers.setValue(
      isSelected ? [...others, { resourceTypeId, types: [] }] : others
    );
  };

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
        expandedKeys={messageEntries().map((item) => item.resourceTypeId)}
      >
        {messageEntries().map((item) => (
          <Accordion.Item key={item.resourceTypeId} value={item.resourceTypeId}>
            <Accordion.Header>
              {intl.formatMessage(messages.resourceTypeLabel, {
                label: item.resourceTypeName,
                amount: item.amountOfMessage,
              })}
            </Accordion.Header>
            <Accordion.Content>
              <Checkbox
                isSelected={isAllSelected(item.resourceTypeId)}
                isReadOnly={isReadOnly}
                onChange={(isSelected) =>
                  toggleAll(item.resourceTypeId, isSelected)
                }
              >
                {intl.formatMessage(messages.allTypesLabel, {
                  label: item.resourceTypeName,
                })}
              </Checkbox>
              <Grid
                templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
                gap="200"
              >
                {item.types.map((entry) => (
                  <Checkbox
                    key={entry.key}
                    isSelected={isChecked(item.resourceTypeId, entry.key)}
                    isReadOnly={isReadOnly}
                    isDisabled={isAllSelected(item.resourceTypeId)}
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
