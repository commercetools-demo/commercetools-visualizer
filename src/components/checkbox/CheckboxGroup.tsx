import { ErrorMessage, useField } from 'formik';
import { PropsWithChildren } from 'react';
import Item from './CheckboxGroupItem';
import { CheckboxProvider } from './CheckboxContext';
import styles from './checkbox.module.css';

type Props = PropsWithChildren<{
  columns?: number;
  name: string;
  label: string;
}>;

function CheckboxGroup({ name, label, columns = 1, children }: Props) {
  const [field, meta, helpers] = useField<Array<string>>(name);
  return (
    <CheckboxProvider value={{ field, helpers, meta }}>
      <fieldset>
        <legend>{label}</legend>

        <ErrorMessage
          name={name}
          render={(msg) => <span style={{ color: 'red' }}>{msg}</span>}
        />
        <ul
          style={{ columnCount: columns }}
          className={styles['checkbox-group']}
        >
          {children}
        </ul>
      </fieldset>
    </CheckboxProvider>
  );
}

export default Object.assign(CheckboxGroup, { Item });
