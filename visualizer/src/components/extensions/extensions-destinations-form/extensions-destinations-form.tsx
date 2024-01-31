import { FC } from 'react';
import { TFormValues } from '../extensions-form/extensions-form';
import ExtensionsDestinationsFormHttp from './extensions-destinations-form-http';
import { useFormik } from 'formik';
import ExtensionsDestinationsFormAws from './extensions-destinations-form-aws';

type Props = {
  formik: ReturnType<typeof useFormik<TFormValues>>;
};
const ExtensionsDestinationsForm: FC<Props> = ({ formik }) => {
  let toRender = (
    <div>No mapping defined so far for {formik.values.destinationName}</div>
  );
  switch (formik.values.destinationName) {
    case 'HTTP':
      toRender = <ExtensionsDestinationsFormHttp formik={formik} />;
      break;
    case 'AWSLambda':
      toRender = <ExtensionsDestinationsFormAws formik={formik} />;
      break;
  }
  return <>{toRender}</>;
};

export default ExtensionsDestinationsForm;
