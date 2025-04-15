import Grid from '@commercetools-uikit/grid';
import { designTokens } from '@commercetools-uikit/design-system';
import Constraints from '@commercetools-uikit/constraints';
import Card from '@commercetools-uikit/card';
import {
  CheckboxGroup,
  CheckboxGroupItem,
} from 'commercetools-demo-shared-checkbox-group';
import { TChangeSubscriptionInput } from '../../../types/generated/ctp';
import messages from './messages';
import { useIntl } from 'react-intl';
import { FC } from 'react';
import { changes } from './subscription-changes-types';

type Props = {
  isReadOnly?: boolean;
};
const SubscriptionChangesForm: FC<Props> = ({ isReadOnly }) => {
  const intl = useIntl();

  const isChecked = (
    values: Array<TChangeSubscriptionInput> | undefined,
    value: string
  ) => {
    return Boolean(
      values && values.find((item) => item.resourceTypeId === value)
    );
  };

  const addItem = (
    values: Array<TChangeSubscriptionInput> | undefined,
    value: string
  ) => {
    const toAdd: TChangeSubscriptionInput = {
      resourceTypeId: value,
    };
    if (values) {
      return [...values, toAdd];
    } else {
      return [toAdd];
    }
  };

  const removeItem = (
    values: Array<TChangeSubscriptionInput> | undefined,
    value: string
  ) => {
    return values
      ? values.filter((item) => {
          return item.resourceTypeId !== value;
        })
      : [];
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
              <CheckboxGroup
                name="changes"
                label="Choose Changes you want to listen to."
              >
                {changes.map((entry) => {
                  return (
                    <CheckboxGroupItem
                      key={entry}
                      label={intl.formatMessage(messages.label, {
                        type: entry,
                      })}
                      value={entry}
                      isChecked={isChecked}
                      addItem={addItem}
                      removeItem={removeItem}
                      isReadOnly={isReadOnly}
                    />
                  );
                })}
              </CheckboxGroup>
            </Card>
          </Constraints.Horizontal>
        </Grid.Item>
      </Grid>
    </Constraints.Horizontal>
  );
};
export default SubscriptionChangesForm;
