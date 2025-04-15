import Grid from '@commercetools-uikit/grid';
import { designTokens } from '@commercetools-uikit/design-system';
import Constraints from '@commercetools-uikit/constraints';
import Card from '@commercetools-uikit/card';
import { TActionType, TTriggerInput } from '../../../types/generated/ctp';
import messages from './messages';
import { IntlShape, useIntl } from 'react-intl';
import Text from '@commercetools-uikit/text';
import Spacings from '@commercetools-uikit/spacings';
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
    <Constraints.Horizontal max="scale">
      <Grid
        gridGap={designTokens.spacing50}
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
              </Spacings.Stack>
            </Card>
          </Constraints.Horizontal>
        </Grid.Item>
      </Grid>
    </Constraints.Horizontal>
  );
};
export default ExtensionsTriggersForm;
