"use client";

import { Formik, FormikHelpers } from 'formik';
import { useState } from 'react';

interface RegisterValues {
  nombre: string;
  email: string;
  password: string;
  username: string;
}

interface RegisterErrors {
  nombre?: string;
  email?: string;
  password?: string;
  username?: string;
}

export default function Register() {
  const [registerResult, setRegisterResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // URL desde variable de entorno
  const APOLLO_SERVER_URL = process.env.NEXT_PUBLIC_APOLLO_URL || 'http://localhost:4000';
  
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('Apollo URL (Register):', APOLLO_SERVER_URL);
  }
  
  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>Registro</h2>
      <p style={{ fontSize: '12px', color: '#666', marginBottom: '20px' }}>
        Conectando a: {APOLLO_SERVER_URL}
      </p>
      
      <Formik<RegisterValues>
        initialValues={{ nombre: '', email: '', password: '', username: '' }}
        validate={(values: RegisterValues): RegisterErrors => {
          const errors: RegisterErrors = {};
          if (!values.nombre) {
            errors.nombre = 'Nombre requerido';
          }
          if (!values.email) {
            errors.email = 'Email requerido';
          } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
            errors.email = 'Email inválido';
          }
          if (!values.password) {
            errors.password = 'Contraseña requerida';
          } else if (values.password.length < 6) {
            errors.password = 'Mínimo 6 caracteres';
          }
          if (!values.username) {
            errors.username = 'Username requerido';
          }
          return errors;
        }}
        onSubmit={async (values: RegisterValues, { setSubmitting, resetForm }: FormikHelpers<RegisterValues>) => {
          try {
            setError(null);
            setRegisterResult(null);
            
            if (!APOLLO_SERVER_URL) {
              setError('URL del servidor no configurada');
              setSubmitting(false);
              return;
            }
            
            const mutation = {
              query: `
                mutation Register($nombre: String!, $email: String!, $password: String!, $username: String!) {
                  crearUsuario(input: {
                    nombre: $nombre,
                    email: $email,
                    password: $password,
                    username: $username
                  })
                }
              `,
              variables: {
                nombre: values.nombre,
                email: values.email,
                password: values.password,
                username: values.username
              }
            };
            
            const response = await fetch(APOLLO_SERVER_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(mutation),
            });
            
            if (!response.ok) {
              throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.errors) {
              const errorMsg = result.errors[0].message;
              if (errorMsg.includes('duplicate key') && errorMsg.includes('email')) {
                setError('Este email ya está registrado');
              } else if (errorMsg.includes('duplicate key') && errorMsg.includes('username')) {
                setError('Este nombre de usuario ya está en uso');
              } else {
                setError(errorMsg);
              }
            } else if (result.data?.crearUsuario) {
              setRegisterResult(result.data.crearUsuario);
              alert(`✅ ${result.data.crearUsuario}`);
              resetForm();
            } else {
              setError('Error desconocido en el registro');
            }
            
          } catch (err: unknown) {
            console.error('Error en registro:', err);
            
            if (err instanceof Error) {
              if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
                setError(`No se pudo conectar al servidor: ${APOLLO_SERVER_URL}`);
              } else {
                setError(err.message);
              }
            } else {
              setError('Error de conexión con el servidor');
            }
          } finally {
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
          <>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label htmlFor="nombre" style={{ display: 'block', marginBottom: '5px' }}>
                  Nombre completo *
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.nombre}
                  placeholder="Ej: Alex Frías"
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
                {errors.nombre && touched.nombre && (
                  <div style={{ color: '#d32f2f', fontSize: '14px', marginTop: '5px' }}>
                    {errors.nombre}
                  </div>
                )}
              </div>
              
              <div>
                <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.email}
                  placeholder="ejemplo@email.com"
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
                {errors.email && touched.email && (
                  <div style={{ color: '#d32f2f', fontSize: '14px', marginTop: '5px' }}>
                    {errors.email}
                  </div>
                )}
              </div>
              
              <div>
                <label htmlFor="username" style={{ display: 'block', marginBottom: '5px' }}>
                  Nombre de usuario *
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.username}
                  placeholder="alex123"
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
                <div style={{ fontSize: '12px', color: '#666', marginTop: '3px' }}>
                  Único para cada usuario
                </div>
                {errors.username && touched.username && (
                  <div style={{ color: '#d32f2f', fontSize: '14px', marginTop: '5px' }}>
                    {errors.username}
                  </div>
                )}
              </div>
              
              <div>
                <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>
                  Contraseña *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.password}
                  placeholder="Mínimo 6 caracteres"
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
                {errors.password && touched.password && (
                  <div style={{ color: '#d32f2f', fontSize: '14px', marginTop: '5px' }}>
                    {errors.password}
                  </div>
                )}
              </div>
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                style={{ 
                  padding: '12px', 
                  backgroundColor: '#4caf50', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  fontSize: '16px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  marginTop: '10px'
                }}
              >
                {isSubmitting ? 'Registrando...' : 'Registrarse'}
              </button>
            </form>
            
            {error && (
              <div style={{ 
                marginTop: '20px', 
                padding: '15px', 
                backgroundColor: '#ffebee', 
                color: '#c62828',
                borderRadius: '4px',
                border: '1px solid #ef9a9a'
              }}>
                <strong>❌ Error:</strong> {error}
              </div>
            )}
            
            {registerResult && (
              <div style={{ 
                marginTop: '20px', 
                padding: '15px', 
                backgroundColor: '#e8f5e9', 
                color: '#2e7d32',
                borderRadius: '4px',
                border: '1px solid #a5d6a7'
              }}>
                <strong>✅ {registerResult}</strong>
                <div style={{ marginTop: '10px', fontSize: '14px' }}>
                  Ahora puedes <a href="/login" style={{ color: '#2e7d32', fontWeight: 'bold' }}>iniciar sesión</a>
                </div>
              </div>
            )}
          </>
        )}
      </Formik>
    </div>
  );
}