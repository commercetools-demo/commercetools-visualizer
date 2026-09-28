import { FC, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { useShowNotification } from '@commercetools-frontend/actions-global';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { Button, DefaultPage, Group } from '@commercetools/nimbus';
import { DOMAINS } from '@commercetools-frontend/constants';
import { PERMISSIONS } from '../../../constants';
import ExtensionsForm, {
  TFormValues,
} from '../extensions-form/extensions-form';
import {
  formValuesToTExtension,
  tExtensionToFormValues,
} from '../extensions-form/conversion';
import formMessages from '../extensions-form/messages';
import messages from './messages';
import { graphQLErrorHandler, useExtensionCreator } from '../../../hooks';
import { FormikHelpers } from 'formik';

type Props = {
  linkToWelcome: string;
};

const ExtensionsCreate: FC<Props> = ({ linkToWelcome }) => {
  const intl = useIntl();
  const history = useHistory();
  const { dataLocale } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
  }));
  const canManage = useIsAuthorized({
    demandedPermissions: [PERMISSIONS.Manage],
  });
  const extensionCreator = useExtensionCreator();
  const showNotification = useShowNotification();

  const handleSubmit = useCallback(
    async (
      formikValues: TFormValues,
      formikHelpers: FormikHelpers<TFormValues>
    ) => {
      const draft = formValuesToTExtension(formikValues);
      await extensionCreator
        .execute({
          draft: draft,
        })
        .then(() => {
          showNotification({
            kind: 'success',
            domain: DOMAINS.SIDE,
            text: intl.formatMessage(messages.createSuccess),
          });
          history.push({
            pathname: linkToWelcome + '/extensions',
            state: { refetch: true },
          });
        })
        .catch(graphQLErrorHandler(showNotification, formikHelpers));
    },
    [extensionCreator, intl, showNotification]
  );

  return (
    <ExtensionsForm
      initialValues={tExtensionToFormValues()}
      onSubmit={handleSubmit}
      dataLocale={dataLocale}
      version={-1}
      createNewMode={true}
    >
      {(formProps) => (
        <DefaultPage.Root>
          <DefaultPage.Header>
            <DefaultPage.BackLink
              href="#"
              onClick={(event) => {
                event.preventDefault();
                history.push(linkToWelcome + '/extensions');
              }}
            >
              {intl.formatMessage(messages.backButton)}
            </DefaultPage.BackLink>
            <DefaultPage.Title>
              {intl.formatMessage(messages.title)}
            </DefaultPage.Title>
          </DefaultPage.Header>
          <DefaultPage.Content>{formProps.formElements}</DefaultPage.Content>
          <DefaultPage.Footer>
            <Group
              aria-label={intl.formatMessage(messages.formActionsLabel)}
              gap="300"
            >
              <Button
                variant="outline"
                onPress={() => history.push(linkToWelcome + '/extensions')}
              >
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
            </Group>
          </DefaultPage.Footer>
        </DefaultPage.Root>
      )}
    </ExtensionsForm>
  );
};

export default ExtensionsCreate;
