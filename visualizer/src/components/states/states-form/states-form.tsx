import { FC, ReactElement } from 'react';
import { FormikHelpers, useFormik } from 'formik';
import {
  Maybe,
  TQuery,
  TQuery_TypeDefinitionArgs,
  TStateType,
} from '../../../types/generated/ctp';
import { ApolloQueryResult } from '@apollo/client';
import { PageContentWide } from '@commercetools-frontend/application-components';
import Spacings from '@commercetools-uikit/spacings';
import CollapsiblePanel from '@commercetools-uikit/collapsible-panel';
import { FormattedMessage, useIntl } from 'react-intl';
import messages from '../../types/types-form/messages';
import Grid from '@commercetools-uikit/grid';
import { customProperties } from '@commercetools-uikit/design-system';
import Card from '@commercetools-uikit/card';
import LocalizedTextField from '@commercetools-uikit/localized-text-field';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
type Formik = ReturnType<typeof useFormik>;

type FormProps = {
  formElements: ReactElement;
  values: Formik['values'];
  isDirty: Formik['dirty'];
  isSubmitting: Formik['isSubmitting'];
  submitForm: Formik['handleSubmit'];
  handleReset: Formik['handleReset'];
};

export type TFormValues = {
  type: TStateType;
  key?: Maybe<string>;
  name: Record<string, string>;
  description: Record<string, string>;
};

type Props = {
  onSubmit: (
    values: TFormValues,
    formikHelpers: FormikHelpers<TFormValues>
  ) => void | Promise<unknown>;
  initialValues: TFormValues;
  children: (formProps: FormProps) => React.JSX.Element;
  refetch?: (
    variables?: Partial<TQuery_TypeDefinitionArgs> | undefined
  ) => Promise<ApolloQueryResult<TQuery>>;
};

const StatesForm: FC<Props> = ({ initialValues, onSubmit, children }) => {
  const formik = useFormik<TFormValues>({
    initialValues: initialValues,
    onSubmit: onSubmit,
    enableReinitialize: true,
  });
  const intl = useIntl();
  const { dataLocale } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
  }));

  const formElements = (
    <PageContentWide columns="2/1" gapSize="20">
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
              gridTemplateColumns={`repeat(2, ${customProperties.constraint11})`}
              gridGap={customProperties.spacingM}
            >
              <Grid.Item>
                <Card type="flat" insetScale="s">
                  <LocalizedTextField
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
                  />
                </Card>
              </Grid.Item>
              {/*<Grid.Item>*/}
              {/*  <Card type="flat" insetScale="s">*/}
              {/*    <TextField*/}
              {/*      name="key"*/}
              {/*      value={formik.values.key || ''}*/}
              {/*      title={intl.formatMessage(messages.keyTitle)}*/}
              {/*      hint={intl.formatMessage(messages.keyHint)}*/}
              {/*      isRequired*/}
              {/*      errors={*/}
              {/*        TextField.toFieldErrors<TFormValues>(formik.errors).key*/}
              {/*      }*/}
              {/*      touched={!!formik.touched.key}*/}
              {/*      onBlur={formik.handleBlur}*/}
              {/*      onChange={formik.handleChange}*/}
              {/*      isDisabled={!createNewMode}*/}
              {/*      renderError={renderKeyInputErrors}*/}
              {/*    />*/}
              {/*  </Card>*/}
              {/*</Grid.Item>*/}
              {/*<Grid.Item>*/}
              {/*  <Card type="flat" insetScale="s">*/}
              {/*    <SelectField*/}
              {/*      name="resourceTypeIds"*/}
              {/*      title={intl.formatMessage(messages.resourceTypeIdsTitle)}*/}
              {/*      isRequired*/}
              {/*      isMulti*/}
              {/*      value={formik.values.resourceTypeIds}*/}
              {/*      options={resourceTypes}*/}
              {/*      errors={*/}
              {/*        SelectField.toFieldErrors<TFormValues>(formik.errors)*/}
              {/*          .resourceTypeIds*/}
              {/*      }*/}
              {/*      touched={*/}
              {/*        formik.touched.resourceTypeIds*/}
              {/*          ? formik.touched.resourceTypeIds*/}
              {/*          : undefined*/}
              {/*      }*/}
              {/*      onBlur={formik.handleBlur}*/}
              {/*      onChange={formik.handleChange}*/}
              {/*      isDisabled={!createNewMode}*/}
              {/*    />*/}
              {/*  </Card>*/}
              {/*</Grid.Item>*/}
            </Grid>
          </CollapsiblePanel>
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

export default StatesForm;
