import { FC, useRef } from 'react';
import { useIntl } from 'react-intl';
import { Formik } from 'formik';
import { CustomFormModalPage } from '@commercetools-frontend/application-components';
import { RevertIcon } from '@commercetools-uikit/icons';
import messages from './messages';

const initializeEmptyValues = () => ({
  type: {
    name: 'String',
    referenceTypeId: '',
  },
  isSet: false,
  name: '',
  label: {
    en: '',
  },
  required: false,
  inputHint: 'SingleLine',
});

// TODO: edit existing
const initializeFieldValues = (field: any) => ({});

type Props = {
  isOpen: boolean;
  onSubmit: (values: any) => void;
  onClose: (event: any) => void;
  existingFieldDefinition?: any;
};

const FieldDefinitionInput: FC<Props> = (props) => {
  const intl = useIntl();
  const initialValues = props.existingFieldDefinition
    ? initializeFieldValues(props.existingFieldDefinition)
    : initializeEmptyValues();
  // const stringSchema = yup
  //   .string()
  //   .required(<FormattedMessage {...messages.requiredFieldError} />);

  // const validationSchema = yup.object({
  //   name: yup
  //     .string()
  //     .min(2)
  //     .max(36)
  //     .matches(
  //       /^[A-Za-z0-9_-]+$/,
  //       'Field Name must contain only letters, digits, "_" or "-" and no spaces!'
  //     ),
  //   label: stringSchema,
  //   required: yup.boolean(),
  //   type: yup.object(),
  //   inputHint: stringSchema,
  // });
  const formRef = useRef();

  const handleSubmit = (event: any) => {
    event.preventDefault();
    event.stopPropagation();
    if (formRef.current) {
      //formRef.current.handleSubmit();
    }
  };
  return (
    <CustomFormModalPage
      isOpen={props.isOpen}
      title={intl.formatMessage(messages.modalTitle)}
      //subtitle={<LabelRequired />}
      onClose={props.onClose}
      topBarCurrentPathLabel={intl.formatMessage(messages.modalTitle)}
      formControls={
        <>
          <CustomFormModalPage.FormSecondaryButton
            label={intl.formatMessage(messages.revert)}
            iconLeft={<RevertIcon />}
            onClick={props.onClose}
          />
          <CustomFormModalPage.FormPrimaryButton
            label={messages.updateButton}
            onClick={handleSubmit}
          />
        </>
      }
    >
      <Formik
        enableReinitialize
        initialValues={initialValues}
        // validationSchema={validationSchema}
        onSubmit={(values) => props.onSubmit(values)}
        // innerRef={formRef}
      >
        {/* {(props) => <FieldDefinitionForm {...props} />} */}
      </Formik>
      {/* <PageBottomSpacer /> */}
    </CustomFormModalPage>
  );
};

FieldDefinitionInput.displayName = 'FieldDefinitionInput';

export default FieldDefinitionInput;
