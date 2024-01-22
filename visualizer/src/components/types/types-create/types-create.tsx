import { FC, useCallback } from 'react';
import { useIntl } from 'react-intl';
import {
  showApiErrorNotification,
  TApiErrorNotificationOptions,
  useShowNotification,
} from '@commercetools-frontend/actions-global';
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
import { transformErrors } from '../../subscriptions/transform-errors';
import TypeDefinitionForm from '../type-definition-form/type-definition-form';

import { TTypeDefinitionDraft } from '../../../types/generated/ctp';
import messages from './messages';
import { useTypeDefinitionCreator } from '../../../hooks/use-types-connector';

type Props = {
  linkToHome: string;
  onClose: () => void;
  onCreate: (id: string) => void;
};

const TypesCreate: FC<Props> = ({ linkToHome, onClose, onCreate }) => {
  const intl = useIntl();
  const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
    projectLanguages: context.project?.languages ?? [],
  }));
  const showNotification = useShowNotification();
  const typeDefinitionCreator = useTypeDefinitionCreator();
  const canManage = useIsAuthorized({
    demandedPermissions: [PERMISSIONS.Manage],
  });

  const handleSubmit = useCallback(
    async (formikValues, formikHelpers) => {
      try {
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
        const result = await typeDefinitionCreator.execute({
          draft: draft,
        });
        showNotification({
          kind: 'success',
          domain: DOMAINS.SIDE,
          text: intl.formatMessage(messages.createSuccess),
        });
        result.data?.createTypeDefinition?.id &&
          onCreate(result.data?.createTypeDefinition?.id);
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
    [intl, typeDefinitionCreator]
  );

  return (
    <TypeDefinitionForm
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
      dataLocale={dataLocale}
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
    </TypeDefinitionForm>
  );
};
TypesCreate.displayName = 'NewType';

export default TypesCreate;
