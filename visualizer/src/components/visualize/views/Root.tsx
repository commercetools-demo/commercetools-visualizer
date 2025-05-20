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
  notEmpty,
  TBusinessUnit,
  TCustomer,
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

export type Node = {
  size?: number;
  label: string;
  key?: string;
  x: number;
  y: number;
  cluster?: string;
  color?: string;
  image?: string;
  tag?: string;
  score?: number;
  hidden?: boolean;
};

export type Edge = {
  label: string;
  type: 'arrow';
};

const addOrUpdateEdge = (
  id: string | number,
  parentId: string,
  edgeName: string,
  graph: Graph<Node, Edge>
) => {
  if (graph.hasNode(id) && graph.hasNode(parentId)) {
    if (graph.hasEdge(parentId, id)) {
      const edgeAttributes = graph.getEdgeAttributes(parentId, id);
      graph.setEdgeAttribute(
        parentId,
        id,
        'label',
        edgeAttributes.label === edgeName
          ? edgeName
          : edgeAttributes.label + ' + ' + edgeName
      );
    } else {
      graph.addEdge(parentId, id, { label: edgeName, type: 'arrow' });
    }
  }
};

const addOrUpdateNode = (
  graph: Graph<Node, Edge>,
  id: string | number,
  label: string | undefined | null,
  cluster: string,
  clusters: Array<Cluster>,
  tag?: string,
  tags?: Array<Tag>,
  score = 1
) => {
  const attributes: Node = {
    label: label || String(id),
    x: randomInteger(0, 100),
    y: randomInteger(0, 100),
    cluster: cluster,
    size: 5,
    //clusterName will be displayed on hover
    ...omit(
      clusters.find((c) => c.key === cluster),
      'key'
    ),
    //image being used for overlay
    image: (tag && tags?.find((t) => t.key === tag)?.image) || undefined,
    score: score,
  };

  if (!graph.hasNode(id)) {
    graph.addNode(id, {
      ...attributes,
    });
  } else {
    graph.updateNode(id, (oldAttributes) => ({
      ...oldAttributes,
      ...attributes,
    }));
  }
};

const addNodeWithEdge = (
  graph: Graph<Node, Edge>,
  id: string | number,
  label: string | undefined | null,
  parentId: string,
  edgeName: string,
  cluster: string,
  clusters: Array<Cluster>,
  tag?: string,
  tags?: Array<Tag>,
  score = 1
) => {
  addOrUpdateNode(
    graph,
    id,
    label || String(id),
    cluster,
    clusters,
    tag,
    tags,
    score
  );
  addOrUpdateEdge(id, parentId, edgeName, graph);
};

type Props = {
  products: Array<TProduct>;
  stores: Array<TStore>;
  clusters: Array<Cluster>;
  tags: Array<Tag>;
  businessUnits?: Array<TBusinessUnit>;
  customers?: Array<TCustomer>;
};

export interface FiltersState {
  clusters: Record<string, boolean>;
  tags: Record<string, boolean>;
}

const Root: FC<Props> = ({
  products,
  stores,
  businessUnits,
  customers,
  clusters,
  tags,
}) => {
  const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
    projectLanguages: context.project?.languages ?? [],
  }));

  const graph = useMemo(() => new DirectedGraph<Node, Edge>(), []);
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
      allowInvalidContainer: true,
      defaultDrawNodeLabel: drawLabel,
      defaultDrawNodeHover: drawHover,
      defaultNodeType: 'image',
      defaultEdgeType: 'arrow',
      labelDensity: 0.07,
      labelGridCellSize: 60,
      labelRenderedSizeThreshold: 15,
      zIndex: true,
    }),
    []
  );

  // Load data on mount:
  useEffect(() => {
    customers?.forEach((customer) => {
      addOrUpdateNode(graph, customer.id, customer.email, 'customer', clusters);
    });
    products.forEach((product) => {
      addOrUpdateNode(
        graph,
        product.id,
        formatLocalizedString(
          product.masterData.current?.nameAllLocales,
          dataLocale,
          projectLanguages
        ),
        'product',
        clusters,
        product.productType?.name,
        tags,
        product.masterData.current?.variants.length
      );
      product.masterData.current?.masterVariant &&
        addNodeWithEdge(
          graph,
          product.masterData.current?.masterVariant.id + product.id,
          product.masterData.current?.masterVariant.sku,
          product.id,
          'variant',
          'variant',
          clusters
        );
      product.masterData.current?.variants.forEach((variant) => {
        addNodeWithEdge(
          graph,
          variant.id + product.id,
          variant.sku,
          product.id,
          'variant',
          'variant',
          clusters
        );
      });
    });

    stores.forEach((store) => {
      addOrUpdateNode(
        graph,
        store.id,
        formatLocalizedString(
          store.nameAllLocales,
          dataLocale,
          projectLanguages
        ),
        'store',
        clusters
      );
    });
    stores.forEach((store) => {
      store.supplyChannels.forEach((channel) => {
        addNodeWithEdge(
          graph,
          channel.id,
          formatLocalizedString(
            channel.nameAllLocales,
            dataLocale,
            projectLanguages
          ),
          store.id,
          'supplyChannel',
          'channel',
          clusters
        );
      });
    });
    stores.forEach((store) => {
      store.distributionChannels.forEach((channel) => {
        addNodeWithEdge(
          graph,
          channel.id,
          formatLocalizedString(
            channel.nameAllLocales,
            dataLocale,
            projectLanguages
          ),
          store.id,
          'distributionChannel',
          'channel',
          clusters
        );
      });
    });
    stores.forEach((store) => {
      store.productSelections.forEach((productSelection) => {
        productSelection.productSelection &&
          addNodeWithEdge(
            graph,
            productSelection.productSelection.id,
            formatLocalizedString(
              productSelection.productSelection.nameAllLocales,
              dataLocale,
              projectLanguages
            ),
            store.id,
            'productSelection',
            'productSelection',
            clusters
          );
        productSelection.productSelection?.productRefs.results.forEach(
          (product) => {
            productSelection.productSelection &&
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

    businessUnits?.forEach((businessUnit) => {
      addOrUpdateNode(
        graph,
        businessUnit.id,
        businessUnit.name,
        'businessUnit',
        clusters
      );
      businessUnit.stores?.forEach((store) => {
        addOrUpdateEdge(store.id, businessUnit.id, 'store', graph);
      });
      businessUnit.associates.forEach((associate) => {
        const roles = new Set<string>();
        associate.associateRoleAssignments.forEach(
          (ara) => ara.associateRole.name && roles.add(ara.associateRole.name)
        );
        associate.customerRef?.id &&
          addOrUpdateEdge(
            associate.customerRef.id,
            businessUnit.id,
            Array.from(roles).join(' + '),
            graph
          );
      });
    });
    businessUnits?.forEach((businessUnit) => {
      if (businessUnit.parentUnit?.id) {
        addOrUpdateEdge(
          businessUnit.parentUnit?.id,
          businessUnit.id,
          'parent',
          graph
        );
      }
    });

    // Use degrees as node sizes:
    const scores: Array<number> = graph
      .nodes()
      .map((node) => graph.getNodeAttribute(node, 'score'))
      .filter(notEmpty);
    const minDegree = Math.min(...scores);
    const maxDegree = Math.max(...scores);
    const MIN_NODE_SIZE = 1;
    const MAX_NODE_SIZE = 15;

    graph.forEachNode((node) => {
      const newSize =
        (((graph.getNodeAttribute(node, 'score') || 1) - minDegree) /
          (maxDegree - minDegree)) *
          (MAX_NODE_SIZE - MIN_NODE_SIZE) +
        MIN_NODE_SIZE;
      graph.setNodeAttribute(node, 'size', newSize);
    });

    setFiltersState({
      clusters: mapValues(keyBy<Cluster>(clusters, 'key'), constant(true)),
      tags: mapValues(keyBy(tags, 'key'), constant(true)),
    });
    forceAtlas2.assign(graph, {
      iterations: 100,
      settings: {
        gravity: 40,
        scalingRatio: 2,
      },
    });
  }, [products, stores, businessUnits, customers, clusters, tags]);

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

      <Controls />
      <Panels
        clusters={clusters}
        tags={tags}
        filters={filtersState}
        setFiltersState={setFiltersState}
      />
    </SigmaContainer>
  );
};

export default Root;
