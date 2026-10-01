import { FC } from 'react';
import { useIntl } from 'react-intl';
import { Text } from '@commercetools/nimbus';
import { TFormValues } from '../extensions-form/extensions-form';
import ExtensionsDestinationsFormHttp from './extensions-destinations-form-http';
import { useFormikContext } from 'formik';
import ExtensionsDestinationsFormAws from './extensions-destinations-form-aws';
import ExtensionsDestinationsFormGcf from './extensions-destinations-form-gcf';
import messages from './messages';

type Props = {
  isReadOnly?: boolean;
};
const ExtensionsDestinationsForm: FC<Props> = ({ isReadOnly }) => {
  const intl = useIntl();
  const formik = useFormikContext<TFormValues>();
  let toRender = (
    <Text color="neutral.11">
      {intl.formatMessage(messages.noMappingDefined, {
        destinationType: formik.values.destinationName,
      })}
    </Text>
  );
  switch (formik.values.destinationName) {
    case 'HTTP':
      toRender = <ExtensionsDestinationsFormHttp isReadOnly={isReadOnly} />;
      break;
    case 'AWSLambda':
      toRender = <ExtensionsDestinationsFormAws isReadOnly={isReadOnly} />;
      break;
    case 'GoogleCloudFunction':
      toRender = <ExtensionsDestinationsFormGcf isReadOnly={isReadOnly} />;
      break;
  }
  return <>{toRender}</>;
};

export default ExtensionsDestinationsForm;
