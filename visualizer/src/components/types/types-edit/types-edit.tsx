import { FC, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useIntl } from 'react-intl';
import {
  showApiErrorNotification,
  TApiErrorNotificationOptions,
  useShowNotification,
} from '@commercetools-frontend/actions-global';
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
import { getErrorMessage } from '../../../helpers';
import { PERMISSIONS } from '../../../constants';
import { transformErrors } from '../../subscriptions/transform-errors';
import TypesForm, { TFormValues } from '../types-form/types-form';

import messages from './messages';
import {
  useTypeDefinitionDeleter,
  useTypeDefinitionFetcher,
  useTypeDefinitionUpdater,
} from '../../../hooks/use-types-connector';

type Props = {
  linkToHome: string;
  onClose: () => void;
};

const TypesEdit: FC<Props> = ({ linkToHome, onClose }) => {
  const intl = useIntl();
  const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
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
      try {
        const data = formValuesToDoc(formikValues);
        if (typeDefinition) {
          await typeDefinitionUpdater.execute({
            originalDraft: typeDefinition,
            nextDraft: data,
          });
        }
        showNotification({
          kind: 'success',
          domain: DOMAINS.SIDE,
          text: intl.formatMessage(messages.updateSuccess),
        });
        refetch();
      } catch (graphQLErrors) {
        const transformedErrors = transformErrors(graphQLErrors);
        if (transformedErrors.unmappedErrors.length > 0) {
          showApiErrorNotification({
            errors:
              transformedErrors.unmappedErrors as TApiErrorNotificationOptions['errors'],
          });
        }

        formikHelpers.setErrors(transformedErrors.formErrors);
      }
    },
    [intl, refetch, showNotification, typeDefinition, typeDefinitionUpdater]
  );

  const handleDelete = async () => {
    if (typeDefinition) {
      await typeDefinitionDeleter.execute({
        id: typeDefinition.id,
        version: typeDefinition.version,
      });
      showNotification({
        kind: 'success',
        domain: DOMAINS.SIDE,
        text: intl.formatMessage(messages.updateSuccess),
      });
      onClose();
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
      dataLocale={dataLocale}
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
