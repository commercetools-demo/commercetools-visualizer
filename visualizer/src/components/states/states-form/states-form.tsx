import { FC, JSX, ReactElement, ReactNode } from 'react';
import { FormikHelpers, useFormik } from 'formik';
import {
  Maybe,
  TQuery,
  TQuery_TypeDefinitionArgs,
  TStateType,
} from '../../../types/generated/ctp';
import { ApolloQueryResult } from '@apollo/client';
import { FormattedMessage, useIntl } from 'react-intl';
import omitEmpty from 'omit-empty-es';
import {
  Alert,
  Checkbox,
  ComboBox,
  FormField,
  LoadingSpinner,
  LocalizedField,
  type LocalizedString,
  PageContent,
  Select,
  Stack,
  TextInput,
} from '@commercetools/nimbus';
import { transformLocalizedFieldToLocalizedString } from '@commercetools-frontend/l10n';
import messages from './messages';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { getErrorMessage, useStatesFetcher } from '../../../hooks';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import { PERMISSIONS } from '../../../constants';

type Formik = ReturnType<typeof useFormik>;

export const resourceTypes = [
  { value: 'OrderState', label: 'Order State' },
  { value: 'LineItemState', label: 'Line Item State' },
  { value: 'ProductState', label: 'Product State' },
  { value: 'ReviewState', label: 'Review State' },
  { value: 'PaymentState', label: 'Payment State' },
  { value: 'QuoteRequestState', label: 'Quote Request State' },
  { value: 'StagedQuoteState', label: 'Staged Quote State' },
  { value: 'QuoteState', label: 'Quote State' },
];

type FormProps = {
  formElements: ReactElement;
  values: Formik['values'];
  isDirty: Formik['dirty'];
  isSubmitting: Formik['isSubmitting'];
  submitForm: Formik['handleSubmit'];
  handleReset: Formik['handleReset'];
};

export type TFormValues = {
  id?: Maybe<string>;
  key?: Maybe<string>;
  name: LocalizedString;
  description: LocalizedString;
  stateType: TStateType;
  transitions: Array<string>;
  initial: boolean;
};

type TErrors = {
  key: { missing?: boolean; invalidInput?: boolean; keyHint?: boolean };
};

const validate = (formikValues: TFormValues) => {
  const errors: TErrors = {
    key: {},
  };

  if (formikValues.key && formikValues.key.length > 0) {
    const keyValue = formikValues.key.trim();
    const keyLength = keyValue.length;
    if (keyLength < 2 || keyLength > 256 || !/^[a-zA-Z0-9-_]+$/.test(keyValue))
      errors.key.invalidInput = true;
  } else {
    errors.key.missing = true;
  }

  return omitEmpty<TErrors>(errors);
};

const renderKeyInputError = (key?: TErrors['key']): ReactNode => {
  if (!key) return null;
  if (key.invalidInput) return <FormattedMessage {...messages.invalidKey} />;
  if (key.missing) return <FormattedMessage {...messages.requiredKey} />;
  return null;
};

type Props = {
  onSubmit: (
    values: TFormValues,
    formikHelpers: FormikHelpers<TFormValues>
  ) => void | Promise<unknown>;
  initialValues: TFormValues;
  children: (formProps: FormProps) => JSX.Element;
  refetch?: (
    variables?: Partial<TQuery_TypeDefinitionArgs> | undefined
  ) => Promise<ApolloQueryResult<TQuery>>;
  createNewMode?: boolean;
};

const StatesForm: FC<Props> = ({
  initialValues,
  onSubmit,
  children,
  createNewMode = false,
}) => {
  const formik = useFormik<TFormValues>({
    initialValues: initialValues,
    onSubmit: onSubmit,
    validate: validate,
    enableReinitialize: true,
  });
  const intl = useIntl();
  const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
    projectLanguages: context.project?.languages ?? [],
  }));

  const canManage = useIsAuthorized({
    demandedPermissions: [PERMISSIONS.Manage],
  });

  const errors = formik.errors as Partial<TErrors>;

  let where = `type="${formik.values.stateType}"`;
  if (formik.values.id) {
    where = `${where} and id != "${formik.values.id}"`;
  }

  const { states, error, loading } = useStatesFetcher({
    limit: 100,
    offset: 0,
    where: where,
  });

  if (error) {
    return (
      <Alert.Root colorPalette="critical">
        <Alert.Title>
          {intl.formatMessage(messages.generalInformationTitle)}
        </Alert.Title>
        <Alert.Description>{getErrorMessage(error)}</Alert.Description>
      </Alert.Root>
    );
  }
  if (loading) {
    return (
      <Stack direction="row" justifyContent="center" padding="600">
        <LoadingSpinner
          aria-label={intl.formatMessage(messages.generalInformationTitle)}
        />
      </Stack>
    );
  }

  const transitionOptions = (states?.results ?? []).map((result) => {
    const name = LocalizedField.createLocalizedString(
      projectLanguages,
      transformLocalizedFieldToLocalizedString(result.nameAllLocales ?? []) ??
        {}
    );
    return { id: result.id, name: name[dataLocale] || name['en'] || '' };
  });

  const formElements = (
    <PageContent.Root variant="wide" columns="1/1">
      <PageContent.Column>
        <Stack direction="column" gap="400">
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
              />
            </FormField.Input>
            <FormField.Description>
              {intl.formatMessage(messages.keyHint)}
            </FormField.Description>
            <FormField.Error>{renderKeyInputError(errors.key)}</FormField.Error>
          </FormField.Root>
          <LocalizedField
            id="states-edit-name"
            name="name"
            type="text"
            label={intl.formatMessage(messages.nameTitle)}
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
          />
          <FormField.Root isReadOnly={!canManage}>
            <FormField.Input>
              <Checkbox
                isSelected={formik.values.initial}
                isReadOnly={!canManage}
                onChange={(isSelected) =>
                  formik.setFieldValue('initial', isSelected)
                }
              >
                <FormattedMessage {...messages.initialTitle} />
              </Checkbox>
            </FormField.Input>
          </FormField.Root>
        </Stack>
      </PageContent.Column>
      <PageContent.Column sticky>
        <Stack direction="column" gap="400">
          <FormField.Root isRequired isReadOnly={!createNewMode || !canManage}>
            <FormField.Label>
              {intl.formatMessage(messages.stateTypeTitle)}
            </FormField.Label>
            <FormField.Input>
              <Select.Root
                aria-label={intl.formatMessage(messages.stateTypeTitle)}
                value={formik.values.stateType}
                isDisabled={!createNewMode || !canManage}
                onChange={(value) =>
                  formik.setFieldValue('stateType', value as TStateType)
                }
              >
                <Select.Options items={resourceTypes}>
                  {(item) => (
                    <Select.Option id={item.value}>{item.label}</Select.Option>
                  )}
                </Select.Options>
              </Select.Root>
            </FormField.Input>
          </FormField.Root>
          <LocalizedField
            id="states-edit-description"
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
          />
          <FormField.Root isReadOnly={!canManage}>
            <FormField.Label>
              {intl.formatMessage(messages.transitionsTitle)}
            </FormField.Label>
            <FormField.Input>
              <ComboBox.Root
                aria-label={intl.formatMessage(messages.transitionsTitle)}
                items={transitionOptions}
                selectionMode="multiple"
                isReadOnly={!canManage}
                selectedKeys={formik.values.transitions}
                onSelectionChange={(keys) =>
                  formik.setFieldValue('transitions', keys as string[])
                }
                onBlur={() => formik.setFieldTouched('transitions', true)}
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
          </FormField.Root>
        </Stack>
      </PageContent.Column>
    </PageContent.Root>
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

export default StatesForm;
