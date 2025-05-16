import { FC, useState } from 'react';
import { SigmaContainer } from '@react-sigma/core';
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
import {
  formatLocalizedString,
  TProduct,
} from 'commercetools-demo-shared-helpers';
import LoadGraph from './load-graph';
import messages from './messages';
import { useIntl } from 'react-intl';
import SelectField from '@commercetools-uikit/select-field';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import Constraints from '@commercetools-uikit/constraints';
import { designTokens } from '@commercetools-uikit/design-system';

const sigmaStyle = { height: '100%', width: '100%' };

export type Props = { products: Array<TProduct> };

const Visualize: FC<Props> = ({}) => {
  const intl = useIntl();
  const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
    projectLanguages: context.project?.languages ?? [],
  }));
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

  const [searchString, setSearchString] = useState('');

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

  return (
    <div style={{ display: 'flex', flexDirection: 'row', padding: '20px' }}>
      <SigmaContainer style={sigmaStyle}>
        <LoadGraph
          products={products.results}
          stores={stores.results}
          selectedNode={searchString}
        />
      </SigmaContainer>
      <Constraints.Horizontal max={6}>
        <Spacings.Stack scale={'m'}>
          <SelectField
            name="title"
            value={searchString}
            options={products.results
              .map((product) => ({
                value: product.id,
                label: formatLocalizedString(
                  product.masterData.current?.nameAllLocales,
                  dataLocale,
                  projectLanguages
                ),
              }))
              .concat(
                stores.results.map((store) => ({
                  value: store.id,
                  label: formatLocalizedString(
                    store.nameAllLocales,
                    dataLocale,
                    projectLanguages
                  ),
                }))
              )}
            isClearable={true}
            title={intl.formatMessage(messages.title)}
            onChange={(event) =>
              setSearchString((event.target.value as string) || '')
            }
          />
          <Spacings.Stack>
            <div
              style={{
                backgroundColor: '#6359FF',
                padding: '10px',
                color: designTokens.colorPrimary98,
              }}
            >
              Product
            </div>
            <div
              style={{
                backgroundColor: '#C2C2FF',
                padding: '10px',
                color: designTokens.colorPrimary10,
              }}
            >
              Variant
            </div>
            <div
              style={{
                backgroundColor: '#0BBFBF',
                padding: '10px',
                color: designTokens.colorPrimary10,
              }}
            >
              Store
            </div>
            <div
              style={{
                backgroundColor: '#9FF7EE',
                padding: '10px',
                color: designTokens.colorPrimary10,
              }}
            >
              Channel
            </div>
            <div
              style={{
                backgroundColor: '#FFC806',
                padding: '10px',
                color: designTokens.colorPrimary10,
              }}
            >
              Product Selection
            </div>
          </Spacings.Stack>
        </Spacings.Stack>
      </Constraints.Horizontal>
    </div>
  );
};

export default Visualize;
