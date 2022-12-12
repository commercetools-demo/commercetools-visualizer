import { FC, ReactElement } from "react";
import { TFormValues } from "../../types";
import { useFormik, type FormikHelpers } from 'formik';
import { validate } from "./SubscriptionDetail";
import TextField from "@commercetools-uikit/text-field";
import messages from "./messages";
import { useIntl } from "react-intl";



type Formik = ReturnType<typeof useFormik>;

type FormProps = {
    formElements: ReactElement;
    values: Formik['values'];
    isDirty: Formik['dirty'];
    isSubmitting: Formik['isSubmitting'];
    submitForm: Formik['handleSubmit'];
    handleReset: Formik['handleReset'];
};

type Props = {
    onSubmit: (
        values: TFormValues,
        formikHelpers: FormikHelpers<TFormValues>
    ) => void | Promise<unknown>;
    initialValues: TFormValues;
    isReadOnly: boolean;
    dataLocale: string;
    children: (formProps: FormProps) => JSX.Element;
};

const SubscriptionDetailsForm: FC<Props> = ({ children, initialValues, onSubmit }) => {
    const formik = useFormik<TFormValues>({
        initialValues: initialValues,
        onSubmit: onSubmit,
        validate,
        enableReinitialize: true,
    });
    const intl = useIntl();
    const formElements = (
        <>
            <TextField
                name="id"
                title="Id"
                isRequired={true}
                isReadOnly={true}
                value={formik.values.id}
            />
            <TextField
                name="key"
                title="Key"
                isRequired={false}
                value={formik.values.key || ""}
                errors={TextField.toFieldErrors<TFormValues>(formik.errors).key}
                touched={formik.touched.key}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                renderError={(errorKey) => {
                    if (errorKey === 'duplicate') {
                        return intl.formatMessage(messages.duplicateKey);
                    }
                    return null;
                }}
            />
        </>
    );

    return children({
        formElements,
        values: formik.values,
        isDirty: formik.dirty,
        isSubmitting: formik.isSubmitting,
        submitForm: formik.handleSubmit,
        handleReset: formik.handleReset,
    });
}

SubscriptionDetailsForm.displayName = 'SubscriptionDetailsForm';

export default SubscriptionDetailsForm;