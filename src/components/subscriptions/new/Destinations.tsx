import { FC } from 'react';
import { useField } from 'formik';
import GoogleCloudPubSubDestination from './GoogleCloudPubSubDestination';

type Props = {
  formik: any;
};

const Destinations: FC<Props> = ({ formik }) => {
  const [field] = useField<string>('destinationType');
  switch (field.value) {
    case 'GoogleCloudPubSub':
      return <GoogleCloudPubSubDestination formik={formik} />;
  }
  return <div>No mapping defined so far for ${field.value}</div>;
};

export default Destinations;
