import { useCheckboxContext } from './CheckboxContext';

type Props = {
  value: string;
  label: string;
};

export default function CheckboxGroupItem({ value, label }: Props) {
  const { field, helpers } = useCheckboxContext();
  const checked = Boolean(field.value && field.value.find((_) => _ === value));
  return (
    <li>
      <label style={{ display: 'block' }}>
        <input
          {...field}
          type="checkbox"
          checked={checked}
          onChange={() => {
            if (checked) {
              helpers.setValue(field.value.filter((_) => _ !== value));
            } else {
              if (field.value) {
                helpers.setValue([...field.value, value]);
              } else {
                helpers.setValue([value]);
              }
            }
          }}
        />
        {label}
      </label>
    </li>
  );
}
