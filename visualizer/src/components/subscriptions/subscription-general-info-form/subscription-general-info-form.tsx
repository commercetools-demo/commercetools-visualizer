import { useField } from 'formik';
import TextField from '@commercetools-uikit/text-field';
import messages from './messages';
import { FormattedMessage } from 'react-intl';
import Constraints from '@commercetools-uikit/constraints';
import Grid from '@commercetools-uikit/grid';
import { designTokens } from '@commercetools-uikit/design-system';
import Card from '@commercetools-uikit/card';
import { FC } from 'react';

export const validateKeyInput = (key: string) => {
  const hasKeyValue = Boolean(key);
  if (hasKeyValue) {
    const keyValue = key.trim();
    const keyLength = keyValue.length;
    if (keyLength < 2 || keyLength > 256 || !/^[a-zA-Z0-9-_]+$/.test(keyValue))
      return JSON.stringify({ invalidInput: true });
  } else {
    return JSON.stringify({ missing: true });
  }
  return undefined;
};

const renderBusinessUnitKeyInputErrors = (key: string) => {
  switch (key) {
    case 'invalidInput':
      return <FormattedMessage {...messages.invalidKey} />;
    case 'duplicate':
      return <FormattedMessage {...messages.duplicateKey} />;
    case 'missing':
      return <FormattedMessage {...messages.requiredKey} />;
    default:
      return null;
  }
};

type Props = { isReadOnly?: boolean };

const SubscriptionGeneralInfoForm: FC<Props> = ({ isReadOnly }) => {
  const [keyField, keyMeta, keyHelpers] = useField<string>({
    name: 'key',
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
              <TextField
                errors={JSON.parse(keyMeta.error || '{}')}
                name={keyField.name}
                isRequired={true}
                onBlur={() => {
                  keyHelpers.setTouched(true);
                }}
                onChange={(event) => {
                  keyHelpers.setValue(event.target.value);
                }}
                renderError={renderBusinessUnitKeyInputErrors}
                title={<FormattedMessage {...messages.subscriptionKeyLabel} />}
                touched={keyMeta.touched}
                value={keyMeta.value || ''}
                isReadOnly={isReadOnly}
              />
            </Card>
          </Constraints.Horizontal>
        </Grid.Item>
      </Grid>
    </Constraints.Horizontal>
  );
};

export default SubscriptionGeneralInfoForm;
