import { FC, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { useShowNotification } from '@commercetools-frontend/actions-global';
import Text from '@commercetools-uikit/text';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import Spacings from '@commercetools-uikit/spacings';
import {
  CustomFormDetailPage,
  CustomFormModalPage,
  FormModalPage,
  PageNotFound,
} from '@commercetools-frontend/application-components';
import { ContentNotification } from '@commercetools-uikit/notifications';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import LocalizedTextInput from '@commercetools-uikit/localized-text-input';
import { transformLocalizedFieldToLocalizedString } from '@commercetools-frontend/l10n';
import { DOMAINS } from '@commercetools-frontend/constants';
import { formValuesToDoc } from '../type-definition-connectors';
import { PERMISSIONS } from '../../../constants';
import TypesForm, { TFormValues } from '../types-form/types-form';

import messages from './messages';
import {
  calculateTypeDefinitionUpdateActions,
  getErrorMessage,
  graphQLErrorHandler,
  useTypeDefinitionDeleter,
  useTypeDefinitionFetcher,
  useTypeDefinitionUpdater,
} from 'commercetools-demo-shared-data-fetching-hooks';

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
    async (formikValues: TFormValues, formikHelpers) => {
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
              return refetch();
            })
            .catch(graphQLErrorHandler(showNotification, formikHelpers));
        }
      }
    },
    [intl, refetch, showNotification, typeDefinition, typeDefinitionUpdater]
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
  if (!typeDefinition) {
    return <PageNotFound />;
  }

  return (
    <TypesForm
      initialValues={{
        id: typeDefinition.id,
        key: typeDefinition.key,
        name: LocalizedTextInput.createLocalizedString(
          projectLanguages,
          transformLocalizedFieldToLocalizedString(
            typeDefinition.nameAllLocales ?? []
          ) ?? {}
        ),
        description: LocalizedTextInput.createLocalizedString(
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
      {(formProps) => {
        return (
          <CustomFormModalPage
            isOpen
            title={intl.formatMessage(messages.title)}
            onClose={onClose}
            formControls={
              <>
                <CustomFormDetailPage.FormSecondaryButton
                  label={FormModalPage.Intl.revert}
                  isDisabled={!formProps.isDirty}
                  onClick={formProps.handleReset}
                />
                <CustomFormDetailPage.FormPrimaryButton
                  isDisabled={
                    formProps.isSubmitting || !formProps.isDirty || !canManage
                  }
                  onClick={() => formProps.submitForm()}
                  label={FormModalPage.Intl.save}
                />
                <CustomFormModalPage.FormDeleteButton
                  onClick={() => handleDelete()}
                />
              </>
            }
          >
            {typeDefinition && formProps.formElements}
          </CustomFormModalPage>
        );
      }}
    </TypesForm>
  );
};
TypesEdit.displayName = 'EditType';

export default TypesEdit;
