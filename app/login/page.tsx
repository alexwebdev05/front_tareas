"use client";

import { Formik, FormikHelpers } from 'formik';
import bcrypt from 'bcryptjs';

interface LoginValues {
    email: string;
    password: string;
}

interface LoginErrors {
    email?: string;
    password?: string;
}

export default function Login() {
    return (
        <div>
            <h2>Login</h2>
            <Formik<LoginValues>
                initialValues={{ email: '', password: '' }}
                validate={(values: LoginValues): LoginErrors => {
                    const errors: LoginErrors = {};
                    if (!values.email) {
                        errors.email = 'Required';
                    } else if (
                        !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
                    ) {
                        errors.email = 'Invalid email address';
                    }
                    return errors;
                }}
                onSubmit={async (values: LoginValues, { setSubmitting }: FormikHelpers<LoginValues>) => {
                    try {
                        const salt = await bcrypt.genSalt(10);
                        const hashedPassword = await bcrypt.hash(values.password, salt);

                        const encryptedData = {
                            email: values.email,
                            password: hashedPassword
                        };

                        alert(JSON.stringify(encryptedData, null, 2));
                        setSubmitting(false);
                    } catch (error) {
                        console.error('Error al encriptar la contraseña:', error);
                        setSubmitting(false);
                    }
                }}
            >
                {({
                    values,
                    errors,
                    touched,
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    isSubmitting,
                }) => (
                    <form onSubmit={handleSubmit}>
                        <input
                            type="email"
                            name="email"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.email}
                        />
                        {errors.email && touched.email && errors.email}
                        <input
                            type="password"
                            name="password"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.password}
                        />
                        {errors.password && touched.password && errors.password}
                        <button type="submit" disabled={isSubmitting}>
                            Submit
                        </button>
                    </form>
                )}
            </Formik>
        </div>
    );
}