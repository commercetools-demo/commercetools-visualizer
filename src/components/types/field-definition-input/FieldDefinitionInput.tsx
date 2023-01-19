import { FC } from 'react';
import { useIntl } from 'react-intl';
import {
  CustomFormModalPage,
  PageNotFound,
} from '@commercetools-frontend/application-components';
import { RevertIcon } from '@commercetools-uikit/icons';
import { useParams } from 'react-router-dom';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import { ContentNotification } from '@commercetools-uikit/notifications';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import LocalizedTextInput from '@commercetools-uikit/localized-text-input';
import { transformLocalizedFieldToLocalizedString } from '@commercetools-frontend/l10n';
import { useTypeWithDefinitionByNameFetcher } from '../type-definition-connectors';
import { getErrorMessage } from '../../../helpers';
import { PERMISSIONS } from '../../../constants';
import messages from './messages';
import FieldDefinitionInputForm from './FieldDefinitionInputForm';

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
  isOpen?: boolean;
  onSubmit?: (values: any) => void;
  onClose: (event: any) => void;
  existingFieldDefinition?: any;
};

const FieldDefinitionInput: FC<Props> = (props) => {
  const { id, fieldDefinitionName } = useParams<{
    id: string;
    fieldDefinitionName: string;
  }>();

  const canManage = useIsAuthorized({
    demandedPermissions: [PERMISSIONS.Manage],
  });

  const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
    projectLanguages: context.project?.languages ?? [],
  }));
  const intl = useIntl();

  const { fieldDefinitions, error, loading, refetch } =
    useTypeWithDefinitionByNameFetcher(id, [fieldDefinitionName]);

  if (error) {
    return (
      <ContentNotification type="error">
        <Text.Body>{getErrorMessage(error)}</Text.Body>
      </ContentNotification>
    );
  }
  if (loading) {
    return (
      <Spacings.Stack alignItems="center">
        <LoadingSpinner />
      </Spacings.Stack>
    );
  }
  if (!fieldDefinitions) {
    return <PageNotFound />;
  }

  const initialValues = fieldDefinitions
    ? initializeFieldValues(fieldDefinitions)
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
  // const formRef = useRef();

  const handleSubmit = (event: any) => {
    event.preventDefault();
    event.stopPropagation();
    // if (formRef.current) {
    //   //formRef.current.handleSubmit();
    // }
  };
  return (
    <FieldDefinitionInputForm
      initialValues={{
        ...fieldDefinitions[0],
        label: LocalizedTextInput.createLocalizedString(
          projectLanguages,
          transformLocalizedFieldToLocalizedString(
            fieldDefinitions[0].labelAllLocales ?? []
          ) ?? {}
        ),
        isSet: false,
        type: { name: fieldDefinitions[0].type.name, referenceTypeId: '' },
      }}
      onSubmit={handleSubmit}
      isReadOnly={!canManage}
      dataLocale={dataLocale}
    >
      {(formProps) => {
        return (
          <CustomFormModalPage
            isOpen
            onClose={props.onClose}
            title={intl.formatMessage(messages.modalTitle)}
            //subtitle={<LabelRequired />}
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
            {fieldDefinitions && formProps.formElements}
          </CustomFormModalPage>
        );
      }}
    </FieldDefinitionInputForm>
  );
};

FieldDefinitionInput.displayName = 'FieldDefinitionInput';

export default FieldDefinitionInput;
