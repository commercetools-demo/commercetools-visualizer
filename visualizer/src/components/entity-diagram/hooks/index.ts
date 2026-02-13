import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { MC_API_PROXY_TARGETS } from '@commercetools-frontend/constants';
import {
  actions,
  TSdkAction,
  useAsyncDispatch,
} from '@commercetools-frontend/sdk';
import { useCustomObjectCreatorOrUpdater, useCustomObjectFetcher, useCustomObjectsFetcher } from 'commercetools-demo-shared-data-fetching-hooks';
import { buildUrlWithParams } from '../utils';
import {
  mapProductTypeToGoEntities,
  mapSchemaTypeToGoEntities,
  mapTypeToGoEntities
} from './mapper';
import {
  LinkData,
  LocationData,
  PagedQueryResponse,
  ProductTypeResponse,
  SchemaTypeResponse,
  TypeResponse
} from './types';
import { useMemo } from 'react';

const SCHEMA_CONTAINER = 'mc-custom-object-schema';
const LINK_DATA_CONTAINER = 'mc-link-data';
const LINK_DATA_KEY = 'linkDataList';
const LOCATION_DATA_KEY = 'locationDataList';

export const useConnector = () => {
  const context = useApplicationContext((context) => context);
  const { customObjects: schemasRaw, loading: isSchemasLoading, error: schemasError } = useCustomObjectsFetcher({
    container: SCHEMA_CONTAINER,
    limit: 200,
    offset: 0,
  });

  const { customObject: linkDataRaw, loading: isLinkDataLoading, error: linkDataError } = useCustomObjectFetcher({
    container: LINK_DATA_CONTAINER,
    key: LINK_DATA_KEY,
  });

  const { customObject: locationDataRaw, loading: isLocationDataLoading, error: locationDataError } = useCustomObjectFetcher({
    container: LINK_DATA_CONTAINER,
    key: LOCATION_DATA_KEY,
  });

  const schemas = useMemo(() => {
    if (isSchemasLoading) return [];
    if (schemasError) return [];
    if ((schemasRaw as unknown as PagedQueryResponse<SchemaTypeResponse>).results.length === 0) return [];
    return mapSchemaTypeToGoEntities(schemasRaw as unknown as PagedQueryResponse<SchemaTypeResponse>);

  }, [schemasRaw]);



  const { execute: saveCustomObject } = useCustomObjectCreatorOrUpdater();

  const dispatchProductTypeRead = useAsyncDispatch<
    TSdkAction,
    PagedQueryResponse<ProductTypeResponse>
  >();
  const dispatchTypeRead = useAsyncDispatch<
    TSdkAction,
    PagedQueryResponse<TypeResponse>
  >();



  const fetchAllProductTypes = async (
    limit: number = 200,
    page: number = 1
  ) => {
    const offset = (page - 1) * limit;

    const result = await dispatchProductTypeRead(
      actions.get({
        mcApiProxyTarget: MC_API_PROXY_TARGETS.COMMERCETOOLS_PLATFORM,
        uri: buildUrlWithParams(`/${context?.project?.key}/product-types`, {
          ...(limit && { limit: limit.toString() }),
          ...(offset && { offset: offset.toString() }),
        }),
      })
    );
    return result;
  };

  const fetchAllTypes = async (limit: number = 200, page: number = 1) => {
    const offset = (page - 1) * limit;

    const result = await dispatchTypeRead(
      actions.get({
        mcApiProxyTarget: MC_API_PROXY_TARGETS.COMMERCETOOLS_PLATFORM,
        uri: buildUrlWithParams(`/${context?.project?.key}/types`, {
          ...(limit && { limit: limit.toString() }),
          ...(offset && { offset: offset.toString() }),
        }),
      })
    );
    return result;
  };
  const saveLinkData = async (linkDataList: LinkData[]) => {

    const result = await saveCustomObject({
      draft: {
        container: LINK_DATA_CONTAINER,
        key: LINK_DATA_KEY,
        value: JSON.stringify(linkDataList),
      }
    });

    return result;
  };
  const saveLocationData = async (locationDataList: LocationData[]) => {

    const result = await saveCustomObject({
      draft: {
        container: LINK_DATA_CONTAINER,
        key: LOCATION_DATA_KEY,
        value: JSON.stringify(locationDataList),
      }
    });
    return result;
  };

  const fetchAll = async () => {
    if (isLocationDataLoading) return { productTypes: undefined, types: undefined, locationDataRaw: undefined };
    const [productTypes, types] = await Promise.all([

      fetchAllProductTypes().then((result) =>
        mapProductTypeToGoEntities(result, locationDataRaw?.value as any)
      ),
      fetchAllTypes().then((result) =>
        mapTypeToGoEntities(result, locationDataRaw?.value as any)
      ),
    ]);
    return { productTypes, types, locationDataRaw };
  };

  return {
    saveLinkData,
    saveLocationData,
    fetchAll,
    schemas,
    linkData: linkDataRaw?.value as any,
    locationData: locationDataRaw?.value as any,
    isSchemasLoading,
    isLinkDataLoading,
    isLocationDataLoading,
    schemasError,
    linkDataError,
    locationDataError,
  };
};
