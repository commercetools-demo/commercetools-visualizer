import { SigmaContainer } from '@react-sigma/core';
import { createNodeImageProgram } from '@sigma/node-image';
import Graph, { DirectedGraph } from 'graphology';
import { constant, keyBy, mapValues } from 'lodash';
import { FC, useEffect, useMemo, useState } from 'react';
import { Settings } from 'sigma/settings';

import { drawHover, drawLabel } from '../utils/canvas-utils';
import GraphDataController from './GraphDataController';
import GraphEventsController from './GraphEventsController';
import GraphSettingsController from './GraphSettingsController';

import {
  formatLocalizedString,
  TProduct,
  TStore,
} from 'commercetools-demo-shared-helpers';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import forceAtlas2 from 'graphology-layout-forceatlas2';

import { Cluster } from './PanelItem';
import Panels from './Panels';
import Controls from './Controls';
import { Tag } from './TagsPanel';
import omit from 'lodash/omit';

export const randomInteger = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const addOrUpdateEdge = (
  id: string | number,
  parentId: string,
  edgeName: string | undefined,
  graph: Graph
) => {
  if (graph.hasEdge(parentId, id)) {
    const edgeAttributes = graph.getEdgeAttributes(parentId, id);
    graph.setEdgeAttribute(
      parentId,
      id,
      'label',
      edgeAttributes.label + ' + ' + edgeName
    );
  } else {
    graph.addEdge(parentId, id, { label: edgeName, type: 'arrow' });
  }
};

const addNodeWithEdge = (
  id: string | number,
  label: string | undefined | null,
  parentId: string,
  edgeName: string | undefined,
  cluster: string,
  color: string,
  graph: Graph
) => {
  if (!graph.hasNode(id)) {
    graph.addNode(id, {
      size: 5,
      label: label || id,
      x: randomInteger(0, 100),
      y: randomInteger(0, 100),
      cluster: cluster,
      color: color,
    });
  }

  addOrUpdateEdge(id, parentId, edgeName, graph);
};

export const addChannelWithEdge = (
  id: string | number,
  label: string | undefined | null,
  parentId: string,
  edgeName: string | undefined,
  color: string,
  graph: Graph
) => {
  if (!graph.hasNode(id)) {
    graph.addNode(id, {
      size: 5,
      label: label || id,
      x: randomInteger(0, 100),
      y: randomInteger(0, 100),
      cluster: 'channel',
      color: color,
    });
  }
  addOrUpdateEdge(id, parentId, edgeName, graph);
};

type Props = {
  products: Array<TProduct>;
  stores: Array<TStore>;
  clusters: Array<Cluster>;
  tags: Array<Tag>;
};

export interface FiltersState {
  clusters: Record<string, boolean>;
  tags: Record<string, boolean>;
}

const Root: FC<Props> = ({ products, stores, clusters, tags }) => {
  const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
    projectLanguages: context.project?.languages ?? [],
  }));

  const graph = useMemo(() => new DirectedGraph(), []);
  const [dataReady, setDataReady] = useState(false);
  const [filtersState, setFiltersState] = useState<FiltersState>({
    clusters: {},
    tags: {},
  });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const sigmaSettings: Partial<Settings> = useMemo(
    () => ({
      nodeProgramClasses: {
        image: createNodeImageProgram({
          size: { mode: 'force', value: 256 },
        }),
      },
      defaultDrawNodeLabel: drawLabel,
      defaultDrawNodeHover: drawHover,
      defaultNodeType: 'image',
      defaultEdgeType: 'arrow',
      labelDensity: 0.07,
      labelGridCellSize: 60,
      labelRenderedSizeThreshold: 15,
      labelFont: 'Lato, sans-serif',
      zIndex: true,
    }),
    []
  );

  // Load data on mount:
  useEffect(() => {
    products.forEach((product) => {
      graph.addNode(product.id, {
        label: formatLocalizedString(
          product.masterData.current?.nameAllLocales,
          dataLocale,
          projectLanguages
        ),
        key: product.key,
        x: randomInteger(0, 100),
        y: randomInteger(0, 100),
        cluster: 'product',
        //clusterName will be displayed on hover
        ...omit(
          clusters.find((cluster) => cluster.key === 'product'),
          'key'
        ),
        //image being used for overlay
        image:
          tags.find((tag) => tag.key === product.productType?.name)?.image ||
          'none.svg',

        color: clusters.find((cluster) => cluster.key === 'product')?.color,
        score: product.masterData.current?.variants.length,
        tag: product.productType?.name,
      });
      product.masterData.current?.masterVariant &&
        addNodeWithEdge(
          product.masterData.current?.masterVariant.id + product.id,
          product.masterData.current?.masterVariant.sku,
          product.id,
          'variant',
          'variant',
          '#C2C2FF',
          graph
        );
      product.masterData.current?.variants.forEach((variant) => {
        addNodeWithEdge(
          variant.id + product.id,
          variant.sku,
          product.id,
          'variant',
          'variant',
          '#C2C2FF',
          graph
        );
      });
    });
    stores.forEach((store) => {
      graph.addNode(store.id, {
        size: 5,
        label: formatLocalizedString(
          store.nameAllLocales,
          dataLocale,
          projectLanguages
        ),
        x: randomInteger(0, 100),
        y: randomInteger(0, 100),
        cluster: 'store',
        color: clusters.find((cluster) => cluster.key === 'store')?.color,
      });
      store.supplyChannels.forEach((channel) => {
        addChannelWithEdge(
          channel.id,
          formatLocalizedString(
            channel.nameAllLocales,
            dataLocale,
            projectLanguages
          ),
          store.id,
          'supplyChannel',
          '#9FF7EE',
          graph
        );
      });
      store.distributionChannels.forEach((channel) => {
        addChannelWithEdge(
          channel.id,
          formatLocalizedString(
            channel.nameAllLocales,
            dataLocale,
            projectLanguages
          ),
          store.id,
          'distributionChannel',
          '#9FF7EE',
          graph
        );
      });
      store.productSelections.forEach((productSelection) => {
        productSelection.productSelection &&
          addNodeWithEdge(
            productSelection.productSelection.id,
            formatLocalizedString(
              productSelection.productSelection.nameAllLocales,
              dataLocale,
              projectLanguages
            ),
            store.id,
            'productSelection',
            'productSelection',
            '#FFC806',
            graph
          );
        productSelection.productSelection?.productRefs.results.forEach(
          (product) => {
            productSelection.productSelection &&
              graph.hasNode(product.productRef.id) &&
              graph.hasNode(productSelection.productSelection.id) &&
              addOrUpdateEdge(
                product.productRef.id,
                productSelection.productSelection.id,
                'productSelection',
                graph
              );
          }
        );
      });
    });

    // Use degrees as node sizes:
    const scores = graph
      .nodes()
      .map((node) => graph.getNodeAttribute(node, 'score'))
      .filter((item) => item);
    const minDegree = Math.min(...scores);
    const maxDegree = Math.max(...scores);
    const MIN_NODE_SIZE = 3;
    const MAX_NODE_SIZE = 30;

    graph.forEachNode((node) => {
      const newSize =
        ((graph.getNodeAttribute(node, 'score') - minDegree) /
          (maxDegree - minDegree)) *
          (MAX_NODE_SIZE - MIN_NODE_SIZE) +
        MIN_NODE_SIZE;
      graph.setNodeAttribute(node, 'size', newSize);
    });

    setFiltersState({
      clusters: mapValues(keyBy<Cluster>(clusters, 'key'), constant(true)),
      tags: mapValues(keyBy(tags, 'key'), constant(true)),
    });
    requestAnimationFrame(() => setDataReady(true));
    forceAtlas2.assign(graph, {
      iterations: 100,
      settings: {
        gravity: 40,
        scalingRatio: 2,
      },
    });
  }, []);

  // graph.forEachNode((node) => console.log(graph.getNodeAttributes(node)));

  return (
    <SigmaContainer
      graph={graph}
      settings={sigmaSettings}
      style={{ height: '100%' }}
    >
      <GraphSettingsController hoveredNode={hoveredNode} />
      <GraphEventsController setHoveredNode={setHoveredNode} />
      <GraphDataController filters={filtersState} />

      {dataReady && (
        <>
          <Controls />
          <Panels
            clusters={clusters}
            tags={tags}
            filters={filtersState}
            setFiltersState={setFiltersState}
          />
        </>
      )}
    </SigmaContainer>
  );
};

export default Root;
