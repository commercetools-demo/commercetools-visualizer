import { FC, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import { useShowNotification } from '@commercetools-frontend/actions-global';
import { DOMAINS } from '@commercetools-frontend/constants';
import { Button, ModalPage } from '@commercetools/nimbus';
import { PERMISSIONS } from '../../../constants';
import messages from '../field-definition-input/messages';
import FieldDefinitionInput from '../field-definition-input/field-definition-input';
import {
  fromFormValuesToTFieldDefinitionInput,
  initialValuesFromFieldDefinition,
  TFormValues,
} from '../field-definition-input/helpers';
import { graphQLErrorHandler, useTypeDefinitionUpdater } from '../../../hooks';

type Props = {
  onClose: () => Promise<void>;
};

const FieldDefinitionCreate: FC<Props> = ({ onClose }) => {
  const { id, version } = useParams<{
    id: string;
    version: string;
  }>();

  const canManage = useIsAuthorized({
    demandedPermissions: [PERMISSIONS.Manage],
  });

  const showNotification = useShowNotification();
  const typeDefinitionUpdater = useTypeDefinitionUpdater();
  const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
    projectLanguages: context.project?.languages ?? [],
  }));
  const intl = useIntl();

  const handleSubmit = useCallback(
    async (formikValues: TFormValues, formikHelpers) => {
      const actionDraft = fromFormValuesToTFieldDefinitionInput(formikValues);
      await typeDefinitionUpdater
        .execute({
          id: id,
          version: Number(version),
          actions: [{ addFieldDefinition: { fieldDefinition: actionDraft } }],
        })
        .then(async () => {
          showNotification({
            kind: 'success',
            domain: DOMAINS.SIDE,
            text: intl.formatMessage(messages.fieldDefinitionUpdated, {}),
          });
          return onClose();
        })
        .catch(graphQLErrorHandler(showNotification, formikHelpers));
    },
    [id, typeDefinitionUpdater, version]
  );

  return (
    <FieldDefinitionInput
      initialValues={initialValuesFromFieldDefinition(
        undefined,
        projectLanguages
      )}
      onSubmit={handleSubmit}
      createNewMode={true}
      dataLocale={dataLocale}
    >
      {(formProps) => (
        <ModalPage.Root isOpen onClose={onClose}>
          <ModalPage.TopBar
            previousPathLabel={intl.formatMessage(messages.modalTitle)}
            currentPathLabel={intl.formatMessage(messages.newButton)}
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
              {intl.formatMessage(messages.newButton)}
            </Button>
          </ModalPage.Footer>
        </ModalPage.Root>
      )}
    </FieldDefinitionInput>
  );
};

FieldDefinitionCreate.displayName = 'NewFieldDefinitionInput';

export default FieldDefinitionCreate;
