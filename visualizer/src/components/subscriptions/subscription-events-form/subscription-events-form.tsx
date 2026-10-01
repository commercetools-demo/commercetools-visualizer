import { FC } from 'react';
import { useIntl } from 'react-intl';
import { useField } from 'formik';
import {
  Accordion,
  Checkbox,
  Grid,
  Heading,
  Stack,
} from '@commercetools/nimbus';
import { TEventSubscriptionInput } from '../../../types/generated/ctp';
import messages from './messages';
import {
  subscriptionEventResources,
  subscriptionEventTypesByResource,
} from './subscription-event-types';

const formatCamelCase = (input: string): string =>
  input.replace(/([a-z])([A-Z])/g, '$1 $2');

export const eventEntries = () =>
  Object.entries(subscriptionEventTypesByResource)
    .map(([resourceTypeId, names]) => {
      const { label, prefix } = subscriptionEventResources[resourceTypeId];
      return {
        resourceTypeId,
        resourceTypeName: label,
        amountOfEvents: names.length,
        types: names.map((name) => ({
          key: name,
          value: formatCamelCase(name.substring(prefix.length)),
        })),
      };
    })
    .sort((a, b) => a.resourceTypeId.localeCompare(b.resourceTypeId));

type Props = {
  isReadOnly?: boolean;
};

const SubscriptionEventsForm: FC<Props> = ({ isReadOnly }) => {
  const intl = useIntl();
  const [field, , helpers] = useField<
    Array<TEventSubscriptionInput> | null | undefined
  >('events');

  const isChecked = (resourceTypeId: string, name: string) =>
    Boolean(
      field.value?.find(
        (item) =>
          item.resourceTypeId === resourceTypeId && item.types?.includes(name)
      )
    );

  // An entry with no `types` subscribes to *all* events of the resource.
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
        {intl.formatMessage(messages.eventsLabel)}
      </Heading>
      <Accordion.Root
        allowsMultipleExpanded
        expandedKeys={eventEntries().map((item) => item.resourceTypeId)}
      >
        {eventEntries().map((item) => (
          <Accordion.Item key={item.resourceTypeId} value={item.resourceTypeId}>
            <Accordion.Header>
              {intl.formatMessage(messages.resourceTypeLabel, {
                label: item.resourceTypeName,
                amount: item.amountOfEvents,
              })}
            </Accordion.Header>
            <Accordion.Content>
              <Stack direction="column" gap="200">
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
              </Stack>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </Stack>
  );
};
export default SubscriptionEventsForm;
