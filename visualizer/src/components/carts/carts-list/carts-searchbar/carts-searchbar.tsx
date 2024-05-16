import SelectableSearchInput, {
  TCustomEvent,
} from '@commercetools-uikit/selectable-search-input';
import { useIntl } from 'react-intl';
import { FC } from 'react';
import { ALL_FIELDS, SEARCH_FIELDS } from '../constants';
import messages from './messages';

type Props = {
  onReset: () => void;
  onChange: (event: TCustomEvent) => void;
  text: string;
  option: string;
};

const CartsSearchbar: FC<Props> = ({ onReset, onChange, text, option }) => {
  const intl = useIntl();

  let searchOptions = Object.values(SEARCH_FIELDS).map((item) => ({
    value: item,
    label: item,
  }));

  searchOptions.splice(0, 0, {
    value: ALL_FIELDS,
    label: intl.formatMessage(messages.allFieldsFilterOption),
  });

  const seachPlaceholderMessages: Record<string, string> = {};
  seachPlaceholderMessages[ALL_FIELDS] = intl.formatMessage(
    messages.allFieldsFilterPlaceholder
  );
  Object.values(SEARCH_FIELDS).forEach(
    (item) =>
      (seachPlaceholderMessages[item] = intl.formatMessage(
        messages.searchPlaceholder,
        { searchBy: item }
      ))
  );

  return (
    <>
      <SelectableSearchInput
        horizontalConstraint={15}
        value={{ text: text, option: option }}
        onChange={onChange}
        onSubmit={(val) => alert(val)}
        onReset={onReset}
        options={searchOptions}
        placeholder={seachPlaceholderMessages[option]}
      />
    </>
  );
};
export default CartsSearchbar;
