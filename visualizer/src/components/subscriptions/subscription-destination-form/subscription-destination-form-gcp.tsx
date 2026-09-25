import { FC } from 'react';
import { useField } from 'formik';
import { FormattedMessage } from 'react-intl';
import { FormField, Heading, TextInput } from '@commercetools/nimbus';
import messages from './messages';
import { validateInput } from './validate';

type Props = {
  isReadOnly?: boolean;
};

const GoogleCloudPubSubDestination: FC<Props> = ({ isReadOnly }) => {
  const [topicField, topicMeta, topicHelpers] = useField<string>({
    name: 'destination.GoogleCloudPubSub.topic',
    validate: validateInput,
  });
  const [projectIdField, projectIdMeta, projectIdHelpers] = useField<string>({
    name: 'destination.GoogleCloudPubSub.projectId',
    validate: validateInput,
  });
  return (
    <>
      <Heading as="h3" size="sm">
        Configure GCP Pub/Sub Destination
      </Heading>
      <FormField.Root
        isRequired
        isReadOnly={isReadOnly}
        isInvalid={Boolean(topicMeta.touched && topicMeta.error)}
      >
        <FormField.Label>
          <FormattedMessage {...messages.destinationGoogleCloudPubSubTopic} />
        </FormField.Label>
        <FormField.Input>
          <TextInput
            name={topicField.name}
            value={topicMeta.value || ''}
            isReadOnly={isReadOnly}
            onBlur={() => topicHelpers.setTouched(true)}
            onChange={(value) => topicHelpers.setValue(value)}
            width={'full'}
          />
        </FormField.Input>
        <FormField.Error>
          {topicMeta.touched && topicMeta.error ? (
            <FormattedMessage {...messages.requiredFieldError} />
          ) : null}
        </FormField.Error>
      </FormField.Root>
      <FormField.Root
        isRequired
        isReadOnly={isReadOnly}
        isInvalid={Boolean(projectIdMeta.touched && projectIdMeta.error)}
      >
        <FormField.Label>
          <FormattedMessage
            {...messages.destinationGoogleCloudPubSubprojectId}
          />
        </FormField.Label>
        <FormField.Input>
          <TextInput
            name={projectIdField.name}
            value={projectIdMeta.value || ''}
            isReadOnly={isReadOnly}
            onBlur={() => projectIdHelpers.setTouched(true)}
            onChange={(value) => projectIdHelpers.setValue(value)}
            width={'full'}
          />
        </FormField.Input>
        <FormField.Error>
          {projectIdMeta.touched && projectIdMeta.error ? (
            <FormattedMessage {...messages.requiredFieldError} />
          ) : null}
        </FormField.Error>
      </FormField.Root>
    </>
  );
};

export default GoogleCloudPubSubDestination;
