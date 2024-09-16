import TextField from '@commercetools-uikit/text-field';
import { FC } from 'react';
import { useField } from 'formik';
import Text from '@commercetools-uikit/text';
import { FormattedMessage } from 'react-intl';
import messages from './messages';

export const validateInput = (key: string) => {
  const hasKeyValue = Boolean(key);
  if (!hasKeyValue) {
    return JSON.stringify({ missing: true });
  }
  return undefined;
};

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
      <Text.Headline as="h3">Configure GCP Pub/Sub Destination</Text.Headline>
      <TextField
        errors={JSON.parse(topicMeta.error || '{}')}
        name={topicField.name}
        isRequired={true}
        onBlur={() => {
          topicHelpers.setTouched(true);
        }}
        onChange={(event) => {
          topicHelpers.setValue(event.target.value);
        }}
        //renderError={renderBusinessUnitKeyInputErrors}
        title={
          <FormattedMessage {...messages.destinationGoogleCloudPubSubTopic} />
        }
        touched={topicMeta.touched}
        value={topicMeta.value || ''}
        isReadOnly={isReadOnly}
      />
      <TextField
        errors={JSON.parse(projectIdMeta.error || '{}')}
        name={projectIdField.name}
        isRequired={true}
        onBlur={() => {
          projectIdHelpers.setTouched(true);
        }}
        onChange={(event) => {
          projectIdHelpers.setValue(event.target.value);
        }}
        //renderError={renderBusinessUnitKeyInputErrors}
        title={
          <FormattedMessage
            {...messages.destinationGoogleCloudPubSubprojectId}
          />
        }
        touched={projectIdMeta.touched}
        value={projectIdMeta.value || ''}
        isReadOnly={isReadOnly}
      />
    </>
  );
};

export default GoogleCloudPubSubDestination;
