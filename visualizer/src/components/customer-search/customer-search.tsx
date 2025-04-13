import { FC } from 'react';
import AsyncSelectField from '@commercetools-uikit/async-select-field';
import Text from '@commercetools-uikit/text';
import { AdditionalInfoMessage } from '@commercetools-uikit/messages';
import formatCustomerName from '../../utils/format-customer-name';
import { TAsyncSelectInputProps } from '@commercetools-uikit/async-select-input/dist/declarations/src/async-select-input';
import { TAsyncSelectFieldProps } from '@commercetools-uikit/async-select-field/dist/declarations/src/async-select-field';
import { useCustomerSearchFetcher } from 'commercetools-demo-shared-data-fetching-hooks';

export interface CustomerValue {
  value: string;
  label: string;
}

interface Props {
  title: string;
  name: string;
  value?: CustomerValue;
  placeholder?: string;
  onChange: TAsyncSelectInputProps['onChange'];
  errors?: TAsyncSelectFieldProps['errors'];
  touched?: TAsyncSelectFieldProps['touched'];
  onBlur?: TAsyncSelectFieldProps['onBlur'];
  horizontalConstraint?: TAsyncSelectFieldProps['horizontalConstraint'];
  isRequired?: boolean;
}

export const CustomerSearch: FC<Props> = ({
  title,
  name,
  value,
  onChange,
  errors,
  touched,
  onBlur,
  horizontalConstraint,
  isRequired,
}) => {
  const { fetchCustomers, customerData } = useCustomerSearchFetcher(() => {});
  return (
    <AsyncSelectField
      horizontalConstraint={horizontalConstraint}
      title={title}
      value={value}
      name={name}
      isClearable
      isSearchable
      isRequired={isRequired}
      loadOptions={async (text) => {
        fetchCustomers({
          searchQuery: text,
          perPage: 20,
          page: 1,
        });
        return (
          customerData.customers.results?.map((customer) => {
            const label = (
              <Text.Body>
                {formatCustomerName(customer)}
                <AdditionalInfoMessage
                  message={`(${customer.email})`}
                ></AdditionalInfoMessage>
              </Text.Body>
            );
            return {
              value: customer.id,
              label: label,
            };
          }) || []
        );
      }}
      onBlur={onBlur}
      touched={touched}
      onChange={onChange}
      errors={errors}
    />
  );
};

export default CustomerSearch;
