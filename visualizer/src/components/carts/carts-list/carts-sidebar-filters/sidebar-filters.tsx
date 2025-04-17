import Spacings from '@commercetools-uikit/spacings';
import FilterSection from './filter-section';
import { FC } from 'react';
import { Filter } from './filter-section/filter-section';
import { FilterValue } from '../carts-list';

type SidebarFiltersProps = {
  selectedFilters: Record<string, FilterValue>;
  onChange: (filter: string, value: FilterValue) => void;
};

const SidebarFilters: FC<SidebarFiltersProps> = ({
  selectedFilters,
  onChange,
}) => {
  const recentFilters: Record<string, Filter> = {
    cartState: { id: 'cartState', type: 'status' },
    createdAt: { id: 'createdAt', type: 'createdAt' },
  };
  const orderOfFilters: Array<string> = ['cartState', 'createdAt'];

  return (
    <div>
      {orderOfFilters.map((filterType, index) => {
        const filter = recentFilters[filterType];
        return (
          <div key={filter.id}>
            <Spacings.Inset scale="l">
              <FilterSection
                key={filter.id}
                filter={filter}
                activeValue={selectedFilters[filterType]}
                onChange={onChange}
                // isSelectable={isInEditMode}
                // toggleSelection={() => toggleSelection(filter.id)}
                // isSectionSelected={selectedFilterSections[filter.id] || false}
                // toggleOpen={() => toggleSectionOpen(filter.id)}
                // isSectionOpen={Boolean(openFilterSections[filter.id])}
              />
            </Spacings.Inset>
            {index < orderOfFilters.length - 1 && <hr />}
          </div>
        );
      })}
    </div>
  );
};
// needed because of the use of memo
SidebarFilters.displayName = 'SidebarFilters';

export default SidebarFilters;
