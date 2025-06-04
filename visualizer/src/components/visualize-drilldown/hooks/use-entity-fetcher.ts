import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { EntityInfo, TreemapNode } from '../types';
import { Money } from '@commercetools/platform-sdk';

interface UseEntityFetcherResult {
  extractName: (entityInfo?: EntityInfo | TreemapNode) => string;
}

export const useEntityFetcher = (): UseEntityFetcherResult => {
  const context = useApplicationContext((context) => context);

  const extractName = (entityInfo?: EntityInfo | TreemapNode): string => {
    const { dataLocale } = context;
    if (
      typeof entityInfo?.name === 'object' &&
      (dataLocale || 'en-US') in entityInfo.name
    ) {
      return (
        entityInfo.name[dataLocale || 'en-US'] || entityInfo.name['en-US'] || ''
      );
    } else if (
      typeof entityInfo?.name === 'object' &&
      'currencyCode' in entityInfo.name &&
      'centAmount' in entityInfo.name
    ) {
      return Intl.NumberFormat(dataLocale || 'en-US', {
        style: 'currency',
        currency: (entityInfo.name as Money).currencyCode,
      }).format((entityInfo.name as Money).centAmount / 100);
    }
    return entityInfo?.name || entityInfo?.id || '';
  };

  return {
    extractName,
  };
};
