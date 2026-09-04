import { Card, Heading, Stack } from '@commercetools/nimbus';
import { TActionType, TTriggerInput } from '../../../types/generated/ctp';
import messages from './messages';
import { IntlShape, useIntl } from 'react-intl';
import {
  CheckboxGroup,
  CheckboxGroupItem,
} from 'commercetools-demo-shared-checkbox-group';

const actions = (intl: IntlShape) => {
  return [
    {
      key: TActionType.Create,
      value: intl.formatMessage(messages.triggerActionCreate),
    },
    {
      key: TActionType.Update,
      value: intl.formatMessage(messages.triggerActionUpdate),
    },
  ];
};
const entries = (intl: IntlShape) => {
  return [
    {
      triggerId: 'cart',
      label: intl.formatMessage(messages['cart']),
    },

    {
      triggerId: 'order',
      label: intl.formatMessage(messages['order']),
    },
    {
      triggerId: 'payment',
      label: intl.formatMessage(messages['payment']),
    },
    {
      triggerId: 'customer',
      label: intl.formatMessage(messages['customer']),
    },
    {
      triggerId: 'quote-request',
      label: intl.formatMessage(messages['quote-request']),
    },
    {
      triggerId: 'staged-quote',
      label: intl.formatMessage(messages['staged-quote']),
    },
    {
      triggerId: 'quote',
      label: intl.formatMessage(messages['quote']),
    },
    {
      triggerId: 'business-unit',
      label: intl.formatMessage(messages['business-unit']),
    },
  ];
};
const ExtensionsTriggersForm = () => {
  const intl = useIntl();

  const isChecked = (
    values: Array<TTriggerInput> | undefined,
    value: string
  ) => {
    return Boolean(
      values &&
        values.find((item) => {
          if (!item || !item.actions) {
            return false;
          }
          const [resourceTypeId, name] = value.split('#');
          return (
            item.resourceTypeId === resourceTypeId &&
            item.actions.indexOf(name as TActionType) >= 0
          );
        })
    );
  };

  const addItem = (
    values: Array<TTriggerInput> | undefined,
    value: string
  ): Array<TTriggerInput> => {
    const [resourceTypeId, nameUncasted] = value.split('#');
    const name = nameUncasted as TActionType;
    if (values) {
      const inValues = values.find((entry) => {
        return entry.resourceTypeId === resourceTypeId;
      });
      if (inValues) {
        const removed = values.filter((item) => {
          return item.resourceTypeId !== resourceTypeId;
        });
        if (inValues.actions) {
          return [
            ...removed,
            {
              resourceTypeId: resourceTypeId,
              actions: [...inValues.actions, name],
            },
          ];
        } else {
          return [
            ...removed,
            {
              resourceTypeId: resourceTypeId,
              actions: [name],
            },
          ];
        }
      }
      return [
        ...values,
        {
          resourceTypeId: resourceTypeId,
          actions: [name],
        },
      ];
    } else {
      return [
        {
          resourceTypeId: resourceTypeId,
          actions: [name],
        },
      ];
    }
  };

  const removeItem = (
    values: Array<TTriggerInput> | undefined,
    value: string
  ) => {
    if (!values) {
      return [];
    }
    const [resourceTypeId, name] = value.split('#');
    const inValues = values.find((entry) => {
      return entry.resourceTypeId === resourceTypeId;
    });
    if (inValues && inValues.actions) {
      const removed = values.filter((item) => {
        return item.resourceTypeId !== resourceTypeId;
      });
      if (inValues.actions.length > 1) {
        return [
          ...removed,
          {
            resourceTypeId: resourceTypeId,
            actions: inValues.actions.filter((item) => {
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
    <Card.Root variant="outlined" size="sm">
      <Card.Body>
        <Stack direction="column" gap="400">
          <Heading as="h2" size="md">
            {intl.formatMessage(messages.messagesLabel)}
          </Heading>
          {entries(intl).map((item) => {
            return (
              <CheckboxGroup
                key={item.triggerId}
                name="triggers"
                label={item.label}
              >
                {actions(intl).map((entry, index) => {
                  return (
                    <CheckboxGroupItem<TTriggerInput>
                      key={index}
                      label={entry.value}
                      value={item.triggerId + '#' + entry.key}
                      isChecked={isChecked}
                      addItem={addItem}
                      removeItem={removeItem}
                    />
                  );
                })}
              </CheckboxGroup>
            );
          })}
        </Stack>
      </Card.Body>
    </Card.Root>
  );
};
export default ExtensionsTriggersForm;
