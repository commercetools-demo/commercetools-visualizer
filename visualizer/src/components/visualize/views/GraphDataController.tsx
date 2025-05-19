import { useSigma } from '@react-sigma/core';
import { FC, PropsWithChildren, useEffect } from 'react';

import { Edge, FiltersState, Node } from './Root';

const GraphDataController: FC<PropsWithChildren<{ filters: FiltersState }>> = ({
  filters,
  children,
}) => {
  const sigma = useSigma<Node, Edge>();
  const graph = sigma.getGraph();

  /**
   * Apply filters to graphology:
   */
  useEffect(() => {
    const { clusters, tags } = filters;
    graph.forEachNode((node, { cluster, tag }) =>
      graph.setNodeAttribute(
        node,
        'hidden',
        (cluster && !clusters[cluster]) || (tag && !tags[tag]) || false
      )
    );
  }, [graph, filters]);

  return <>{children}</>;
};

export default GraphDataController;
