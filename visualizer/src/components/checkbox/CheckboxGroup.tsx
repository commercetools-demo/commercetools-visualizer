import { useField } from 'formik';
import { PropsWithChildren } from 'react';
import Item from './CheckboxGroupItem';
import { CheckboxProvider } from './CheckboxContext';
import Constraints from '@commercetools-uikit/constraints';
import Grid from '@commercetools-uikit/grid';
import CollapsiblePanel from '@commercetools-uikit/collapsible-panel';

type Props = PropsWithChildren<{
  name: string;
  label: string;
}>;

function CheckboxGroup<T>({ name, label, children }: Props) {
  const [field, meta, helpers] = useField<Array<T>>(name);
  return (
    <CheckboxProvider<T> value={{ field, helpers, meta }}>
      <Constraints.Horizontal max="scale">
        <CollapsiblePanel header={label}>
          <Grid
            gridGap="8px"
            gridAutoColumns="1fr"
            gridTemplateColumns={`repeat(3, 1fr)`}
          >
            {children}
          </Grid>
        </CollapsiblePanel>
      </Constraints.Horizontal>
    </CheckboxProvider>
  );
}

export default Object.assign(CheckboxGroup, { Item });
