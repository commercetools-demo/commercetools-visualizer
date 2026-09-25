import { JSX, FC, ReactElement, ReactNode } from 'react';
import { useFormik, type FormikHelpers } from 'formik';
import { FormattedMessage, useIntl } from 'react-intl';
import omitEmpty from 'omit-empty-es';
import {
  ComboBox,
  Flex,
  FormField,
  Heading,
  LocalizedField,
  type LocalizedString,
  PageContent,
  TextInput,
} from '@commercetools/nimbus';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { ApolloQueryResult } from '@apollo/client';
import {
  Maybe,
  TFieldDefinition,
  TQuery,
  TQuery_TypeDefinitionArgs,
} from '../../../types/generated/ctp';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import messages from './messages';
import { RESOURCE_TYPES } from './constants';
import FieldDefinitionsList from '../field-definitions-list/field-definitions-list';
import { PERMISSIONS } from '../../../constants';

const resourceTypeItems = RESOURCE_TYPES.map((t) => ({ id: t, name: t }));
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

  if (LocalizedField.isEmpty(formikValues.name)) {
    errors.name.missing = true;
  }
  if (formikValues.resourceTypeIds.length < 1) {
    errors.resourceTypeIds.missing = true;
  }
  return omitEmpty<TErrors>(errors);
};

const renderKeyInputError = (key?: TErrors['key']): ReactNode => {
  if (!key) return null;
  if (key.invalidInput) return <FormattedMessage {...messages.invalidKey} />;
  if (key.missing) return <FormattedMessage {...messages.requiredKey} />;
  return null;
};

export type TFormValues = {
  id: string;
  key?: Maybe<string>;
  name: LocalizedString;
  description: LocalizedString;
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

  const errors = formik.errors as Partial<TErrors>;

  const formElements = (
    <Flex direction="column" gap="400">
      <PageContent.Root variant="wide">
        <Heading as="h2" size="md">
          <FormattedMessage {...messages.generalInformationTitle} />
        </Heading>
      </PageContent.Root>
      <PageContent.Root variant="wide" columns="1/1">
        <PageContent.Column>
          <LocalizedField
            id="types-edit-name"
            name="name"
            type="text"
            label={intl.formatMessage(messages.nameTitle)}
            isRequired
            isReadOnly={!canManage}
            defaultLocaleOrCurrency={dataLocale}
            valuesByLocaleOrCurrency={formik.values.name}
            onChange={(event) =>
              formik.setFieldValue(
                `name.${event.target.locale}`,
                event.target.value
              )
            }
            onBlur={() => formik.setFieldTouched('name', true)}
            touched={!!formik.touched.name}
            error={
              formik.touched.name && errors.name?.missing
                ? intl.formatMessage(messages.requiredFieldError)
                : undefined
            }
            width={'full'}
          />
          <FormField.Root
            isRequired
            isReadOnly={!createNewMode || !canManage}
            isInvalid={Boolean(formik.touched.key && errors.key)}
          >
            <FormField.Label>
              {intl.formatMessage(messages.keyTitle)}
            </FormField.Label>
            <FormField.Input>
              <TextInput
                aria-label={intl.formatMessage(messages.keyTitle)}
                value={formik.values.key || ''}
                isReadOnly={!createNewMode || !canManage}
                onChange={(value) => formik.setFieldValue('key', value)}
                onBlur={() => formik.setFieldTouched('key', true)}
                width={'full'}
              />
            </FormField.Input>
            <FormField.Description>
              {intl.formatMessage(messages.keyHint)}
            </FormField.Description>
            <FormField.Error>{renderKeyInputError(errors.key)}</FormField.Error>
          </FormField.Root>
        </PageContent.Column>
        <PageContent.Column>
          <LocalizedField
            id="types-edit-description"
            name="description"
            type="text"
            label={intl.formatMessage(messages.descriptionTitle)}
            isReadOnly={!canManage}
            defaultLocaleOrCurrency={dataLocale}
            valuesByLocaleOrCurrency={formik.values.description}
            onChange={(event) =>
              formik.setFieldValue(
                `description.${event.target.locale}`,
                event.target.value
              )
            }
            onBlur={() => formik.setFieldTouched('description', true)}
            width={'full'}
          />
          <FormField.Root
            isRequired
            isReadOnly={!createNewMode || !canManage}
            isInvalid={Boolean(
              formik.touched.resourceTypeIds && errors.resourceTypeIds
            )}
          >
            <FormField.Label>
              {intl.formatMessage(messages.resourceTypeIdsTitle)}
            </FormField.Label>
            <FormField.Input>
              <ComboBox.Root
                aria-label={intl.formatMessage(messages.resourceTypeIdsTitle)}
                items={resourceTypeItems}
                selectionMode="multiple"
                isReadOnly={!createNewMode || !canManage}
                selectedKeys={formik.values.resourceTypeIds}
                onSelectionChange={(keys) =>
                  formik.setFieldValue('resourceTypeIds', keys as string[])
                }
                onBlur={() => formik.setFieldTouched('resourceTypeIds', true)}
                width={'full'}
              >
                <ComboBox.Trigger />
                <ComboBox.Popover>
                  <ComboBox.ListBox>
                    {(item: { id: string; name: string }) => (
                      <ComboBox.Option id={item.id}>
                        {item.name}
                      </ComboBox.Option>
                    )}
                  </ComboBox.ListBox>
                </ComboBox.Popover>
              </ComboBox.Root>
            </FormField.Input>
            <FormField.Error>
              {formik.touched.resourceTypeIds && errors.resourceTypeIds?.missing
                ? intl.formatMessage(messages.requiredFieldError)
                : null}
            </FormField.Error>
          </FormField.Root>
        </PageContent.Column>
      </PageContent.Root>
      <PageContent.Root variant={'wide'}>
        <Heading as="h2" size="md">
          <FormattedMessage {...messages.typeInformationTitle} />
        </Heading>
      </PageContent.Root>
      <PageContent.Root variant={'full'}>
        {!createNewMode && (
          <FieldDefinitionsList
            id={formik.values.id}
            version={version}
            value={formik.values.fieldDefinitions}
            linkToHome={linkToHome}
            refetch={refetch}
          />
        )}
      </PageContent.Root>
    </Flex>
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
