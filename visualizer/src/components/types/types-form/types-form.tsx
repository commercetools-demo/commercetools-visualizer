import { FC, ReactElement } from 'react';
import { useFormik, type FormikHelpers } from 'formik';
import TextField from '@commercetools-uikit/text-field';
import CollapsiblePanel from '@commercetools-uikit/collapsible-panel';
import { designTokens } from '@commercetools-uikit/design-system';
import LocalizedTextField from '@commercetools-uikit/localized-text-field';
import Card from '@commercetools-uikit/card';
import Spacings from '@commercetools-uikit/spacings';
import { FormattedMessage, useIntl } from 'react-intl';
import omitEmpty from 'omit-empty-es';
import Grid from '@commercetools-uikit/grid';
import SelectField from '@commercetools-uikit/select-field';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { ApolloQueryResult } from '@apollo/client';
import {
  Maybe,
  TFieldDefinition,
  TQuery,
  TQuery_TypeDefinitionArgs,
} from '../../../types/generated/ctp';
import messages from './messages';
import { RESOURCE_TYPES } from './constants';
import FieldDefinitionsList from '../field-definitions-list/field-definitions-list';
import LocalizedTextInput from '@commercetools-uikit/localized-text-input';
import { PageContentWide } from '@commercetools-frontend/application-components';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import { PERMISSIONS } from '../../../constants';

const resourceTypes = RESOURCE_TYPES.map((t) => ({ label: t, value: t }));
type Formik = ReturnType<typeof useFormik>;

type TErrors = {
  key: { missing?: boolean; invalidInput?: boolean; keyHint?: boolean };
  name: { missing?: boolean };
  description: { missing?: boolean };
  resourceTypeIds: { missing?: boolean };
};

const validate = (formikValues: TFormValues) => {
  const errors: TErrors = {
    key: {},
    name: {},
    description: {},
    resourceTypeIds: {},
  };

  if (formikValues.key && formikValues.key.length > 0) {
    const keyValue = formikValues.key.trim();
    const keyLength = keyValue.length;
    if (keyLength < 2 || keyLength > 256 || !/^[a-zA-Z0-9-_]+$/.test(keyValue))
      errors.key.invalidInput = true;
  } else {
    errors.key.missing = true;
  }

  if (LocalizedTextInput.isEmpty(formikValues.name)) {
    errors.name.missing = true;
  }
  if (formikValues.resourceTypeIds.length < 1) {
    errors.resourceTypeIds.missing = true;
  }
  return omitEmpty<TErrors>(errors);
};

const renderKeyInputErrors = (key: string) => {
  switch (key) {
    case 'invalidInput':
      return <FormattedMessage {...messages.invalidKey} />;
    case 'duplicate':
      return <FormattedMessage {...messages.duplicateKey} />;
    case 'missing':
      return <FormattedMessage {...messages.requiredKey} />;
    default:
      return null;
  }
};

export type TFormValues = {
  id: string;
  key?: Maybe<string>;
  name: Record<string, string>;
  description: Record<string, string>;
  resourceTypeIds: Array<string>;
  fieldDefinitions: Array<TFieldDefinition>;
};

type FormProps = {
  formElements: ReactElement;
  values: Formik['values'];
  isDirty: Formik['dirty'];
  isSubmitting: Formik['isSubmitting'];
  submitForm: Formik['handleSubmit'];
  handleReset: Formik['handleReset'];
};

type Props = {
  onSubmit: (
    values: TFormValues,
    formikHelpers: FormikHelpers<TFormValues>
  ) => void | Promise<unknown>;
  initialValues: TFormValues;
  children: (formProps: FormProps) => JSX.Element;
  linkToHome: string;
  version: number;
  refetch?: (
    variables?: Partial<TQuery_TypeDefinitionArgs> | undefined
  ) => Promise<ApolloQueryResult<TQuery>>;
  createNewMode?: boolean;
};

const TypesForm: FC<Props> = ({
  version,
  children,
  initialValues,
  onSubmit,
  linkToHome,
  refetch,
  createNewMode = false,
}) => {
  const formik = useFormik<TFormValues>({
    initialValues: initialValues,
    onSubmit: onSubmit,
    validate,
    enableReinitialize: true,
  });
  const intl = useIntl();
  const { dataLocale } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
  }));

  const canManage = useIsAuthorized({
    demandedPermissions: [PERMISSIONS.Manage],
  });

  const formElements = (
    <PageContentWide>
      <Spacings.Stack scale="xxxl">
        <Spacings.Stack scale="m">
          <CollapsiblePanel
            header={
              <CollapsiblePanel.Header>
                <FormattedMessage {...messages.generalInformationTitle} />
              </CollapsiblePanel.Header>
            }
          >
            <Grid
              gridTemplateColumns={`repeat(2, ${designTokens.constraint11})`}
              gridGap={designTokens.spacingM}
            >
              <Grid.Item>
                <Card type="flat" insetScale="s">
                  <LocalizedTextField
                    data-testid={'types-edit-name'}
                    name="name"
                    selectedLanguage={dataLocale}
                    value={formik.values.name}
                    title={intl.formatMessage(messages.nameTitle)}
                    isRequired
                    errors={
                      LocalizedTextField.toFieldErrors<TFormValues>(
                        formik.errors
                      ).name
                    }
                    touched={!!formik.touched.name}
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    isReadOnly={!canManage}
                  />
                </Card>
              </Grid.Item>
              <Grid.Item>
                <Card type="flat" insetScale="s">
                  <LocalizedTextField
                    name="description"
                    selectedLanguage={dataLocale}
                    value={formik.values.description}
                    title={intl.formatMessage(messages.descriptionTitle)}
                    errors={
                      LocalizedTextField.toFieldErrors<TFormValues>(
                        formik.errors
                      ).description
                    }
                    touched={!!formik.touched.description}
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    isReadOnly={!canManage}
                  />
                </Card>
              </Grid.Item>
              <Grid.Item>
                <Card type="flat" insetScale="s">
                  <TextField
                    name="key"
                    value={formik.values.key || ''}
                    title={intl.formatMessage(messages.keyTitle)}
                    hint={intl.formatMessage(messages.keyHint)}
                    isRequired
                    errors={
                      TextField.toFieldErrors<TFormValues>(formik.errors).key
                    }
                    touched={!!formik.touched.key}
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    isReadOnly={!createNewMode}
                    renderError={renderKeyInputErrors}
                  />
                </Card>
              </Grid.Item>
              <Grid.Item>
                <Card type="flat" insetScale="s">
                  <SelectField
                    name="resourceTypeIds"
                    title={intl.formatMessage(messages.resourceTypeIdsTitle)}
                    isRequired
                    isMulti
                    value={formik.values.resourceTypeIds}
                    options={resourceTypes}
                    errors={
                      SelectField.toFieldErrors<TFormValues>(formik.errors)
                        .resourceTypeIds
                    }
                    touched={
                      formik.touched.resourceTypeIds
                        ? formik.touched.resourceTypeIds
                        : undefined
                    }
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    isReadOnly={!createNewMode}
                  />
                </Card>
              </Grid.Item>
            </Grid>
          </CollapsiblePanel>
          {!createNewMode && (
            <CollapsiblePanel
              header={
                <CollapsiblePanel.Header>
                  <FormattedMessage {...messages.typeInformationTitle} />
                </CollapsiblePanel.Header>
              }
            >
              <FieldDefinitionsList
                id={formik.values.id}
                version={version}
                value={formik.values.fieldDefinitions}
                linkToHome={linkToHome}
                refetch={refetch}
              />
            </CollapsiblePanel>
          )}
        </Spacings.Stack>
      </Spacings.Stack>
    </PageContentWide>
  );

  return children({
    formElements,
    values: formik.values,
    isDirty: formik.dirty,
    isSubmitting: formik.isSubmitting,
    submitForm: formik.handleSubmit,
    handleReset: formik.handleReset,
  });
};

TypesForm.displayName = 'TypeDefinitionDetailsForm';

export default TypesForm;
