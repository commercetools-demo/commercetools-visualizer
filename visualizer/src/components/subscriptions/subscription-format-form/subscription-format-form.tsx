import { FC } from 'react';
import { useFormikContext } from 'formik';
import { FormattedMessage, useIntl } from 'react-intl';
import { FormField, Select, Stack, TextInput } from '@commercetools/nimbus';
import messages from './messages';
import type { TFormValues } from '../subscription-details-form/subscription-details-form';

export const DEFAULT_CLOUD_EVENTS_VERSION = '1.0';

type Props = {
  // The delivery format is immutable once the subscription exists.
  isReadOnly?: boolean;
};

const SubscriptionFormatForm: FC<Props> = ({ isReadOnly }) => {
  const intl = useIntl();
  const { values, errors, touched, setFieldValue, setFieldTouched } =
    useFormikContext<TFormValues>();
  const formatType = values.format?.type || 'Platform';
  const versionError = (errors.format as { cloudEventsVersion?: unknown })
    ?.cloudEventsVersion;
  const versionTouched = (
    touched.format as { cloudEventsVersion?: boolean } | undefined
  )?.cloudEventsVersion;

  return (
    <Stack direction="column" gap="400">
      <FormField.Root isReadOnly={isReadOnly} isDisabled={isReadOnly}>
        <FormField.Label>
          <FormattedMessage {...messages.formatLabel} />
        </FormField.Label>
        <FormField.Input>
          <Select.Root
            name="format.type"
            value={formatType}
            onChange={(value) =>
              setFieldValue(
                'format',
                value === 'CloudEvents'
                  ? {
                      type: 'CloudEvents',
                      cloudEventsVersion: DEFAULT_CLOUD_EVENTS_VERSION,
                    }
                  : { type: 'Platform' }
              )
            }
            width={'full'}
          >
            <Select.Options>
              <Select.Option id="Platform">
                {intl.formatMessage(messages.formatPlatform)}
              </Select.Option>
              <Select.Option id="CloudEvents">
                {intl.formatMessage(messages.formatCloudEvents)}
              </Select.Option>
            </Select.Options>
          </Select.Root>
        </FormField.Input>
        <FormField.Description>
          <FormattedMessage {...messages.formatDescription} />
        </FormField.Description>
      </FormField.Root>
      {formatType === 'CloudEvents' && (
        <FormField.Root
          isRequired
          isReadOnly={isReadOnly}
          isInvalid={Boolean(versionTouched && versionError)}
        >
          <FormField.Label>
            <FormattedMessage {...messages.cloudEventsVersionLabel} />
          </FormField.Label>
          <FormField.Input>
            <TextInput
              name="format.cloudEventsVersion"
              value={values.format?.cloudEventsVersion || ''}
              isReadOnly={isReadOnly}
              onChange={(value) =>
                setFieldValue('format.cloudEventsVersion', value)
              }
              onBlur={() => setFieldTouched('format.cloudEventsVersion', true)}
              width={'full'}
            />
          </FormField.Input>
          <FormField.Error>
            {versionTouched && versionError ? (
              <FormattedMessage {...messages.cloudEventsVersionRequired} />
            ) : null}
          </FormField.Error>
        </FormField.Root>
      )}
    </Stack>
  );
};

export default SubscriptionFormatForm;
