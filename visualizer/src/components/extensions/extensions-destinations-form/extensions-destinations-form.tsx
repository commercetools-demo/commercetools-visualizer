import { FC } from 'react';
import { Text } from '@commercetools/nimbus';
import { TFormValues } from '../extensions-form/extensions-form';
import ExtensionsDestinationsFormHttp from './extensions-destinations-form-http';
import { useFormik } from 'formik';
import ExtensionsDestinationsFormAws from './extensions-destinations-form-aws';

type Props = {
  formik: ReturnType<typeof useFormik<TFormValues>>;
  isReadOnly?: boolean;
};
const ExtensionsDestinationsForm: FC<Props> = ({ formik, isReadOnly }) => {
  let toRender = (
    <Text color="neutral.11">
      No mapping defined so far for {formik.values.destinationName}
    </Text>
  );
  switch (formik.values.destinationName) {
    case 'HTTP':
      toRender = (
        <ExtensionsDestinationsFormHttp
          formik={formik}
          isReadOnly={isReadOnly}
        />
      );
      break;
    case 'AWSLambda':
      toRender = (
        <ExtensionsDestinationsFormAws
          formik={formik}
          isReadOnly={isReadOnly}
        />
      );
      break;
  }
  return <>{toRender}</>;
};

export default ExtensionsDestinationsForm;
