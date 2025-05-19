import { useSigma } from '@react-sigma/core';
import { keyBy, mapValues, sortBy, values } from 'lodash';
import { FC, useEffect, useMemo, useState } from 'react';

import CollapsiblePanel from '@commercetools-uikit/collapsible-panel';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import Card from '@commercetools-uikit/card';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import { CheckActiveIcon, CheckInactiveIcon } from '@commercetools-uikit/icons';
import Constraints from '@commercetools-uikit/constraints';
import PanelItem from './PanelItem';
import { FiltersState } from './Root';

export interface Tag {
  key: string;
  image?: string;
}

const TagsPanel: FC<{
  tags: Tag[];
  filters: FiltersState;
  toggleTag: (tag: string) => void;
  setTags: (tags: Record<string, boolean>) => void;
}> = ({ tags, filters, toggleTag, setTags }) => {
  const sigma = useSigma();
  const graph = sigma.getGraph();

  const nodesPerTag = useMemo(() => {
    const index: Record<string, number> = {};
    graph.forEachNode((_, { tag }) => (index[tag] = (index[tag] || 0) + 1));
    return index;
  }, []);

  const maxNodesPerTag = useMemo(
    () => Math.max(...values(nodesPerTag)),
    [nodesPerTag]
  );
  const visibleTagsCount = useMemo(
    () => Object.keys(filters.tags).length,
    [filters]
  );

  const [visibleNodesPerTag, setVisibleNodesPerTag] =
    useState<Record<string, number>>(nodesPerTag);
  useEffect(() => {
    // To ensure the graphology instance has up to date "hidden" values for
    // nodes, we wait for next frame before reindexing. This won't matter in the
    // UX, because of the visible nodes bar width transition.
    requestAnimationFrame(() => {
      const index: Record<string, number> = {};
      graph.forEachNode(
        (_, { tag, hidden }) => !hidden && (index[tag] = (index[tag] || 0) + 1)
      );
      setVisibleNodesPerTag(index);
    });
  }, [filters]);

  const sortedTags = useMemo(
    () =>
      sortBy(tags, (tag) =>
        tag.key === 'unknown' ? Infinity : -nodesPerTag[tag.key]
      ),
    [tags, nodesPerTag]
  );

  return (
    <Card theme={'light'} type={'raised'}>
      <CollapsiblePanel
        isDefaultClosed={true}
        header={
          <CollapsiblePanel.Header>
            <Spacings.Inline>
              <span>Categories</span>
              {visibleTagsCount < tags.length && (
                <Text.Caption>
                  ({visibleTagsCount} / {tags.length})
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
                  setTags(mapValues(keyBy(tags, 'key'), () => true))
                }
              />
              <SecondaryButton
                iconLeft={<CheckInactiveIcon />}
                label={'Uncheck all'}
                style={{ flex: 1 }}
                onClick={() => setTags({})}
              />
            </Spacings.Inline>
          </Constraints.Horizontal>

          <Spacings.Stack scale={'s'}>
            {sortedTags.map((tag) => {
              const nodesCount = nodesPerTag[tag.key];
              const visibleNodesCount = visibleNodesPerTag[tag.key] || 0;
              return (
                <PanelItem
                  label={tag.key}
                  itemKey={tag.key}
                  filter={filters.tags}
                  toggleItem={toggleTag}
                  maxNodes={maxNodesPerTag}
                  nodesCount={nodesCount}
                  visibleNodesCount={visibleNodesCount}
                  key={tag.key}
                />
              );
            })}
          </Spacings.Stack>
        </Spacings.Stack>
      </CollapsiblePanel>
    </Card>
  );
};

export default TagsPanel;
