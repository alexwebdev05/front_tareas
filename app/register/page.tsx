"use client";

import { Formik, FormikHelpers } from 'formik';
import bcrypt from 'bcryptjs';

interface RegisterValues {
    username: string;
    email: string;
    password: string;
    nationality: string;
}

interface RegisterErrors {
    username?: string;
    email?: string;
    password?: string;
    nationality?: string;
}

export default function Register() {
    return (
        <div>
            <h2>Register</h2>
            <Formik<RegisterValues>
                initialValues={{ username: '', email: '', password: '', nationality: '' }}
                validate={(values: RegisterValues): RegisterErrors => {
                    const errors: RegisterErrors = {};
                    if (!values.username) {
                        errors.username = 'Required';
                    }
                    if (!values.email) {
                        errors.email = 'Required';
                    } else if (
                        !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
                    ) {
                        errors.email = 'Invalid email address';
                    }
                    if (!values.password) {
                        errors.password = 'Required';
                    }
                    if (!values.nationality) {
                        errors.nationality = 'Required';
                    }
                    return errors;
                }}
                onSubmit={async (values: RegisterValues, { setSubmitting }: FormikHelpers<RegisterValues>) => {
                    try {
                        const salt = await bcrypt.genSalt(10);
                        const hashedPassword = await bcrypt.hash(values.password, salt);

                        const encryptedData = {
                            username: values.username,
                            email: values.email,
                            password: hashedPassword,
                            nationality: values.nationality
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
                        <div>
                            <label htmlFor="username">Nombre de usuario</label>
                            <input
                                type="text"
                                name="username"
                                id="username"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.username}
                            />
                            {errors.username && touched.username && <div>{errors.username}</div>}
                        </div>

                        <div>
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.email}
                            />
                            {errors.email && touched.email && <div>{errors.email}</div>}
                        </div>

                        <div>
                            <label htmlFor="password">Contraseña</label>
                            <input
                                type="password"
                                name="password"
                                id="password"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.password}
                            />
                            {errors.password && touched.password && <div>{errors.password}</div>}
                        </div>

                        <div>
                            <label htmlFor="nationality">Nacionalidad</label>
                            <select
                                name="nationality"
                                id="nationality"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.nationality}
                            >
                                <option value="">Selecciona una nacionalidad</option>
                                <option value="ES">España</option>
                                <option value="MX">México</option>
                                <option value="AR">Argentina</option>
                                <option value="CO">Colombia</option>
                                <option value="CL">Chile</option>
                                <option value="PE">Perú</option>
                                <option value="VE">Venezuela</option>
                                <option value="EC">Ecuador</option>
                                <option value="GT">Guatemala</option>
                                <option value="CU">Cuba</option>
                                <option value="BO">Bolivia</option>
                                <option value="DO">República Dominicana</option>
                                <option value="HN">Honduras</option>
                                <option value="PY">Paraguay</option>
                                <option value="SV">El Salvador</option>
                                <option value="NI">Nicaragua</option>
                                <option value="CR">Costa Rica</option>
                                <option value="PA">Panamá</option>
                                <option value="UY">Uruguay</option>
                                <option value="US">Estados Unidos</option>
                                <option value="BR">Brasil</option>
                            </select>
                            {errors.nationality && touched.nationality && <div>{errors.nationality}</div>}
                        </div>

                        <button type="submit" disabled={isSubmitting}>
                            Registrarse
                        </button>
                    </form>
                )}
            </Formik>
        </div>
    )
}