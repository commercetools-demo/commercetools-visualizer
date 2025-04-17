import { FC } from 'react';
import { Formik } from 'formik';
import isEmpty from 'lodash/isEmpty';
import mapValues from 'lodash/mapValues';
import { useIntl } from 'react-intl';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';

import messages from './messages';
import CollapsiblePanel from '@commercetools-uikit/collapsible-panel';
import Spacings from '@commercetools-uikit/spacings';
import FieldLabel from '@commercetools-uikit/field-label';
import PrimaryButton from '@commercetools-uikit/primary-button';
import DateTimeInput from '@commercetools-uikit/date-time-input';
import { Filter } from '../filter-section/filter-section';
import { FilterValue } from '../../carts-list';

interface CreatedAtFilterSectionProps {
  filter: Filter;
  activeValue?: FilterValue;
  onChange: (filter: string, value: FilterValue) => void;
}

const CreatedAtFilterSection: FC<CreatedAtFilterSectionProps> = ({
  filter,
  onChange,
  activeValue,
}) => {
  const intl = useIntl();
  const { timezone } = useApplicationContext((context) => ({
    timezone: context.user?.timeZone ?? '',
  }));

  return (
    <CollapsiblePanel
      header={
        <CollapsiblePanel.Header>
          {intl.formatMessage(messages.createdAtHeader)}
        </CollapsiblePanel.Header>
      }
    >
      <Spacings.Stack>
        <Spacings.Stack scale="m">
          <Formik
            initialValues={{
              from:
                (typeof activeValue === 'object' && activeValue?.['from']) ||
                '',
              to:
                (typeof activeValue === 'object' && activeValue?.['to']) || '',
            }}
            validateOnBlur={false}
            validateOnChange={false}
            validate={(values) => {
              if (!values.from && !values.to) return { empty: true };

              if (values.from === values.to) return { duplicate: true };

              return {};
            }}
            onSubmit={(values) => {
              // Convert Formik '' empty inputs to `undefined`
              const correctedValues = mapValues(values, (value) =>
                value === '' ? undefined : value
              );

              const valuesToUse: Record<string, string> = {};
              if (correctedValues.from) {
                valuesToUse['from'] = correctedValues.from;
              }
              if (correctedValues.to) {
                valuesToUse['to'] = correctedValues.to;
              }
              onChange(filter.id, valuesToUse);
            }}
          >
            {(formikProps) => (
              <Spacings.Stack>
                <Spacings.Inline>
                  <FieldLabel
                    title={intl.formatMessage(messages.fromCreatedAtLabel)}
                  />
                </Spacings.Inline>
                <DateTimeInput
                  name="from"
                  timeZone={timezone}
                  value={formikProps.values.from}
                  onChange={formikProps.handleChange}
                  hasError={!isEmpty(formikProps.errors)}
                  placeholder={intl.formatMessage(
                    messages.fromCreatedAtPlaceholder
                  )}
                />
                <Spacings.Inline justifyContent="space-between">
                  <FieldLabel
                    title={intl.formatMessage(messages.toCreatedAtLabel)}
                  />
                </Spacings.Inline>
                <DateTimeInput
                  name="to"
                  timeZone={timezone}
                  value={formikProps.values.to}
                  onChange={formikProps.handleChange}
                  hasError={!isEmpty(formikProps.errors)}
                  placeholder={intl.formatMessage(
                    messages.toCreatedAtPlaceholder
                  )}
                />
                {/*{formikProps.errors.empty && (*/}
                {/*  <ErrorMessage>*/}
                {/*    <FormattedMessage*/}
                {/*      {...commonMessages.emptyRangeInputValidationMessage}*/}
                {/*    />*/}
                {/*  </ErrorMessage>*/}
                {/*)}*/}
                {/*{formikProps.errors.duplicate && (*/}
                {/*  <ErrorMessage>*/}
                {/*    <FormattedMessage*/}
                {/*      {...commonMessages.duplicateRangeInputValidationMessage}*/}
                {/*    />*/}
                {/*  </ErrorMessage>*/}
                {/*)}*/}
                <div>
                  <PrimaryButton
                    tone="primary"
                    onClick={() => formikProps.handleSubmit()}
                    label={intl.formatMessage(messages.applyCreatedAtValues)}
                  />
                </div>
              </Spacings.Stack>
            )}
          </Formik>
        </Spacings.Stack>
        {/*{composeRecentFilterValues().map(({ name, label, amount }) => (*/}
        {/*  <FilterCheckbox*/}
        {/*    key={name}*/}
        {/*    id={name}*/}
        {/*    isDisabled={props.isSelectable}*/}
        {/*    isSelected={isSelected(name)}*/}
        {/*    name={label}*/}
        {/*    amount={amount}*/}
        {/*    filterType={props.filter.id}*/}
        {/*    toggleIdFilter={() => props.toggleIdFilter(props.filter, name)}*/}
        {/*  />*/}
        {/*))}*/}
      </Spacings.Stack>
    </CollapsiblePanel>
  );
};

export default CreatedAtFilterSection;
