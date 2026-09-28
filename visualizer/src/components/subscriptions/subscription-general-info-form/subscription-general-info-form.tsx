import { useField } from 'formik';
import { FormattedMessage } from 'react-intl';
import { FC, ReactNode } from 'react';
import { FormField, TextInput } from '@commercetools/nimbus';
import messages from './messages';

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
  const [keyField, keyMeta, keyHelpers] = useField<string>('key');
  // The key validation lives in subscription-details-form.tsx's top-level
  // useFormik `validate`, which sets errors as plain objects (e.g.
  // `{ invalidInput: true }`) rather than the string Formik's `FieldMetaProps`
  // type expects — same shape graphQLErrorHandler's `setErrors` uses for the
  // server-side `duplicate` error.
  const keyError = keyMeta.error as unknown as
    | Record<string, boolean>
    | undefined;
  const parsedErrorKey = keyError ? Object.keys(keyError)[0] : undefined;
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
          width={'full'}
        />
      </FormField.Input>
      <FormField.Error>{renderKeyInputError(parsedErrorKey)}</FormField.Error>
    </FormField.Root>
  );
};

export default SubscriptionGeneralInfoForm;
