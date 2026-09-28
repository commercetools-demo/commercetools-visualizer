import { useField } from 'formik';
import { FormattedMessage } from 'react-intl';
import { FC } from 'react';
import { FormField, TextInput } from '@commercetools/nimbus';
import messages from './messages';
import KeyInputError, {
  type TKeyInputError,
} from '../../shared/key-input-error/key-input-error';

type Props = { isReadOnly?: boolean };

const SubscriptionGeneralInfoForm: FC<Props> = ({ isReadOnly }) => {
  const [keyField, keyMeta, keyHelpers] = useField<string>('key');
  // The key validation lives in subscription-details-form.tsx's top-level
  // useFormik `validate`, which sets errors as plain objects (e.g.
  // `{ invalidInput: true }`) rather than the string Formik's `FieldMetaProps`
  // type expects — same shape graphQLErrorHandler's `setErrors` uses for the
  // server-side `duplicate` error.
  const keyError = keyMeta.error as unknown as TKeyInputError | undefined;
  return (
    <FormField.Root
      isRequired
      isReadOnly={isReadOnly}
      isInvalid={Boolean(keyMeta.touched && keyError)}
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
      <FormField.Error>
        <KeyInputError error={keyError} resourceLabel="subscription" />
      </FormField.Error>
    </FormField.Root>
  );
};

export default SubscriptionGeneralInfoForm;
