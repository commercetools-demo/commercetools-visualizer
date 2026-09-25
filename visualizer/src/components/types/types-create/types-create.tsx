import { FC, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useShowNotification } from '@commercetools-frontend/actions-global';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { Button, LocalizedField, ModalPage } from '@commercetools/nimbus';
import {
  transformLocalizedFieldToLocalizedString,
  transformLocalizedStringToLocalizedField,
} from '@commercetools-frontend/l10n';
import { DOMAINS } from '@commercetools-frontend/constants';
import { PERMISSIONS } from '../../../constants';
import TypesForm, { TFormValues } from '../types-form/types-form';
import { omitEmptyTranslations } from '../type-definition-connectors';
import formMessages from '../types-form/messages';

import { TTypeDefinitionDraft } from '../../../types/generated/ctp';
import messages from './messages';
import { graphQLErrorHandler, useTypeDefinitionCreator } from '../../../hooks';
import { FormikHelpers } from 'formik';

type Props = {
  linkToHome: string;
  onClose: () => void;
  onCreate: (id: string) => void;
};

const TypesCreate: FC<Props> = ({ linkToHome, onClose, onCreate }) => {
  const intl = useIntl();
  const { projectLanguages } = useApplicationContext((context) => ({
    projectLanguages: context.project?.languages ?? [],
  }));
  const showNotification = useShowNotification();
  const typeDefinitionCreator = useTypeDefinitionCreator();
  const canManage = useIsAuthorized({
    demandedPermissions: [PERMISSIONS.Manage],
  });

  const handleSubmit = useCallback(
    async (
      formikValues: TFormValues,
      formikHelpers: FormikHelpers<TFormValues>
    ) => {
      const draft: TTypeDefinitionDraft = {
        key: formikValues.key || '',
        name: transformLocalizedStringToLocalizedField(
          omitEmptyTranslations(formikValues.name)
        ),
        description: transformLocalizedStringToLocalizedField(
          omitEmptyTranslations(formikValues.description)
        ),

        resourceTypeIds: formikValues.resourceTypeIds,
      };
      await typeDefinitionCreator
        .execute({
          draft: draft,
        })
        .then(({ createTypeDefinition }) => {
          showNotification({
            kind: 'success',
            domain: DOMAINS.SIDE,
            text: intl.formatMessage(messages.createSuccess),
          });
          createTypeDefinition?.id && onCreate(createTypeDefinition?.id);
        })
        .catch(graphQLErrorHandler(showNotification, formikHelpers));
    },
    [intl, typeDefinitionCreator]
  );

  return (
    <TypesForm
      initialValues={{
        id: '',
        key: '',
        name: LocalizedField.createLocalizedString(
          projectLanguages,
          transformLocalizedFieldToLocalizedString([]) ?? {}
        ),
        description: LocalizedField.createLocalizedString(
          projectLanguages,
          transformLocalizedFieldToLocalizedString([]) ?? {}
        ),
        resourceTypeIds: [],
        fieldDefinitions: [],
      }}
      onSubmit={handleSubmit}
      linkToHome={linkToHome}
      version={-1}
      createNewMode={true}
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
              colorPalette="primary"
              variant="solid"
              isDisabled={
                formProps.isSubmitting || !formProps.isDirty || !canManage
              }
              onPress={() => formProps.submitForm()}
            >
              {intl.formatMessage(formMessages.submitButton)}
            </Button>
          </ModalPage.Footer>
        </ModalPage.Root>
      )}
    </TypesForm>
  );
};
TypesCreate.displayName = 'NewType';

export default TypesCreate;
