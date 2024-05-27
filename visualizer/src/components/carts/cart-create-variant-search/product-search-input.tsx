import { FC } from 'react';
import { useMcQuery } from '@commercetools-frontend/application-shell';
import ProductSearch from './product-search.rest.graphql';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import AsyncSelectInput from '@commercetools-uikit/async-select-input';
import { useIntl } from 'react-intl';
import Spacings from '@commercetools-uikit/spacings';
import messages from './messages';
import { formatLocalizedString } from '@commercetools-frontend/l10n';
import {
  GRAPHQL_TARGETS,
  NO_VALUE_FALLBACK,
} from '@commercetools-frontend/constants';
import { SingleValueProps, OptionProps } from 'react-select';
import { SearchIcon } from '@commercetools-uikit/icons';
import Text from '@commercetools-uikit/text';
import { useQuery } from '@apollo/client';
import ProductById from './product-by-id.graphql';
import { ContentNotification } from '@commercetools-uikit/notifications';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import { PageNotFound } from '@commercetools-frontend/application-components';
import { TQuery, TQuery_ProductArgs } from '../../../types/generated/ctp';
import { getErrorMessage } from '../../../helpers';
import { TAsyncSelectInputProps } from '@commercetools-uikit/async-select-input/dist/declarations/src/async-select-input';

export interface ProductValue extends Record<string, unknown> {
  id: number;
  name: string;
  productId: string;
  sku: string;
  image?: string;
}

export const ProductSearchSingleValue: FC<SingleValueProps<ProductValue>> = (
  props
) => {
  const { dataLocale } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
  }));

  const { data, loading, error } = useQuery<
    TQuery,
    { locale: string; sku: string } & TQuery_ProductArgs
  >(ProductById, {
    variables: {
      id: props.data.productId,
      sku: props.data.sku,
      locale: dataLocale,
    },
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });
  if (!props.data || !props.data.id) {
    return <AsyncSelectInput.SingleValue {...props} />;
  }
  if (error) {
    return (
      <ContentNotification type="error">
        <Text.Body>{getErrorMessage(error)}</Text.Body>
      </ContentNotification>
    );
  }
  if (loading) {
    return (
      <Spacings.Stack alignItems="center">
        <LoadingSpinner />
      </Spacings.Stack>
    );
  }
  if (!data?.product) {
    return <PageNotFound />;
  }

  return (
    <AsyncSelectInput.SingleValue {...props}>
      <Spacings.Inline>
        {data.product.masterData.staged?.variant?.images && (
          <div>
            <img
              style={{ height: '18px' }}
              src={data.product.masterData.staged?.variant?.images?.[0]?.url}
            />
          </div>
        )}
        <div>{`${data.product.masterData.staged?.name} (${
          data.product.masterData.staged?.variant?.key ||
          data.product.masterData.staged?.variant?.sku
        })`}</div>
      </Spacings.Inline>
    </AsyncSelectInput.SingleValue>
  );
};

const ProductSearchOption: FC<OptionProps<ProductValue>> = (props) => {
  const intl = useIntl();
  const variant = props.data;

  if (!variant) {
    return <AsyncSelectInput.Option {...props} />;
  }

  return (
    <AsyncSelectInput.Option {...props}>
      <Spacings.Inline>
        {variant.image && (
          <img src={variant.image} style={{ height: '75px' }} />
        )}
        <Spacings.Stack scale="xs">
          <Text.Detail isBold>{variant.name}</Text.Detail>
          {variant?.id && (
            <Text.Detail>{`${intl.formatMessage(messages.id)}: ${
              variant?.id
            }`}</Text.Detail>
          )}
          {variant?.sku && (
            <Text.Detail>{`${intl.formatMessage(messages.sku)}: ${
              variant?.sku
            }`}</Text.Detail>
          )}
        </Spacings.Stack>
      </Spacings.Inline>
    </AsyncSelectInput.Option>
  );
};
ProductSearchOption.displayName = 'ProductSearchOption';

interface ProductSearchInputProps {
  name: string;
  value?: ProductValue;
  filter?: string;
  placeholder?: string;
  hasError?: boolean;
  onBlur?(...args: unknown[]): unknown;
  onChange: TAsyncSelectInputProps['onChange'];
}

type Image = { url: string };

type ProductVariantResponse = {
  id: number;
  sku: string;
  isMatchingVariant: boolean;
  images: Array<Image>;
};
type ProductResponse = {
  id: string;
  name: { [locale: string]: string };
  masterVariant: ProductVariantResponse;
  variants: Array<ProductVariantResponse>;
};

const ProductSearchInput: FC<ProductSearchInputProps> = ({
  name,
  value,
  filter = '',
  placeholder,
  hasError,
  onBlur,
  onChange,
}) => {
  const { dataLocale, languages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
    languages: context.project?.languages ?? [],
  }));
  const intl = useIntl();

  const { refetch } = useMcQuery<
    {
      products: {
        results: Array<ProductResponse>;
      };
    },
    { locale: string; text: string; filter: string }
  >(ProductSearch, {
    fetchPolicy: 'cache-and-network',
    variables: {
      locale: dataLocale,
      text: '',
      filter,
    },
    skip: true,
    context: {
      target: 'ctp',
    },
  });

  const getMatchingVariants = (
    result: Array<ProductValue>,
    product: ProductResponse
  ) => {
    const base = {
      productId: product.id,
      name: formatLocalizedString(product, {
        key: 'name',
        locale: dataLocale,
        fallbackOrder: languages,
        fallback: NO_VALUE_FALLBACK,
      }),
    };

    const addMatchingVariant = (variant: ProductVariantResponse) => {
      if (variant.isMatchingVariant) {
        const item = {
          ...base,
          id: variant.id,
          sku: variant.sku,
          image: variant.images?.[0]?.url,
        };
        result.push(item);
      }
    };

    addMatchingVariant(product.masterVariant);

    product.variants.forEach((variant) => {
      addMatchingVariant(variant);
    });

    return result;
  };

  const loadOptions = (text: string) => {
    return refetch({ text }).then((response) => {
      return response.data.products.results.reduce<Array<ProductValue>>(
        getMatchingVariants,
        []
      );
    });
  };

  return (
    <AsyncSelectInput
      name={name}
      value={{ ...value }}
      placeholder={placeholder}
      isClearable
      isSearchable
      loadOptions={loadOptions}
      components={{
        // @ts-ignore
        SingleValue: ProductSearchSingleValue,
        // @ts-ignore
        Option: ProductSearchOption,
        DropdownIndicator: () => <SearchIcon color="primary" />,
      }}
      hasError={hasError}
      onBlur={onBlur}
      onChange={onChange}
      noOptionsMessage={() => intl.formatMessage(messages.noProductsFound)}
    />
  );
};
ProductSearchInput.displayName = 'ProductSearchInput';

export default ProductSearchInput;
