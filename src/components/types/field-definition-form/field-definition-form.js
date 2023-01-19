import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  ErrorMessage,
  CheckboxInput,
  TextField,
  LocalizedTextField,
  Card,
  Grid,
  customProperties,
  SelectField,
  Spacings
} from '@commercetools-frontend/ui-kit';
import { PrimaryButton } from '@commercetools-uikit/buttons';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import messages from './messages';
import { FIELD_TYPES, INPUT_HINTS, REFERENCE_TYPES } from './constants';

const fieldTypes = Object.keys(FIELD_TYPES).map(t => ({ label: t, value: FIELD_TYPES[t] }));
const inputHints = Object.keys(INPUT_HINTS).map(t => ({ label: t, value: INPUT_HINTS[t] }));
const referenceTypeOptions = REFERENCE_TYPES.map(t => ({ label: t, value: t }));

const FieldDefinitionForm = ({
  values,
  touched,
  errors,
  dirty,
  isValid,
  isSubmitting,
  handleBlur,
  handleChange,
  handleSubmit,
  setFieldValue,
  editMode,
}) => {

  const intl = useIntl();
  const { dataLocale } = useApplicationContext();

  return (
    <Spacings.Stack scale="m">
      <Grid
        gridTemplateColumns={`repeat(1, ${customProperties.constraint11})`}
        gridGap={customProperties.spacingM}
      >
        <Grid.Item>
          <Card type="flat">
            <TextField
              name="name"
              hint={<FormattedMessage {...messages.nameHint} />}
              value={values.name}
              title={<FormattedMessage {...messages.nameTitle} />}
              isRequired
              touched={touched.name?true:false}
              onBlur={handleBlur}
              onChange={handleChange}              
            /> 
            {errors.name && touched.name ? (
              <ErrorMessage>{errors.name}</ErrorMessage>
              ) : null
            }
            </Card>
          </Grid.Item>
        <Grid.Item>
          <Card type="flat">
            <LocalizedTextField
              name="label"
              selectedLanguage={dataLocale}
              value={values.label}
              title={<FormattedMessage {...messages.labelTitle} />}
              isRequired
              touched={touched.label ? true : false}
              onBlur={handleBlur}
              onChange={handleChange}
              renderError={(key, error) => error}
            />
          </Card>
        </Grid.Item>
          <Grid.Item>
            
          
        </Grid.Item>
        <Grid.Item>
          <Card type="flat">
            <SelectField
              name="type.name"
              title={<FormattedMessage {...messages.typeTitle} />}              
              isRequired
              value={values.type.name}
              options={fieldTypes}
              touched={touched.type?.name}
              onBlur={handleBlur}
              onChange={handleChange}
              isDisabled={editMode}
            />
          </Card>            
          { // Only display 'reference' drop-down if reference type selected.
          values.type.name=='Reference' && (
              <Card>
                <SelectField
                  name="type.referenceTypeId"
                  title={<FormattedMessage {...messages.referenceTitle} />}              
                  isRequired
                  value={values.type.referenceTypeId}
                  options={referenceTypeOptions}
                  touched={touched.type?.referenceTypeId}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  isDisabled={editMode}
                />
              </Card>
            )
          }
           <Card type="flat">
           <CheckboxInput
              name="isSet"
              onChange={handleChange}
              isChecked={values.isSet}
            >
              <FormattedMessage {...messages.setTitle} />
            </CheckboxInput>
          </Card>
          <Card type="flat">
            <CheckboxInput
              name="required"
              onChange={handleChange}
              isChecked={values.required}
            >
              <FormattedMessage {...messages.requiredTitle} />
            </CheckboxInput>
          </Card>
          <Card type="flat">
            <SelectField
              name="inputHint"
              title={<FormattedMessage {...messages.inputHintTitle} />}
              value={values.inputHint}
              options={inputHints}
              touched={touched.inputHint}
              onBlur={handleBlur}
              onChange={handleChange}
              isDisabled={editMode}
            />
          </Card>
        </Grid.Item>
      </Grid>
    </Spacings.Stack>
  );
};
FieldDefinitionForm.displayName = 'Form';
FieldDefinitionForm.propTypes = {
  values: PropTypes.object,
  errors: PropTypes.shape({    
    name: PropTypes.object,
    label: PropTypes.object,
    type: PropTypes.object,
    isSet: PropTypes.object,
    inputHint: PropTypes.object,
  }).isRequired,
  dirty: PropTypes.bool,
  isValid: PropTypes.bool,
  isSubmitting: PropTypes.bool,
  handleBlur: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  editMode: PropTypes.bool,
};

export default FieldDefinitionForm;
