import TextField from '@commercetools-uikit/text-field';
import { FC } from 'react';

interface Props {
  formik: any;
}

const GoogleCloudPubSubDestination: FC<Props> = ({ formik }) => {
  return (
    <>
      <div>Configure GCP Pub/Sub Destination</div>
      <TextField
        name="destination.GoogleCloudPubSub.topic"
        title="Topic"
        isRequired={true}
        value={formik.values.destination?.GoogleCloudPubSub?.topic || ''}
        horizontalConstraint={10}
        touched={formik.touched.destination?.GoogleCloudPubSub?.topic}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
      />
      <TextField
        name="destination.GoogleCloudPubSub.projectId"
        title="Project Id"
        isRequired={true}
        value={formik.values.destination?.GoogleCloudPubSub?.projectId || ''}
        horizontalConstraint={10}
        touched={formik.touched.destination?.GoogleCloudPubSub?.projectId}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
      />
    </>
  );
};

export default GoogleCloudPubSubDestination;
