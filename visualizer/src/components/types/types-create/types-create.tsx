import { FC, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useShowNotification } from '@commercetools-frontend/actions-global';
import { FormModalPage } from '@commercetools-frontend/application-components';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import LocalizedTextInput from '@commercetools-uikit/localized-text-input';
import {
  transformLocalizedFieldToLocalizedString,
  transformLocalizedStringToLocalizedField,
} from '@commercetools-frontend/l10n';
import { DOMAINS } from '@commercetools-frontend/constants';
import { PERMISSIONS } from '../../../constants';
import TypesForm from '../types-form/types-form';

import { TTypeDefinitionDraft } from '../../../types/generated/ctp';
import messages from './messages';
import { useTypeDefinitionCreator } from '../../../hooks/use-types-connector';
import { graphQLErrorHandler } from '../../../utils/error-handling';

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
    async (formikValues, formikHelpers) => {
      const draft: TTypeDefinitionDraft = {
        key: formikValues.key,
        name: transformLocalizedStringToLocalizedField(
          LocalizedTextInput.omitEmptyTranslations(formikValues.name)
        ),
        description: transformLocalizedStringToLocalizedField(
          LocalizedTextInput.omitEmptyTranslations(formikValues.description)
        ),

        resourceTypeIds: formikValues.resourceTypeIds,
      };
      await typeDefinitionCreator
        .execute({
          draft: draft,
        })
        .then(({ data }) => {
          showNotification({
            kind: 'success',
            domain: DOMAINS.SIDE,
            text: intl.formatMessage(messages.createSuccess),
          });
          data?.createTypeDefinition?.id &&
            onCreate(data?.createTypeDefinition?.id);
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
        name: LocalizedTextInput.createLocalizedString(
          projectLanguages,
          transformLocalizedFieldToLocalizedString([]) ?? {}
        ),
        description: LocalizedTextInput.createLocalizedString(
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
      {(formProps) => {
        return (
          <FormModalPage
            title={intl.formatMessage(messages.title)}
            isOpen
            onPrimaryButtonClick={() => formProps.submitForm()}
            onSecondaryButtonClick={onClose}
            hideControls={false}
            labelPrimaryButton={intl.formatMessage(FormModalPage.Intl.save)}
            isPrimaryButtonDisabled={
              formProps.isSubmitting || !formProps.isDirty || !canManage
            }
          >
            {formProps.formElements}
          </FormModalPage>
        );
      }}
    </TypesForm>
  );
};
TypesCreate.displayName = 'NewType';

export default TypesCreate;
