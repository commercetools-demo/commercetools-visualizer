import { useCheckboxContext } from './CheckboxContext';

type Props<T> = {
  value: string;
  label: string;
  isChecked: (values: Array<T> | undefined, value: string) => boolean;
  removeItem: (values: Array<T> | undefined, value: string) => Array<T>;
  addItem: (values: Array<T> | undefined, value: string) => Array<T>;
};

export default function CheckboxGroupItem<T>({
  value,
  label,
  isChecked,
  removeItem,
  addItem,
}: Props<T>) {
  const { field, helpers } = useCheckboxContext<T>();
  const checked = isChecked(field.value, value);
  return (
    <li>
      <label style={{ display: 'block' }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={() => {
            if (checked) {
              helpers.setValue(removeItem(field.value, value));
            } else {
              helpers.setValue(addItem(field.value, value));
            }
          }}
        />
        {label}
      </label>
    </li>
  );
}
