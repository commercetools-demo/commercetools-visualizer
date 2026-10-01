import { FC } from 'react';
import { useField } from 'formik';
import {
  Checkbox,
  Heading,
  Stack,
  Table,
  Text,
  TextInput,
} from '@commercetools/nimbus';
import { IntlShape, useIntl } from 'react-intl';
import { TActionType, TTriggerInput } from '../../../types/generated/ctp';
import messages from './messages';

// Resources an API Extension can be triggered for — keep in sync with
// `ExtensionResourceTypeId`:
// https://docs.commercetools.com/api/projects/api-extensions#extensionresourcetypeid
export const RESOURCE_TYPE_IDS = [
  'cart',
  'order',
  'payment',
  'payment-method',
  'customer',
  'customer-group',
  'quote-request',
  'staged-quote',
  'quote',
  'business-unit',
  'shopping-list',
  'product',
] as const;

const ACTIONS = [TActionType.Create, TActionType.Update];

const actionLabel = (intl: IntlShape, action: TActionType) =>
  action === TActionType.Create
    ? intl.formatMessage(messages.triggerActionCreate)
    : intl.formatMessage(messages.triggerActionUpdate);

const isActionEnabled = (
  triggers: Array<TTriggerInput> | undefined,
  resourceTypeId: string,
  action: TActionType
) =>
  Boolean(
    triggers?.find(
      (trigger) =>
        trigger.resourceTypeId === resourceTypeId &&
        trigger.actions?.indexOf(action) !== -1
    )
  );

// Rewrites the trigger of one resource in place (so toggling an action back and forth
// doesn't reorder `triggers` and look like a change) and keeps the rest of an existing
// trigger, i.e. its `condition`, which this form has no editor for.
// An Extension may have several triggers for one resource type (each with its own
// condition and actions); this matrix has one row per resource type and can only represent
// one. Rows with several are left alone, so editing never merges or drops them.
export const triggerCount = (
  triggers: Array<TTriggerInput> | undefined,
  resourceTypeId: string
) =>
  (triggers ?? []).filter(
    (trigger) => trigger.resourceTypeId === resourceTypeId
  ).length;

export const setCondition = (
  triggers: Array<TTriggerInput> | undefined,
  resourceTypeId: string,
  condition: string
): Array<TTriggerInput> => {
  if (triggerCount(triggers, resourceTypeId) !== 1) return triggers ?? [];
  return (triggers ?? []).map((trigger) => {
    if (trigger.resourceTypeId !== resourceTypeId) return trigger;
    const { condition: _previous, ...rest } = trigger;
    void _previous;
    return condition.trim() ? { ...rest, condition } : rest;
  });
};

export const toggleAction = (
  triggers: Array<TTriggerInput> | undefined,
  resourceTypeId: string,
  action: TActionType,
  isEnabled: boolean
): Array<TTriggerInput> => {
  if (triggerCount(triggers, resourceTypeId) > 1) return triggers ?? [];
  const existing = triggers?.find(
    (trigger) => trigger.resourceTypeId === resourceTypeId
  );
  const existingActions = existing?.actions ?? [];
  const nextActions = isEnabled
    ? [...existingActions, action]
    : existingActions.filter((existingAction) => existingAction !== action);

  if (nextActions.length === 0) {
    return (triggers ?? []).filter(
      (trigger) => trigger.resourceTypeId !== resourceTypeId
    );
  }
  const next = { ...existing, resourceTypeId, actions: nextActions };
  return existing
    ? (triggers ?? []).map((trigger) =>
        trigger.resourceTypeId === resourceTypeId ? next : trigger
      )
    : [...(triggers ?? []), next];
};

type Props = {
  isReadOnly?: boolean;
};

const ExtensionsTriggersForm: FC<Props> = ({ isReadOnly }) => {
  const intl = useIntl();
  const [field, , helpers] = useField<Array<TTriggerInput>>('triggers');

  return (
    <Stack direction="column" gap="400">
      <Heading as="h2" size="md">
        {intl.formatMessage(messages.messagesLabel)}
      </Heading>
      <Table.Root variant="outline">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>
              {intl.formatMessage(messages.columnResourceType)}
            </Table.ColumnHeader>
            {ACTIONS.map((action) => (
              <Table.ColumnHeader key={action} textAlign="center">
                {actionLabel(intl, action)}
              </Table.ColumnHeader>
            ))}
            <Table.ColumnHeader>
              {intl.formatMessage(messages.columnCondition)}
            </Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {RESOURCE_TYPE_IDS.map((resourceTypeId) => {
            const count = triggerCount(field.value, resourceTypeId);
            const hasMultiple = count > 1;
            const trigger = field.value?.find(
              (item) => item.resourceTypeId === resourceTypeId
            );
            return (
              <Table.Row key={resourceTypeId}>
                <Table.Cell>
                  {intl.formatMessage(messages[resourceTypeId])}
                  {hasMultiple && (
                    <Text color="neutral.11" fontSize="sm">
                      {intl.formatMessage(messages.multipleTriggers, { count })}
                    </Text>
                  )}
                </Table.Cell>
                {ACTIONS.map((action) => (
                  <Table.Cell key={action} textAlign="center">
                    <Checkbox
                      aria-label={`${resourceTypeId} ${actionLabel(
                        intl,
                        action
                      )}`}
                      isReadOnly={isReadOnly}
                      isDisabled={hasMultiple}
                      isSelected={isActionEnabled(
                        field.value,
                        resourceTypeId,
                        action
                      )}
                      onChange={(isSelected) =>
                        helpers.setValue(
                          toggleAction(
                            field.value,
                            resourceTypeId,
                            action,
                            isSelected
                          )
                        )
                      }
                    />
                  </Table.Cell>
                ))}
                <Table.Cell>
                  <TextInput
                    aria-label={`${resourceTypeId} condition`}
                    value={trigger?.condition ?? ''}
                    isReadOnly={isReadOnly}
                    isDisabled={!trigger || hasMultiple}
                    onChange={(value) =>
                      helpers.setValue(
                        setCondition(field.value, resourceTypeId, value)
                      )
                    }
                    width="full"
                  />
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Root>
      <Text color="neutral.11" fontSize="sm">
        {intl.formatMessage(messages.conditionHint)}
      </Text>
    </Stack>
  );
};
export default ExtensionsTriggersForm;
