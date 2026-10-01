import { FC, JSX, ReactElement } from 'react';
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
  Text,
  TextInput,
} from '@commercetools/nimbus';
import { transformLocalizedFieldToLocalizedString } from '@commercetools-frontend/l10n';
import messages from './messages';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { getErrorMessage, useStatesFetcher } from '../../../hooks';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import { PERMISSIONS } from '../../../constants';
import { validateKey } from '../../../utils/validate-key';
import KeyInputError from '../../shared/key-input-error/key-input-error';
import keyInputMessages from '../../shared/key-input-error/messages';
import { STATE_TYPES, STATE_TYPE_LABELS, allowedRoles } from '../state-types';

type Formik = ReturnType<typeof useFormik>;

export const resourceTypes = STATE_TYPES.map((value) => ({
  value,
  label: STATE_TYPE_LABELS[value],
}));

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
  // Whether transitions are validated at all: unset lets the state move to any state of the
  // same type, while a (possibly empty) list allows only those — empty = a final state.
  restrictTransitions: boolean;
  transitions: Array<string>;
  roles: Array<string>;
  initial: boolean;
};

type TErrors = {
  key: { missing?: boolean; invalidInput?: boolean };
  roles: { notAllowed?: boolean };
};

const validate = (formikValues: TFormValues) => {
  const errors: TErrors = {
    key: validateKey(formikValues.key),
    // A role only applies to one state type.
    roles: formikValues.roles.some(
      (role) => !allowedRoles(formikValues.stateType).includes(role)
    )
      ? { notAllowed: true }
      : {},
  };

  return omitEmpty<TErrors>(errors);
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
  // Built-in states can't be deleted and their key can't be changed.
  isBuiltIn?: boolean;
};

const StatesForm: FC<Props> = ({
  initialValues,
  onSubmit,
  children,
  createNewMode = false,
  isBuiltIn = false,
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
    // Needs every state of this type for the transition-options dropdown, so
    // request the API's max page size rather than paginating.
    limit: 500,
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
                width={'full'}
              />
            </FormField.Input>
            <FormField.Description>
              {intl.formatMessage(keyInputMessages.keyHint)}
            </FormField.Description>
            <FormField.Error>
              <KeyInputError error={errors.key} resourceType="state" />
            </FormField.Error>
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
            width={'full'}
          />
          <FormField.Root isReadOnly={!canManage}>
            <FormField.Input>
              <Checkbox
                isSelected={formik.values.initial}
                isReadOnly={!canManage}
                onChange={(isSelected) =>
                  formik.setFieldValue('initial', isSelected)
                }
                width={'full'}
              >
                <FormattedMessage {...messages.initialTitle} />
              </Checkbox>
            </FormField.Input>
            <FormField.Description>
              {intl.formatMessage(messages.initialHint)}
            </FormField.Description>
          </FormField.Root>
          {isBuiltIn && (
            <Text color="neutral.11">
              {intl.formatMessage(messages.builtInNote)}
            </Text>
          )}
        </Stack>
      </PageContent.Column>
      <PageContent.Column sticky>
        <Stack direction="column" gap="400">
          <FormField.Root
            isRequired
            isReadOnly={!createNewMode || !canManage}
            isDisabled={!createNewMode || !canManage}
          >
            <FormField.Label>
              {intl.formatMessage(messages.stateTypeTitle)}
            </FormField.Label>
            <FormField.Input>
              <Select.Root
                aria-label={intl.formatMessage(messages.stateTypeTitle)}
                value={formik.values.stateType}
                onChange={(value) => {
                  formik.setFieldValue('stateType', value as TStateType);
                  // roles only exist for some types: drop the ones that no longer apply
                  formik.setFieldValue(
                    'roles',
                    formik.values.roles.filter((role) =>
                      allowedRoles(value as string).includes(role)
                    )
                  );
                }}
                width={'full'}
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
            width={'full'}
            onBlur={() => formik.setFieldTouched('description', true)}
          />
          <Checkbox
            isSelected={formik.values.restrictTransitions}
            isReadOnly={!canManage}
            onChange={(isSelected) =>
              formik.setFieldValue('restrictTransitions', isSelected)
            }
          >
            {intl.formatMessage(messages.restrictTransitions)}
          </Checkbox>
          <FormField.Root
            isReadOnly={!canManage}
            isDisabled={!formik.values.restrictTransitions}
          >
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
                width={'full'}
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
            <FormField.Description>
              {intl.formatMessage(messages.transitionsHint)}
            </FormField.Description>
          </FormField.Root>
          {allowedRoles(formik.values.stateType).length > 0 && (
            <FormField.Root
              isReadOnly={!canManage}
              isInvalid={Boolean(errors.roles?.notAllowed)}
            >
              <FormField.Label>
                {intl.formatMessage(messages.rolesTitle)}
              </FormField.Label>
              <FormField.Input>
                <Stack direction="column" gap="200">
                  {allowedRoles(formik.values.stateType).map((role) => (
                    <Checkbox
                      key={role}
                      isSelected={formik.values.roles.includes(role)}
                      isReadOnly={!canManage}
                      onChange={(isSelected) =>
                        formik.setFieldValue(
                          'roles',
                          isSelected
                            ? [...formik.values.roles, role]
                            : formik.values.roles.filter(
                                (existing) => existing !== role
                              )
                        )
                      }
                    >
                      {intl.formatMessage(
                        messages[`role${role}` as 'roleReturn']
                      )}
                    </Checkbox>
                  ))}
                </Stack>
              </FormField.Input>
              <FormField.Description>
                {intl.formatMessage(messages.rolesHint)}
              </FormField.Description>
            </FormField.Root>
          )}
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
