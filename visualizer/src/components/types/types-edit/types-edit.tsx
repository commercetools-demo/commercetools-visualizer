import { FC, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { useShowNotification } from '@commercetools-frontend/actions-global';
import { PageNotFound } from '@commercetools-frontend/application-components';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import {
  Alert,
  Button,
  Flex,
  LoadingSpinner,
  LocalizedField,
  ModalPage,
} from '@commercetools/nimbus';
import { transformLocalizedFieldToLocalizedString } from '@commercetools-frontend/l10n';
import { DOMAINS } from '@commercetools-frontend/constants';
import { formValuesToDoc } from '../type-definition-connectors';
import { PERMISSIONS } from '../../../constants';
import TypesForm, { TFormValues } from '../types-form/types-form';
import formMessages from '../types-form/messages';

import messages from './messages';
import {
  calculateTypeDefinitionUpdateActions,
  getErrorMessage,
  graphQLErrorHandler,
  useTypeDefinitionDeleter,
  useTypeDefinitionFetcher,
  useTypeDefinitionUpdater,
} from '../../../hooks';
import { FormikHelpers } from 'formik';

type Props = {
  linkToHome: string;
  onClose: () => void;
};

const TypesEdit: FC<Props> = ({ linkToHome, onClose }) => {
  const intl = useIntl();
  const { projectLanguages } = useApplicationContext((context) => ({
    projectLanguages: context.project?.languages ?? [],
  }));
  const { id } = useParams<{ id: string }>();
  const showNotification = useShowNotification();
  const typeDefinitionUpdater = useTypeDefinitionUpdater();
  const typeDefinitionDeleter = useTypeDefinitionDeleter();
  const canManage = useIsAuthorized({
    demandedPermissions: [PERMISSIONS.Manage],
  });

  const { typeDefinition, error, loading, refetch } = useTypeDefinitionFetcher({
    id: id,
  });

  const handleSubmit = useCallback(
    async (
      formikValues: TFormValues,
      formikHelpers: FormikHelpers<TFormValues>
    ) => {
      const data = formValuesToDoc(formikValues);
      if (typeDefinition) {
        const updateActions = calculateTypeDefinitionUpdateActions(
          typeDefinition,
          data
        );
        if (updateActions.length > 0) {
          await typeDefinitionUpdater
            .execute({
              id: typeDefinition.id,
              version: typeDefinition.version,
              actions: updateActions,
            })
            .then(() => {
              showNotification({
                kind: 'success',
                domain: DOMAINS.SIDE,
                text: intl.formatMessage(messages.updateSuccess),
              });
            })
            .catch(graphQLErrorHandler(showNotification, formikHelpers));
        }
      }
    },
    [intl, showNotification, typeDefinition, typeDefinitionUpdater]
  );

  const handleDelete = async () => {
    if (typeDefinition) {
      await typeDefinitionDeleter
        .execute({
          id: typeDefinition.id,
          version: typeDefinition.version,
        })
        .then(() => {
          showNotification({
            kind: 'success',
            domain: DOMAINS.SIDE,
            text: intl.formatMessage(messages.updateSuccess),
          });
          onClose();
        })
        .catch(graphQLErrorHandler(showNotification));
    }
  };

  if (error) {
    return (
      <Alert.Root colorPalette="critical">
        <Alert.Title>{intl.formatMessage(messages.title)}</Alert.Title>
        <Alert.Description>{getErrorMessage(error)}</Alert.Description>
      </Alert.Root>
    );
  }
  if (loading) {
    return (
      <Flex justifyContent="center" padding="600">
        <LoadingSpinner aria-label={intl.formatMessage(messages.title)} />
      </Flex>
    );
  }
  if (!typeDefinition) {
    return <PageNotFound />;
  }

  return (
    <TypesForm
      initialValues={{
        id: typeDefinition.id,
        key: typeDefinition.key,
        name: LocalizedField.createLocalizedString(
          projectLanguages,
          transformLocalizedFieldToLocalizedString(
            typeDefinition.nameAllLocales ?? []
          ) ?? {}
        ),
        description: LocalizedField.createLocalizedString(
          projectLanguages,
          transformLocalizedFieldToLocalizedString(
            typeDefinition.descriptionAllLocales ?? []
          ) ?? {}
        ),
        resourceTypeIds: typeDefinition.resourceTypeIds,
        fieldDefinitions: typeDefinition.fieldDefinitions,
      }}
      onSubmit={handleSubmit}
      linkToHome={linkToHome}
      version={typeDefinition.version}
      refetch={refetch}
    >
      {(formProps) => (
        <ModalPage.Root isOpen onClose={onClose}>
          <ModalPage.TopBar
            previousPathLabel={intl.formatMessage(messages.backButton)}
            currentPathLabel={intl.formatMessage(messages.title)}
          />
          <ModalPage.Header>
            <ModalPage.Title>
              {intl.formatMessage(messages.title)}
            </ModalPage.Title>
          </ModalPage.Header>
          <ModalPage.Content>{formProps.formElements}</ModalPage.Content>
          <ModalPage.Footer>
            <Button slot="close" variant="outline" onPress={onClose}>
              {intl.formatMessage(formMessages.cancelButton)}
            </Button>
            <Button
              variant="outline"
              isDisabled={!formProps.isDirty}
              onPress={formProps.handleReset}
            >
              {intl.formatMessage(formMessages.revertButton)}
            </Button>
            <Button
              colorPalette="primary"
              variant="solid"
              isDisabled={
                formProps.isSubmitting || !formProps.isDirty || !canManage
              }
              onPress={() => formProps.submitForm()}
            >
              {intl.formatMessage(formMessages.submitButton)}
            </Button>
            <Button
              colorPalette="critical"
              variant="outline"
              isDisabled={!canManage}
              onPress={() => handleDelete()}
            >
              {intl.formatMessage(formMessages.deleteButton)}
            </Button>
          </ModalPage.Footer>
        </ModalPage.Root>
      )}
    </TypesForm>
  );
};
TypesEdit.displayName = 'EditType';

export default TypesEdit;
