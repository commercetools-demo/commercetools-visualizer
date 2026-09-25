import { FC } from 'react';
import { useField } from 'formik';
import { FormattedMessage } from 'react-intl';
import { FormField, Heading, Select, TextInput } from '@commercetools/nimbus';
import messages from './messages';
import { validateInput } from './validate';

type Props = {
  isReadOnly?: boolean;
};

const AUTHENTICATION_MODES = [
  { id: 'IAM', label: 'IAM' },
  { id: 'Credentials', label: 'Credentials' },
];

const SQSDestination: FC<Props> = ({ isReadOnly }) => {
  const [accessKeyField, accessKeyMeta, accessKeyHelpers] = useField<string>({
    name: 'destination.SQS.accessKey',
  });

  const [accessSecretField, accessSecretMeta, accessSecretHelpers] =
    useField<string>({
      name: 'destination.SQS.accessSecret',
    });

  const [queueUrlField, queueUrlMeta, queueUrlHelpers] = useField<string>({
    name: 'destination.SQS.queueUrl',
    validate: validateInput,
  });

  const [regionField, regionMeta, regionHelpers] = useField<string>({
    name: 'destination.SQS.region',
    validate: validateInput,
  });

  const [
    authenticationModeField,
    authenticationModeMeta,
    authenticationModeHelpers,
  ] = useField<string>({
    name: 'destination.SQS.authenticationMode',
    validate: validateInput,
  });

  return (
    <>
      <Heading as="h3" size="sm">
        <FormattedMessage {...messages.configureSQSHeading} />
      </Heading>
      <FormField.Root
        isRequired
        isReadOnly={isReadOnly}
        isInvalid={Boolean(
          authenticationModeMeta.touched && authenticationModeMeta.error
        )}
      >
        <FormField.Label>
          <FormattedMessage {...messages.destinationSQSAuthenticationMode} />
        </FormField.Label>
        <FormField.Input>
          <Select.Root
            name={authenticationModeField.name}
            isReadOnly={isReadOnly}
            value={authenticationModeMeta.value || ''}
            onChange={(value) =>
              authenticationModeHelpers.setValue(value || '')
            }
            onBlur={() => authenticationModeHelpers.setTouched(true)}
          >
            <Select.Options>
              {AUTHENTICATION_MODES.map((mode) => (
                <Select.Option key={mode.id} id={mode.id}>
                  {mode.label}
                </Select.Option>
              ))}
            </Select.Options>
          </Select.Root>
        </FormField.Input>
        <FormField.Error>
          {authenticationModeMeta.touched && authenticationModeMeta.error ? (
            <FormattedMessage {...messages.requiredFieldError} />
          ) : null}
        </FormField.Error>
      </FormField.Root>
      {authenticationModeField.value &&
        authenticationModeField.value === 'Credentials' && (
          <>
            <FormField.Root
              isRequired
              isReadOnly={isReadOnly}
              isInvalid={Boolean(accessKeyMeta.touched && accessKeyMeta.error)}
            >
              <FormField.Label>
                <FormattedMessage {...messages.destinationSQSAccessKey} />
              </FormField.Label>
              <FormField.Input>
                <TextInput
                  name={accessKeyField.name}
                  value={accessKeyMeta.value || ''}
                  isReadOnly={isReadOnly}
                  onBlur={() => accessKeyHelpers.setTouched(true)}
                  onChange={(value) => accessKeyHelpers.setValue(value)}
                />
              </FormField.Input>
              <FormField.Error>
                {accessKeyMeta.touched && accessKeyMeta.error ? (
                  <FormattedMessage {...messages.requiredFieldError} />
                ) : null}
              </FormField.Error>
            </FormField.Root>
            <FormField.Root
              isRequired
              isReadOnly={isReadOnly}
              isInvalid={Boolean(
                accessSecretMeta.touched && accessSecretMeta.error
              )}
            >
              <FormField.Label>
                <FormattedMessage {...messages.destinationSQSAccessSecret} />
              </FormField.Label>
              <FormField.Input>
                <TextInput
                  name={accessSecretField.name}
                  value={accessSecretMeta.value || ''}
                  isReadOnly={isReadOnly}
                  onBlur={() => accessSecretHelpers.setTouched(true)}
                  onChange={(value) => accessSecretHelpers.setValue(value)}
                />
              </FormField.Input>
              <FormField.Error>
                {accessSecretMeta.touched && accessSecretMeta.error ? (
                  <FormattedMessage {...messages.requiredFieldError} />
                ) : null}
              </FormField.Error>
            </FormField.Root>
          </>
        )}

      <FormField.Root
        isRequired
        isReadOnly={isReadOnly}
        isInvalid={Boolean(queueUrlMeta.touched && queueUrlMeta.error)}
      >
        <FormField.Label>
          <FormattedMessage {...messages.destinationSQSQueueUrl} />
        </FormField.Label>
        <FormField.Input>
          <TextInput
            name={queueUrlField.name}
            value={queueUrlMeta.value || ''}
            isReadOnly={isReadOnly}
            onBlur={() => queueUrlHelpers.setTouched(true)}
            onChange={(value) => queueUrlHelpers.setValue(value)}
          />
        </FormField.Input>
        <FormField.Error>
          {queueUrlMeta.touched && queueUrlMeta.error ? (
            <FormattedMessage {...messages.requiredFieldError} />
          ) : null}
        </FormField.Error>
      </FormField.Root>
      <FormField.Root
        isRequired
        isReadOnly={isReadOnly}
        isInvalid={Boolean(regionMeta.touched && regionMeta.error)}
      >
        <FormField.Label>
          <FormattedMessage {...messages.destinationSQSRegion} />
        </FormField.Label>
        <FormField.Input>
          <TextInput
            name={regionField.name}
            value={regionMeta.value || ''}
            isReadOnly={isReadOnly}
            onBlur={() => regionHelpers.setTouched(true)}
            onChange={(value) => regionHelpers.setValue(value)}
          />
        </FormField.Input>
        <FormField.Error>
          {regionMeta.touched && regionMeta.error ? (
            <FormattedMessage {...messages.requiredFieldError} />
          ) : null}
        </FormField.Error>
      </FormField.Root>
    </>
  );
};
export default SQSDestination;
