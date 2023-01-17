import { FieldHelperProps, FieldInputProps, FieldMetaProps } from 'formik';
import { createContext, useContext } from 'react';

type Context = {
  field: FieldInputProps<Array<string>>;
  helpers: FieldHelperProps<Array<string>>;
  meta: FieldMetaProps<Array<string>>;
};

const CheckboxContext = createContext<Context | null>(null);
export const CheckboxProvider = CheckboxContext.Provider;

export function useCheckboxContext() {
  const context = useContext(CheckboxContext);
  if (!context) {
    throw new Error('Must be used in scope of a CheckboxProvider');
  }

  return context;
}
