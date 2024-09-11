import { FormattedMessage } from 'react-intl';
import messages from './messages';
import Constraints from '@commercetools-uikit/constraints';
import Grid from '@commercetools-uikit/grid';
import { designTokens } from '@commercetools-uikit/design-system';
import Card from '@commercetools-uikit/card';
import SelectField from '@commercetools-uikit/select-field';
import { useField } from 'formik';

export const validateKeyInput = (key: string) => {
  const hasKeyValue = Boolean(key);
  if (!hasKeyValue) {
    return JSON.stringify({ missing: true });
  }
  return undefined;
};
const SubscriptionDestinationTypeForm = () => {
  const [keyField, keyMeta, keyHelpers] = useField<string>({
    name: 'destinationType',
    validate: (key) => validateKeyInput(key),
  });
  return (
    <Constraints.Horizontal max="scale">
      <Grid
        gridGap={designTokens.spacing50}
        gridTemplateColumns={`repeat(auto-fill, '')`}
      >
        <Grid.Item>
          <Constraints.Horizontal max="scale">
            <Card insetScale="s" type="flat">
              <SelectField
                title={<FormattedMessage {...messages.destinationLabel} />}
                description={
                  <FormattedMessage {...messages.destinationDescription} />
                }
                errors={JSON.parse(keyMeta.error || '{}')}
                name={keyField.name}
                isRequired={true}
                horizontalConstraint={10}
                isClearable={true}
                isSearchable={true}
                options={[
                  {
                    value: 'EventBridge',
                    label: (
                      <FormattedMessage
                        {...messages.destinationAWSEventBridge}
                      />
                    ),
                  },

                  {
                    value: 'sns',
                    label: <FormattedMessage {...messages.destinationSNS} />,
                  },
                  {
                    value: 'Sqs',
                    label: <FormattedMessage {...messages.destinationSQS} />,
                  },
                  {
                    value: 'AzureEventGrid',
                    label: (
                      <FormattedMessage
                        {...messages.destinationAzureEventGrid}
                      />
                    ),
                  },
                  {
                    value: 'AzureServiceBus',
                    label: (
                      <FormattedMessage
                        {...messages.destinationAzureServiceBus}
                      />
                    ),
                  },
                  {
                    value: 'GoogleCloudPubSub',
                    label: (
                      <FormattedMessage
                        {...messages.destinationGoogleCloudPubSub}
                      />
                    ),
                  },
                ]}
                value={keyMeta.value || ''}
                onBlur={() => {
                  keyHelpers.setTouched(true);
                }}
                onChange={(event) => {
                  keyHelpers.setValue(event.target.value as string);
                }}
                touched={keyMeta.touched}
                // renderError={renderError}
              />
            </Card>
          </Constraints.Horizontal>
        </Grid.Item>
      </Grid>
    </Constraints.Horizontal>
  );
};

export default SubscriptionDestinationTypeForm;
