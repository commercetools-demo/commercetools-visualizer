import { useFormik } from 'formik';
import TextField from '@commercetools-uikit/text-field';
import { TFormValues } from '../extensions-form/extensions-form';
import { FC } from 'react';

type Props = {
  formik: ReturnType<typeof useFormik<TFormValues>>;
};

const ExtensionsDestinationsFormAws: FC<Props> = ({ formik }) => {
  return (
    <>
      <TextField
        name="destinationAwsArn"
        isRequired
        value={formik.values.destinationAwsArn || ''}
        title={'ARN'}
        errors={
          TextField.toFieldErrors<TFormValues>(formik.errors).destinationAwsArn
        }
        touched={!!formik.touched.destinationAwsArn}
        onBlur={formik.handleBlur}
        onChange={formik.handleChange}
      />
      <TextField
        name="destinationAwsAccessKey"
        isRequired
        value={formik.values.destinationAwsAccessKey || ''}
        title={'AccessKey'}
        errors={
          TextField.toFieldErrors<TFormValues>(formik.errors)
            .destinationAwsAccessKey
        }
        touched={!!formik.touched.destinationAwsAccessKey}
        onBlur={formik.handleBlur}
        onChange={formik.handleChange}
      />
      <TextField
        name="destinationAwsAccessSecret"
        isRequired
        value={formik.values.destinationAwsAccessSecret || ''}
        title={'AccessSecret'}
        errors={
          TextField.toFieldErrors<TFormValues>(formik.errors)
            .destinationAwsAccessSecret
        }
        touched={!!formik.touched.destinationAwsAccessSecret}
        onBlur={formik.handleBlur}
        onChange={formik.handleChange}
      />
    </>
  );
};

export default ExtensionsDestinationsFormAws;
