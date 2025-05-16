import { FC, useEffect, useMemo, useState } from 'react';

import Graph from 'graphology';
import { EdgeDisplayData, NodeDisplayData } from 'sigma/types';
import {
  formatLocalizedString,
  TProduct,
  TStore,
} from 'commercetools-demo-shared-helpers';

import {
  useLoadGraph,
  useRegisterEvents,
  useSetSettings,
  useSigmaContext,
} from '@react-sigma/core';
import forceAtlas2 from 'graphology-layout-forceatlas2';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';

export type Props = {
  products: Array<TProduct>;
  stores: Array<TStore>;
  selectedNode: string;
  suggestions?: Set<string> | undefined;
};

const randomInteger = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const addNodeWithEdge = (
  id: string | number,
  label: string | undefined | null,
  parentId: string,
  edgeName: string | undefined,
  color: string,
  graph: Graph
) => {
  if (!graph.hasNode(parentId + id)) {
    graph.addNode(parentId + id, {
      size: 5,
      label: label || id,
      x: randomInteger(0, 100),
      y: randomInteger(0, 100),

      color: color,
    });
  }

  if (graph.hasEdge(parentId, parentId + id)) {
    const edgeAttributes = graph.getEdgeAttributes(parentId, parentId + id);
    graph.setEdgeAttribute(
      parentId,
      parentId + id,
      'label',
      edgeAttributes.label + ' + ' + edgeName
    );
  } else {
    graph.addEdge(parentId, parentId + id, { label: edgeName, type: 'arrow' });
  }
};

const LoadGraph: FC<Props> = ({
  products,
  stores,
  selectedNode,
  suggestions,
}) => {
  const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
    projectLanguages: context.project?.languages ?? [],
  }));
  const loadGraph = useLoadGraph();
  const registerEvents = useRegisterEvents();
  const setSettings = useSetSettings();
  const graph = useMemo(() => new Graph(), []);

  const [hoveredNode, setHoveredNode] = useState<string | undefined>(undefined);

  const [hoveredNeighbors, setHoveredNeighbors] = useState<
    Set<string> | undefined
  >(undefined);

  const { sigma } = useSigmaContext();

  useEffect(() => {
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

        color: '#0BBFBF',
      });
      store.supplyChannels.forEach((channel) => {
        addNodeWithEdge(
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
        addNodeWithEdge(
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
            '#FFC806',
            graph
          );
      });
    });
    products.forEach((product) => {
      graph.addNode(product.id, {
        size: 5,
        label: formatLocalizedString(
          product.masterData.current?.nameAllLocales,
          dataLocale,
          projectLanguages
        ),
        x: randomInteger(0, 100),
        y: randomInteger(0, 100),

        color: '#6359FF',
      });
      product.masterData.current?.masterVariant &&
        addNodeWithEdge(
          product.masterData.current?.masterVariant.id,
          product.masterData.current?.masterVariant.sku,
          product.id,
          'variant',
          '#C2C2FF',
          graph
        );
      product.masterData.current?.variants.forEach((variant) => {
        addNodeWithEdge(
          variant.id,
          variant.sku,
          product.id,
          'variant',
          '#C2C2FF',
          graph
        );
      });
    });
    forceAtlas2.assign(graph, {
      iterations: 100,
      settings: {
        gravity: 40,
        scalingRatio: 2,
      },
    });
    loadGraph(graph);
  }, [loadGraph, graph]);

  function setHoveredNode2(node?: string) {
    if (node) {
      setHoveredNode(node);
      setHoveredNeighbors(new Set(graph.neighbors(node)));
    }

    if (!node) {
      setHoveredNode(undefined);
      setHoveredNeighbors(undefined);
    }

    // // Refresh rendering
    sigma.refresh({
      // We don't touch the graph data so we can skip its reindexation
      skipIndexation: true,
    });
  }

  useEffect(() => {
    registerEvents({
      enterNode: (event) => setHoveredNode2(event.node),
      leaveNode: () => setHoveredNode2(undefined),
    });
  }, []);

  useEffect(() => {
    setSettings({
      renderEdgeLabels: true,
      edgeReducer: (edge, data) => {
        const res: Partial<EdgeDisplayData> = { ...data };

        if (
          hoveredNode &&
          !graph
            .extremities(edge)
            .every(
              (n) => n === hoveredNode || graph.areNeighbors(n, hoveredNode)
            )
        ) {
          res.hidden = true;
        }

        if (
          suggestions &&
          (!suggestions.has(graph.source(edge)) ||
            !suggestions.has(graph.target(edge)))
        ) {
          res.hidden = true;
        }

        return res;
      },
      nodeReducer: (node, data) => {
        const res: Partial<NodeDisplayData> = { ...data };

        if (
          hoveredNeighbors &&
          !hoveredNeighbors.has(node) &&
          hoveredNode !== node
        ) {
          res.label = '';
          res.color = '#f6f6f6';
        }

        if (selectedNode === node) {
          res.highlighted = true;
        } else if (suggestions) {
          if (suggestions.has(node)) {
            res.forceLabel = true;
          } else {
            res.label = '';
            res.color = '#f6f6f6';
          }
        }

        return res;
      },
    });
  }, [graph, hoveredNode, hoveredNeighbors, selectedNode]);

  return null;
};

export default LoadGraph;
