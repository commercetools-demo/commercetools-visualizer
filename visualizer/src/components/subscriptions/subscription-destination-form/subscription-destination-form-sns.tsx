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

const SNSDestination: FC<Props> = ({ isReadOnly }) => {
  const [accessKeyField, accessKeyMeta, accessKeyHelpers] = useField<string>({
    name: 'destination.SNS.accessKey',
  });

  const [accessSecretField, accessSecretMeta, accessSecretHelpers] =
    useField<string>({
      name: 'destination.SNS.accessSecret',
    });

  const [topicArnField, topicArnMeta, topicArnHelpers] = useField<string>({
    name: 'destination.SNS.topicArn',
    validate: validateInput,
  });

  const [
    authenticationModeField,
    authenticationModeMeta,
    authenticationModeHelpers,
  ] = useField<string>({
    name: 'destination.SNS.authenticationMode',
    validate: validateInput,
  });

  return (
    <>
      <Heading as="h3" size="sm">
        <FormattedMessage {...messages.configureSNSHeading} />
      </Heading>
      <FormField.Root
        isRequired
        isReadOnly={isReadOnly}
        isInvalid={Boolean(
          authenticationModeMeta.touched && authenticationModeMeta.error
        )}
      >
        <FormField.Label>
          <FormattedMessage {...messages.destinationSNSAuthenticationMode} />
        </FormField.Label>
        <FormField.Input>
          <Select.Root
            name={authenticationModeField.name}
            isDisabled={isReadOnly}
            value={authenticationModeMeta.value || ''}
            onChange={(value) =>
              authenticationModeHelpers.setValue(
                value != null ? String(value) : ''
              )
            }
            onBlur={() => authenticationModeHelpers.setTouched(true)}
            width={'full'}
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
                <FormattedMessage {...messages.destinationSNSAccessKey} />
              </FormField.Label>
              <FormField.Input>
                <TextInput
                  name={accessKeyField.name}
                  value={accessKeyMeta.value || ''}
                  isReadOnly={isReadOnly}
                  onBlur={() => accessKeyHelpers.setTouched(true)}
                  onChange={(value) => accessKeyHelpers.setValue(value)}
                  width={'full'}
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
                <FormattedMessage {...messages.destinationSNSAccessSecret} />
              </FormField.Label>
              <FormField.Input>
                <TextInput
                  name={accessSecretField.name}
                  value={accessSecretMeta.value || ''}
                  isReadOnly={isReadOnly}
                  onBlur={() => accessSecretHelpers.setTouched(true)}
                  onChange={(value) => accessSecretHelpers.setValue(value)}
                  width={'full'}
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
        isInvalid={Boolean(topicArnMeta.touched && topicArnMeta.error)}
      >
        <FormField.Label>
          <FormattedMessage {...messages.destinationSNSTopicArn} />
        </FormField.Label>
        <FormField.Input>
          <TextInput
            name={topicArnField.name}
            value={topicArnMeta.value || ''}
            isReadOnly={isReadOnly}
            onBlur={() => topicArnHelpers.setTouched(true)}
            onChange={(value) => topicArnHelpers.setValue(value)}
            width={'full'}
          />
        </FormField.Input>
        <FormField.Error>
          {topicArnMeta.touched && topicArnMeta.error ? (
            <FormattedMessage {...messages.requiredFieldError} />
          ) : null}
        </FormField.Error>
      </FormField.Root>
    </>
  );
};
export default SNSDestination;
