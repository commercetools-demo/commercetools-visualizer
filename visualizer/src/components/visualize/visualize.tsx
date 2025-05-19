import { FC } from 'react';
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

export type Props = {};

const Visualize: FC<Props> = ({}) => {
  const { products, loading, error } = useProductsFetcher({
    limit: 200,
    offset: 0,
    includeAttributes: true,
  });

  const {
    stores,
    loading: storesLoading,
    error: storesError,
  } = useStoresFetcher({
    limit: 20,
    offset: 0,
  });

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
        stores={stores.results}
        products={products.results}
        clusters={clusters}
        tags={tags}
      />
    </div>
  );
};

export default Visualize;
