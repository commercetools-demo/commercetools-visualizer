import { useSigma } from '@react-sigma/core';
import { keyBy, mapValues, sortBy, values } from 'lodash';
import { FC, useEffect, useMemo, useState } from 'react';

import CollapsiblePanel from '@commercetools-uikit/collapsible-panel';
import Text from '@commercetools-uikit/text';
import Spacings from '@commercetools-uikit/spacings';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import Constraints from '@commercetools-uikit/constraints';
import { CheckActiveIcon, CheckInactiveIcon } from '@commercetools-uikit/icons';

import PanelItem, { Cluster } from './PanelItem';
import Card from '@commercetools-uikit/card';
import { FiltersState } from './Root';

const ClustersPanel: FC<{
  clusters: Array<Cluster>;
  filters: FiltersState;
  toggleCluster: (cluster: string) => void;
  setClusters: (clusters: Record<string, boolean>) => void;
}> = ({ clusters, filters, toggleCluster, setClusters }) => {
  const sigma = useSigma();
  const graph = sigma.getGraph();

  const nodesPerCluster = useMemo(() => {
    const index: Record<string, number> = {};
    graph.forEachNode((_, { cluster }) => {
      return (index[cluster] = (index[cluster] || 0) + 1);
    });
    return index;
  }, []);

  const maxNodesPerCluster = useMemo(
    () => Math.max(...values(nodesPerCluster)),
    [nodesPerCluster]
  );
  const visibleClustersCount = useMemo(
    () => Object.keys(filters.clusters).length,
    [filters]
  );

  const [visibleNodesPerCluster, setVisibleNodesPerCluster] =
    useState<Record<string, number>>(nodesPerCluster);
  useEffect(() => {
    // To ensure the graphology instance has up to data "hidden" values for
    // nodes, we wait for next frame before reindexing. This won't matter in the
    // UX, because of the visible nodes bar width transition.
    requestAnimationFrame(() => {
      const index: Record<string, number> = {};
      graph.forEachNode(
        (_, { cluster, hidden }) =>
          !hidden && (index[cluster] = (index[cluster] || 0) + 1)
      );
      setVisibleNodesPerCluster(index);
    });
  }, [filters]);

  const sortedClusters = useMemo(
    () => sortBy(clusters, (cluster) => -nodesPerCluster[cluster.key]),
    [clusters, nodesPerCluster]
  );

  return (
    <Card theme={'light'} type={'raised'}>
      <CollapsiblePanel
        isDefaultClosed={true}
        header={
          <CollapsiblePanel.Header>
            <Spacings.Inline>
              <span>Clusters</span>
              {visibleClustersCount < clusters.length && (
                <Text.Caption>
                  ({visibleClustersCount} / {clusters.length})
                </Text.Caption>
              )}
            </Spacings.Inline>
          </CollapsiblePanel.Header>
        }
      >
        <Spacings.Stack scale={'m'}>
          <Constraints.Horizontal max={'scale'}>
            <Spacings.Inline scale={'m'} justifyContent={'center'}>
              <SecondaryButton
                iconLeft={<CheckActiveIcon />}
                style={{ flex: 1 }}
                label={'Check all'}
                onClick={() =>
                  setClusters(mapValues(keyBy(clusters, 'key'), () => true))
                }
              />
              <SecondaryButton
                iconLeft={<CheckInactiveIcon />}
                label={'Uncheck all'}
                style={{ flex: 1 }}
                onClick={() => setClusters({})}
              />
            </Spacings.Inline>
          </Constraints.Horizontal>

          <Spacings.Stack scale={'s'}>
            {sortedClusters.map((cluster) => {
              const nodesCount = nodesPerCluster[cluster.key];
              const visibleNodesCount =
                visibleNodesPerCluster[cluster.key] || 0;
              return (
                <PanelItem
                  label={cluster.clusterLabel}
                  itemKey={cluster.key}
                  color={cluster.color}
                  filter={filters.clusters}
                  toggleItem={toggleCluster}
                  maxNodes={maxNodesPerCluster}
                  nodesCount={nodesCount}
                  visibleNodesCount={visibleNodesCount}
                  key={cluster.key}
                />
              );
            })}
          </Spacings.Stack>
        </Spacings.Stack>
      </CollapsiblePanel>
    </Card>
  );
};

export default ClustersPanel;
