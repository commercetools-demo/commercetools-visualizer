import { useSigma } from '@react-sigma/core';
import { Attributes } from 'graphology-types';
import { FC, useEffect, useState } from 'react';

import SearchSelectInput from '@commercetools-uikit/search-select-input';
type SearchType = {
  value: string;
  label: string;
};
const SearchField: FC = () => {
  const sigma = useSigma();

  const [search, setSearch] = useState<SearchType | undefined>();

  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (!selected) return;

    sigma.getGraph().setNodeAttribute(selected, 'highlighted', true);
    const nodeDisplayData = sigma.getNodeDisplayData(selected);

    if (nodeDisplayData)
      sigma.getCamera().animate(
        { ...nodeDisplayData, ratio: 0.05 },
        {
          duration: 600,
        }
      );

    return () => {
      sigma.getGraph().setNodeAttribute(selected, 'highlighted', false);
    };
  }, [selected]);

  const loadOptions = async (inputValue: string) => {
    const newValues: Array<{
      value: string;
      label: string;
    }> = [];
    const lcSearch = inputValue.toLowerCase();
    if (!selected && lcSearch.length > 1) {
      sigma
        .getGraph()
        .forEachNode((id: string, attributes: Attributes): void => {
          if (
            !attributes.hidden &&
            attributes.label &&
            attributes.label.toLowerCase().indexOf(lcSearch) === 0
          )
            newValues.push({
              value: id,
              label: attributes.label,
            });
        });
    }
    return newValues;
  };

  return (
    <SearchSelectInput
      loadOptions={loadOptions}
      isClearable
      value={search}
      onChange={(event) => {
        console.log(event.target);
        if (!event.target.value) {
          setSelected(null);
          setSearch(undefined);
        } else {
          setSelected((event.target.value as SearchType).value);
          setSearch(event.target.value as SearchType);
        }
      }}
    />
  );
};

export default SearchField;
