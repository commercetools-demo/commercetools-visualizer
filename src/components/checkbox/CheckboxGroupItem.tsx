import { useCheckboxContext } from './CheckboxContext';

type Props = {
  value: string;
  label: string;
  isChecked: (values: Array<string> | undefined, value: string) => boolean;
  removeItem: (
    values: Array<string> | undefined,
    value: string
  ) => Array<string>;
  addItem: (values: Array<string> | undefined, value: string) => Array<string>;
};

export default function CheckboxGroupItem({
  value,
  label,
  isChecked,
  removeItem,
  addItem,
}: Props) {
  const { field, helpers } = useCheckboxContext();
  const checked = isChecked(field.value, value);
  return (
    <li>
      <label style={{ display: 'block' }}>
        <input
          {...field}
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
