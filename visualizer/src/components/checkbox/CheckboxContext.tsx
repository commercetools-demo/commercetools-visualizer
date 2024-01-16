import { FieldHelperProps, FieldInputProps, FieldMetaProps } from 'formik';
import { createContext, PropsWithChildren, useContext } from 'react';

type Context<T> = {
  field: FieldInputProps<Array<T>>;
  helpers: FieldHelperProps<Array<T>>;
  meta: FieldMetaProps<Array<T>>;
};

const CheckboxContext = createContext<Context<any> | null>(null);

type Props<T> = PropsWithChildren<{ value: Context<T> }>;

export function CheckboxProvider<T>({ value, children }: Props<T>) {
  return (
    <CheckboxContext.Provider value={{ ...value }}>
      {children}
    </CheckboxContext.Provider>
  );
}

export function useCheckboxContext<T>(): Context<T> {
  const context = useContext<Context<T> | null>(CheckboxContext);
  if (!context) {
    throw new Error('Must be used in scope of a CheckboxProvider');
  }

  return context;
}
