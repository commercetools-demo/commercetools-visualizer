import { FC } from 'react';
import Spacings from '@commercetools-uikit/spacings';
import Card from '@commercetools-uikit/card';
import SearchField from './SearchField';
import ClustersPanel from './ClustersPanel';
import { omit } from 'lodash';
import TagsPanel, { Tag } from './TagsPanel';
import { Cluster } from './PanelItem';
import styled from '@emotion/styled';
import { FiltersState } from './Root';

const Panel = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  overflow-y: auto;
  scrollbar-width: thin;
`;

export type Props = {
  clusters: Array<Cluster>;
  tags: Array<Tag>;
  filters: FiltersState;
  setFiltersState: (filters: FiltersState) => void;
};

const Panels: FC<Props> = ({ clusters, tags, filters, setFiltersState }) => {
  return (
    <Panel>
      <Spacings.Stack scale={'m'}>
        <Card theme={'light'} type={'raised'}>
          <SearchField />
        </Card>

        <ClustersPanel
          clusters={clusters}
          filters={filters}
          setClusters={(clusters) =>
            setFiltersState({
              ...filters,
              clusters,
            })
          }
          toggleCluster={(cluster) => {
            setFiltersState({
              ...filters,
              clusters: filters.clusters[cluster]
                ? omit(filters.clusters, cluster)
                : { ...filters.clusters, [cluster]: true },
            });
          }}
        />
        <TagsPanel
          tags={tags}
          filters={filters}
          setTags={(tags) =>
            setFiltersState({
              ...filters,
              tags,
            })
          }
          toggleTag={(tag) => {
            setFiltersState({
              ...filters,
              tags: filters.tags[tag]
                ? omit(filters.tags, tag)
                : { ...filters.tags, [tag]: true },
            });
          }}
        />
      </Spacings.Stack>
    </Panel>
  );
};

export default Panels;
