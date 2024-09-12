import Grid from '@commercetools-uikit/grid';
import CheckboxInput from '@commercetools-uikit/checkbox-input';
import { useCheckboxContext } from './CheckboxContext';

type Props<T> = {
  value: string;
  label: string;
  isChecked: (values: Array<T> | undefined, value: string) => boolean;
  removeItem: (values: Array<T> | undefined, value: string) => Array<T>;
  addItem: (values: Array<T> | undefined, value: string) => Array<T>;
  isReadOnly?: boolean;
};

export default function CheckboxGroupItem<T>({
  value,
  label,
  isChecked,
  removeItem,
  addItem,
  isReadOnly,
}: Props<T>) {
  const { field, helpers } = useCheckboxContext<T>();
  const checked = isChecked(field.value, value);
  return (
    <Grid.Item>
      <CheckboxInput
        isChecked={checked}
        onChange={() => {
          if (checked) {
            helpers.setValue(removeItem(field.value, value));
          } else {
            helpers.setValue(addItem(field.value, value));
          }
        }}
        isReadOnly={isReadOnly}
      >
        {label}
      </CheckboxInput>
    </Grid.Item>
  );
}
