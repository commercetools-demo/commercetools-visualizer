import { FC, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { useIntl } from 'react-intl';
import {
  showApiErrorNotification,
  TApiErrorNotificationOptions,
  useShowNotification,
} from '@commercetools-frontend/actions-global';
import {
  CustomFormDetailPage,
  FormModalPage,
} from '@commercetools-frontend/application-components';
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
import TypeDefinitionDetailsForm from '../type-form/TypeDefinitionDetailsForm';

import { TTypeDefinitionDraft } from '../../../types/generated/ctp';
import { useTypeDefinitionCreator } from '../type-definition-connectors';
import messages from './messages';

type Props = {
  linkToHome: string;
};

const NewType: FC<Props> = ({ linkToHome }) => {
  const history = useHistory();
  const intl = useIntl();
  const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
    projectLanguages: context.project?.languages ?? [],
  }));
  const { push } = useHistory();
  const showNotification = useShowNotification();
  const typeDefinitionCreator = useTypeDefinitionCreator();
  const canManage = useIsAuthorized({
    demandedPermissions: [PERMISSIONS.Manage],
  });

  const handleSubmit = useCallback(async (formikValues, formikHelpers) => {
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
        push(`${linkToHome}/types/${result.data?.createTypeDefinition?.id}`);
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
  }, []);

  return (
    <TypeDefinitionDetailsForm
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
          <CustomFormDetailPage
            title={intl.formatMessage(messages.title)}
            onPreviousPathClick={() => history.push(linkToHome + '/types')}
            formControls={
              <>
                <CustomFormDetailPage.FormPrimaryButton
                  isDisabled={
                    formProps.isSubmitting || !formProps.isDirty || !canManage
                  }
                  onClick={() => formProps.submitForm()}
                  label={FormModalPage.Intl.save}
                />
              </>
            }
          >
            {formProps.formElements}
          </CustomFormDetailPage>
        );
      }}
    </TypeDefinitionDetailsForm>
  );
};
NewType.displayName = 'NewType';

export default NewType;
