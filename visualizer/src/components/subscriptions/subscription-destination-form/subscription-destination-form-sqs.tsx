import TextField from '@commercetools-uikit/text-field';
import { FC } from 'react';
import { useField } from 'formik';
import Text from '@commercetools-uikit/text';
import { FormattedMessage } from 'react-intl';
import messages from './messages';
import { validateInput } from './validate';
import SelectField from '@commercetools-uikit/select-field';

type Props = {
    isReadOnly?: boolean;
};

const SQSDestination: FC<Props> = ({ isReadOnly }) => {
    const [accessKeyField, accessKeyMeta, accessKeyHelpers] = useField<string>({
        name: 'destination.SQS.accessKey',
    });

    const [accessSecretField, accessSecretMeta, accessSecretHelpers] = useField<string>({
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

    const [authenticationModeField, authenticationModeMeta, authenticationModeHelpers] = useField<string>({
        name: 'destination.SQS.authenticationMode',
        validate: validateInput,
    });

    return (
        <>
            <Text.Headline as="h3">Configure AWS SQS Destination</Text.Headline>
            <SelectField
                errors={JSON.parse(authenticationModeMeta.error || '{}')}
                name={authenticationModeField.name}
                options={[
                    {
                        value: "IAM", label: "IAM",
                    },
                    {
                        value: "Credentials", label: "Credentials"
                    }
                ]}
                isRequired={true}
                onBlur={() => {
                    authenticationModeHelpers.setTouched(true);
                }}
                onChange={(event) => {
                    authenticationModeHelpers.setValue(event.target.value as string);
                }}
                title={
                    <FormattedMessage
                        {...messages.destinationSQSAuthenticationMode}
                    />
                }
                touched={authenticationModeMeta.touched}
                value={authenticationModeMeta.value || ''}
                isReadOnly={isReadOnly}
            />
            {authenticationModeField.value &&
                authenticationModeField.value === "Credentials" &&
                (
                    <>
                        <TextField
                            errors={JSON.parse(accessKeyMeta.error || '{}')}
                            name={accessKeyField.name}
                            isRequired={true}
                            onBlur={() => {
                                accessKeyHelpers.setTouched(true);
                            }}
                            onChange={(event) => {
                                accessKeyHelpers.setValue(event.target.value);
                            }}
                            title={
                                <FormattedMessage {...messages.destinationSQSAccessKey} />
                            }
                            touched={accessKeyMeta.touched}
                            value={accessKeyMeta.value || ''}
                            isReadOnly={isReadOnly}
                        />
                        <TextField
                            errors={JSON.parse(accessSecretMeta.error || '{}')}
                            name={accessSecretField.name}
                            isRequired={true}
                            onBlur={() => {
                                accessSecretHelpers.setTouched(true);
                            }}
                            onChange={(event) => {
                                accessSecretHelpers.setValue(event.target.value);
                            }}
                            title={
                                <FormattedMessage
                                    {...messages.destinationSQSAccessSecret}
                                />
                            }
                            touched={accessSecretMeta.touched}
                            value={accessSecretMeta.value || ''}
                            isReadOnly={isReadOnly}
                        />
                    </>
                )}

            <TextField
                errors={JSON.parse(queueUrlMeta.error || '{}')}
                name={queueUrlField.name}
                isRequired={true}
                onBlur={() => {
                    queueUrlHelpers.setTouched(true);
                }}
                onChange={(event) => {
                    queueUrlHelpers.setValue(event.target.value);
                }}
                title={
                    <FormattedMessage
                        {...messages.destinationSQSQueueUrl}
                    />
                }
                touched={queueUrlMeta.touched}
                value={queueUrlMeta.value || ''}
                isReadOnly={isReadOnly}
            />
            <TextField
                errors={JSON.parse(regionMeta.error || '{}')}
                name={regionField.name}
                isRequired={true}
                onBlur={() => {
                    regionHelpers.setTouched(true);
                }}
                onChange={(event) => {
                    regionHelpers.setValue(event.target.value);
                }}
                title={
                    <FormattedMessage
                        {...messages.destinationSQSRegion}
                    />
                }
                touched={regionMeta.touched}
                value={regionMeta.value || ''}
                isReadOnly={isReadOnly}
            />
        </>
    );

}
export default SQSDestination;