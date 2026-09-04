import { useField } from 'formik';
import { Card, Checkbox, Heading, Stack, Table } from '@commercetools/nimbus';
import { IntlShape, useIntl } from 'react-intl';
import { TActionType, TTriggerInput } from '../../../types/generated/ctp';
import messages from './messages';

const RESOURCE_TYPE_IDS = [
  'cart',
  'order',
  'payment',
  'customer',
  'quote-request',
  'staged-quote',
  'quote',
  'business-unit',
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

const toggleAction = (
  triggers: Array<TTriggerInput> | undefined,
  resourceTypeId: string,
  action: TActionType,
  isEnabled: boolean
): Array<TTriggerInput> => {
  const otherTriggers = (triggers ?? []).filter(
    (trigger) => trigger.resourceTypeId !== resourceTypeId
  );
  const existingActions =
    triggers?.find((trigger) => trigger.resourceTypeId === resourceTypeId)
      ?.actions ?? [];
  const nextActions = isEnabled
    ? [...existingActions, action]
    : existingActions.filter((existingAction) => existingAction !== action);

  return nextActions.length > 0
    ? [...otherTriggers, { resourceTypeId, actions: nextActions }]
    : otherTriggers;
};

const ExtensionsTriggersForm = () => {
  const intl = useIntl();
  const [field, , helpers] = useField<Array<TTriggerInput>>('triggers');

  return (
    <Card.Root variant="outlined" size="sm">
      <Card.Body>
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
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {RESOURCE_TYPE_IDS.map((resourceTypeId) => (
                <Table.Row key={resourceTypeId}>
                  <Table.Cell>
                    {intl.formatMessage(messages[resourceTypeId])}
                  </Table.Cell>
                  {ACTIONS.map((action) => (
                    <Table.Cell key={action} textAlign="center">
                      <Checkbox
                        aria-label={`${resourceTypeId} ${actionLabel(
                          intl,
                          action
                        )}`}
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
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Stack>
      </Card.Body>
    </Card.Root>
  );
};
export default ExtensionsTriggersForm;
