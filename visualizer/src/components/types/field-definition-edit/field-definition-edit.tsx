import { FC, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';
import { PageNotFound } from '@commercetools-frontend/application-components';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import { useShowNotification } from '@commercetools-frontend/actions-global';
import { DOMAINS } from '@commercetools-frontend/constants';
import {
  Alert,
  Button,
  Flex,
  LoadingSpinner,
  ModalPage,
} from '@commercetools/nimbus';
import { PERMISSIONS } from '../../../constants';
import messages from '../field-definition-input/messages';
import FieldDefinitionInput from '../field-definition-input/field-definition-input';
import {
  fromFormValuesToTFieldDefinitionInput,
  initialValuesFromFieldDefinition,
  TFormValues,
} from '../field-definition-input/helpers';
import {
  useTypeWithDefinitionByNameFetcher,
  graphQLErrorHandler,
  useTypeDefinitionUpdater,
  getErrorMessage,
  calculateFieldDefinitionUpdateActions,
} from '../../../hooks';
import { FormikHelpers } from 'formik';

type Props = {
  onClose: () => void;
};

const FieldDefinitionEdit: FC<Props> = ({ onClose }) => {
  const { id, fieldDefinitionName } = useParams<{
    id: string;
    fieldDefinitionName: string;
  }>();
  const showNotification = useShowNotification();

  const canManage = useIsAuthorized({
    demandedPermissions: [PERMISSIONS.Manage],
  });

  const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
    projectLanguages: context.project?.languages ?? [],
  }));
  const intl = useIntl();

  const typeDefinitionUpdater = useTypeDefinitionUpdater();

  const { fieldDefinitions, error, loading, version, refetch } =
    useTypeWithDefinitionByNameFetcher({
      id: id,
      includeNames: [fieldDefinitionName],
    });

  const handleSubmit = useCallback(
    async (
      formikValues: TFormValues,
      formikHelpers: FormikHelpers<TFormValues>
    ) => {
      const fieldDefinitionInput =
        fromFormValuesToTFieldDefinitionInput(formikValues);
      if (fieldDefinitions) {
        const actions = calculateFieldDefinitionUpdateActions(
          fieldDefinitions[0],
          fieldDefinitionInput
        );
        if (actions.length > 0) {
          await typeDefinitionUpdater
            .execute({
              id: id,
              version: version || 1,
              actions: actions,
            })
            .then(async () => {
              await refetch();
              showNotification({
                kind: 'success',
                domain: DOMAINS.SIDE,
                text: intl.formatMessage(messages.fieldDefinitionUpdated, {}),
              });
            })
            .catch(graphQLErrorHandler(showNotification, formikHelpers));
        }
      }
    },
    [fieldDefinitions, id, intl, refetch, typeDefinitionUpdater, version]
  );

  if (error) {
    return (
      <Alert.Root colorPalette="critical">
        <Alert.Title>{intl.formatMessage(messages.modalTitle)}</Alert.Title>
        <Alert.Description>{getErrorMessage(error)}</Alert.Description>
      </Alert.Root>
    );
  }
  if (loading) {
    return (
      <Flex justifyContent="center" padding="600">
        <LoadingSpinner aria-label={intl.formatMessage(messages.modalTitle)} />
      </Flex>
    );
  }
  if (!fieldDefinitions || fieldDefinitions.length < 1) {
    return <PageNotFound />;
  }

  return (
    <FieldDefinitionInput
      initialValues={initialValuesFromFieldDefinition(
        fieldDefinitions[0],
        projectLanguages
      )}
      onSubmit={handleSubmit}
      dataLocale={dataLocale}
    >
      {(formProps) => (
        <ModalPage.Root isOpen onClose={onClose}>
          <ModalPage.TopBar
            previousPathLabel={intl.formatMessage(messages.modalTitle)}
            currentPathLabel={intl.formatMessage(messages.updateButton)}
          />
          <ModalPage.Header>
            <ModalPage.Title>
              {intl.formatMessage(messages.modalTitle)}
            </ModalPage.Title>
          </ModalPage.Header>
          <ModalPage.Content>{formProps.formElements}</ModalPage.Content>
          <ModalPage.Footer>
            <Button slot="close" variant="outline" onPress={onClose}>
              {intl.formatMessage(messages.revert)}
            </Button>
            <Button
              colorPalette="primary"
              variant="solid"
              isDisabled={
                formProps.isSubmitting || !formProps.isDirty || !canManage
              }
              onPress={() => formProps.submitForm()}
            >
              {intl.formatMessage(messages.updateButton)}
            </Button>
          </ModalPage.Footer>
        </ModalPage.Root>
      )}
    </FieldDefinitionInput>
  );
};

FieldDefinitionEdit.displayName = 'FieldDefinitionInput';

export default FieldDefinitionEdit;
