import { FC, useRef, useState } from 'react';
import '@react-sigma/core/lib/style.css';
import {
  getErrorMessage,
  useBusinessUnitsFetcher,
  useCustomersFetcher,
  useProductsFetcher,
  useStoresFetcher,
} from 'commercetools-demo-shared-data-fetching-hooks';
import { ContentNotification } from '@commercetools-uikit/notifications';
import Text from '@commercetools-uikit/text';
import Spacings from '@commercetools-uikit/spacings';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import { PageNotFound } from '@commercetools-frontend/application-components';
import Root from './views/Root';

import { Cluster } from './views/PanelItem';

import {
  TBusinessUnit,
  TProduct,
  TStore,
} from 'commercetools-demo-shared-helpers';

export type Props = {};

const Visualize: FC<Props> = () => {
  const [allProducts, setAllProducts] = useState<Array<TProduct>>([]);
  const offsetProductsRef = useRef(0);
  const hasMoreProductsRef = useRef(true);

  const [allStores, setAllStores] = useState<Array<TStore>>([]);
  const offsetStoresRef = useRef(0);
  const hasMoreStoresRef = useRef(true);

  const [allBusinessUnits, setAllBusinessUnits] = useState<
    Array<TBusinessUnit>
  >([]);
  const offsetBusinessUnitsRef = useRef(0);
  const hasMoreBusinessUnitsRef = useRef(true);

  const PAGE_SIZE = 30;

  const {
    customers,
    loading: customersLoading,
    error: customersError,
  } = useCustomersFetcher({ limit: 50, offset: 0 });

  const {
    products,
    loading,
    error,
    fetchMore: fetchMoreProducts,
  } = useProductsFetcher(
    {
      limit: PAGE_SIZE,
      offset: 0,
      includeAttributes: true,
    },
    {
      onCompleted: (initialData) => {
        const initialProducts = initialData.products.results;
        setAllProducts(initialProducts);
        offsetProductsRef.current = initialProducts.length;

        if (initialProducts.length === 0) {
          hasMoreProductsRef.current = false;
        } else {
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          autoFetchMoreProducts();
        }
      },
    }
  );

  const autoFetchMoreProducts = () => {
    fetchMoreProducts({
      variables: {
        offset: offsetProductsRef.current,
        limit: PAGE_SIZE,
      },
    }).then(({ data: moreData }) => {
      const newProducts = moreData.products.results;
      if (newProducts.length === 0) {
        hasMoreProductsRef.current = false;
        return;
      }

      setAllProducts((prev) => [...prev, ...newProducts]);
      offsetProductsRef.current += newProducts.length;

      autoFetchMoreProducts(); // recursive call
    });
  };

  const {
    stores,
    loading: storesLoading,
    error: storesError,
    fetchMore: fetchMoreStores,
  } = useStoresFetcher(
    {
      limit: PAGE_SIZE,
      offset: offsetStoresRef.current,
    },
    {
      onCompleted: (initialData) => {
        const initialStores = initialData.stores.results;
        setAllStores(initialStores);
        offsetProductsRef.current = initialStores.length;

        if (initialStores.length === 0) {
          hasMoreStoresRef.current = false;
        } else {
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          autoFetchMoreStores();
        }
      },
    }
  );

  const autoFetchMoreStores = () => {
    fetchMoreStores({
      variables: {
        offset: offsetStoresRef.current,
        limit: PAGE_SIZE,
      },
    }).then(({ data: moreData }) => {
      const newStores = moreData.stores.results;
      if (newStores.length === 0) {
        hasMoreStoresRef.current = false;
        return;
      }

      setAllStores((prev) => [...prev, ...newStores]);
      offsetStoresRef.current += newStores.length;

      autoFetchMoreStores(); // recursive call
    });
  };

  const {
    loading: businessUnitsLoading,
    error: businessUnitsError,
    fetchMore: fetchMoreBusinessUnits,
  } = useBusinessUnitsFetcher(
    {
      limit: PAGE_SIZE,
      offset: offsetBusinessUnitsRef.current,
    },
    {
      onCompleted: (initialData) => {
        const initialBusinessUnits = initialData.businessUnits.results;
        setAllBusinessUnits(initialBusinessUnits);
        offsetBusinessUnitsRef.current = initialBusinessUnits.length;

        if (initialBusinessUnits.length === 0) {
          hasMoreBusinessUnitsRef.current = false;
        } else {
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          autoFetchMoreBusinessUnits();
        }
      },
    }
  );

  const autoFetchMoreBusinessUnits = () => {
    fetchMoreBusinessUnits({
      variables: {
        offset: offsetBusinessUnitsRef.current,
        limit: PAGE_SIZE,
      },
    }).then(({ data: moreData }) => {
      const newBusinessUnits = moreData.businessUnits.results;
      if (newBusinessUnits.length === 0) {
        hasMoreBusinessUnitsRef.current = false;
        return;
      }

      setAllBusinessUnits((prev) => [...prev, ...newBusinessUnits]);
      offsetBusinessUnitsRef.current += newBusinessUnits.length;

      autoFetchMoreBusinessUnits(); // recursive call
    });
  };

  if (error) {
    return (
      <ContentNotification type="error">
        <Text.Body>{getErrorMessage(error)}</Text.Body>
      </ContentNotification>
    );
  }
  if (storesError) {
    return (
      <ContentNotification type="error">
        <Text.Body>{getErrorMessage(storesError)}</Text.Body>
      </ContentNotification>
    );
  }
  if (businessUnitsError) {
    return (
      <ContentNotification type="error">
        <Text.Body>{getErrorMessage(businessUnitsError)}</Text.Body>
      </ContentNotification>
    );
  }
  if (customersError) {
    return (
      <ContentNotification type="error">
        <Text.Body>{getErrorMessage(customersError)}</Text.Body>
      </ContentNotification>
    );
  }
  if (loading || storesLoading || businessUnitsLoading || customersLoading) {
    return (
      <Spacings.Stack alignItems="center">
        <LoadingSpinner />
      </Spacings.Stack>
    );
  }

  if (!products || !stores) {
    return <PageNotFound />;
  }

  const clusters: Array<Cluster> = [
    {
      key: 'product',
      color: '#6359FF',
      clusterLabel: 'Product',
    },
    {
      key: 'variant',
      color: '#C2C2FF',
      clusterLabel: 'Variant',
    },
    { key: 'store', color: '#0BBFBF', clusterLabel: 'Store' },
    { key: 'businessUnit', color: '#FF8B00', clusterLabel: 'Business Unit' },
    { key: 'channel', color: '#9FF7EE', clusterLabel: 'Channel' },
    {
      key: 'productSelection',
      color: '#FFC806',
      clusterLabel: 'Product Selection',
    },
    {
      key: 'customer',
      color: '#DEDAD4',
      clusterLabel: 'Customer',
    },
  ];

  const productTypeNames: Set<string> = new Set();

  allProducts.forEach(
    (p) => p.productType && productTypeNames.add(p.productType?.name)
  );

  return (
    <Root
      stores={allStores}
      products={allProducts}
      businessUnits={allBusinessUnits}
      customers={customers?.results}
      clusters={clusters}
      tags={Array.from(productTypeNames).map((productTypeName) => ({
        key: productTypeName,
      }))}
    />
  );
};

export default Visualize;
