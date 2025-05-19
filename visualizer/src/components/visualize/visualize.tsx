import { FC, useRef, useState } from 'react';
import '@react-sigma/core/lib/style.css';
import {
  getErrorMessage,
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

import { Tag } from './views/TagsPanel';
import { TProduct, TStore } from 'commercetools-demo-shared-helpers';

export type Props = {};

const Visualize: FC<Props> = ({}) => {
  const [allProducts, setAllProducts] = useState<Array<TProduct>>([]);
  const offsetProductsRef = useRef(0);
  const hasMoreProductsRef = useRef(true);

  const [allStores, setAllStores] = useState<Array<TStore>>([]);
  const offsetStoresRef = useRef(0);
  const hasMoreStoresRef = useRef(true);

  const PAGE_SIZE = 30;

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
  if (loading || storesLoading) {
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
    { key: 'channel', color: '#9FF7EE', clusterLabel: 'Channel' },
    {
      key: 'productSelection',
      color: '#FFC806',
      clusterLabel: 'Product Selection',
    },
  ];

  const tags: Array<Tag> = [
    {
      key: 'Furniture and decor',
      // image: 'https://www.sigmajs.org/demo/images/company.svg',
    },
    {
      key: 'Product sets',
      // image: 'https://www.sigmajs.org/demo/images/company.svg',
    },
    {
      key: 'Configurable',
      // image: 'https://www.sigmajs.org/demo/images/company.svg',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'row', padding: '20px' }}>
      <Root
        stores={allStores}
        products={allProducts}
        clusters={clusters}
        tags={tags}
      />
    </div>
  );
};

export default Visualize;
