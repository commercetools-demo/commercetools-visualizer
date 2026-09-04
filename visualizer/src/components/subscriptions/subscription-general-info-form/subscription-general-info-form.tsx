import { useField } from 'formik';
import { FormattedMessage } from 'react-intl';
import { FC, ReactNode } from 'react';
import { FormField, TextInput } from '@commercetools/nimbus';
import messages from './messages';

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

const renderKeyInputError = (key?: string): ReactNode => {
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
  let parsedErrorKey: string | undefined;
  if (keyMeta.error) {
    parsedErrorKey = Object.keys(JSON.parse(keyMeta.error || '{}'))[0];
  }
  return (
    <FormField.Root
      isRequired
      isReadOnly={isReadOnly}
      isInvalid={Boolean(keyMeta.touched && parsedErrorKey)}
    >
      <FormField.Label>
        <FormattedMessage {...messages.subscriptionKeyLabel} />
      </FormField.Label>
      <FormField.Input>
        <TextInput
          name={keyField.name}
          value={keyMeta.value || ''}
          isReadOnly={isReadOnly}
          onBlur={() => keyHelpers.setTouched(true)}
          onChange={(value) => keyHelpers.setValue(value)}
        />
      </FormField.Input>
      <FormField.Error>{renderKeyInputError(parsedErrorKey)}</FormField.Error>
    </FormField.Root>
  );
};

export default SubscriptionGeneralInfoForm;
