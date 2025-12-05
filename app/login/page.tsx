"use client";

import { Formik, FormikHelpers } from 'formik';
import { useState } from 'react';

interface LoginValues {
  email: string;
  password: string;
}

interface LoginErrors {
  email?: string;
  password?: string;
}

interface LoginResponse {
  token: string;
  usuario: {
    id: string;
    nombre: string;
    email: string;
    username: string;
    ultimoAcceso: string;
  };
}

export default function Login() {
  const [loginResult, setLoginResult] = useState<LoginResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // URL desde variable de entorno - IMPORTANTE: NEXT_PUBLIC_ es necesario para cliente
  const APOLLO_SERVER_URL = process.env.NEXT_PUBLIC_APOLLO_URL || 'http://localhost:4000';
  
  // Debug: Verificar que la variable se carga (solo en desarrollo)
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('Apollo URL:', APOLLO_SERVER_URL);
  }
  
  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>Login</h2>
      <p style={{ fontSize: '12px', color: '#666', marginBottom: '20px' }}>
        Conectando a: {APOLLO_SERVER_URL}
      </p>
      
      <Formik<LoginValues>
        initialValues={{ email: '', password: '' }}
        validate={(values: LoginValues): LoginErrors => {
          const errors: LoginErrors = {};
          if (!values.email) {
            errors.email = 'Email requerido';
          } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
            errors.email = 'Email inválido';
          }
          if (!values.password) {
            errors.password = 'Contraseña requerida';
          }
          return errors;
        }}
        onSubmit={async (values: LoginValues, { setSubmitting, resetForm }: FormikHelpers<LoginValues>) => {
          try {
            setError(null);
            setLoginResult(null);
            
            if (!APOLLO_SERVER_URL) {
              setError('URL del servidor no configurada');
              setSubmitting(false);
              return;
            }
            
            // Mutación GraphQL para login
            const mutation = {
              query: `
                mutation Login($email: String!, $password: String!) {
                  autenticarUsuario(input: {
                    email: $email,
                    password: $password
                  }) {
                    token
                    usuario {
                      id
                      nombre
                      email
                      username
                      ultimoAcceso
                    }
                  }
                }
              `,
              variables: {
                email: values.email,
                password: values.password
              }
            };
            
            // Enviar petición a Apollo Server
            const response = await fetch(APOLLO_SERVER_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(mutation),
            });
            
            // Verificar respuesta HTTP
            if (!response.ok) {
              throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.errors) {
              setError(result.errors[0].message);
            } else if (result.data?.autenticarUsuario) {
              setLoginResult(result.data.autenticarUsuario);
              localStorage.setItem('auth_token', result.data.autenticarUsuario.token);
              localStorage.setItem('user', JSON.stringify(result.data.autenticarUsuario.usuario));
              
              alert(`✅ Login exitoso!`);
              resetForm();
            } else {
              setError('Error desconocido');
            }
            
          } catch (err: unknown) {
            console.error('Error en login:', err);
            
            // Mensajes de error más específicos
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
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.email}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
                {errors.email && touched.email && (
                  <div style={{ color: 'red', fontSize: '12px' }}>{errors.email}</div>
                )}
              </div>
              
              <div>
                <label htmlFor="password">Contraseña:</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.password}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
                {errors.password && touched.password && (
                  <div style={{ color: 'red', fontSize: '12px' }}>{errors.password}</div>
                )}
              </div>
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                style={{ 
                  padding: '10px', 
                  backgroundColor: '#0070f3', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? 'Enviando...' : 'Iniciar Sesión'}
              </button>
            </form>
            
            {/* Mostrar resultado del login */}
            {error && (
              <div style={{ 
                marginTop: '20px', 
                padding: '10px', 
                backgroundColor: '#ffebee', 
                color: '#c62828',
                borderRadius: '4px'
              }}>
                ❌ Error: {error}
              </div>
            )}
          </>
        )}
      </Formik>
    </div>
  );
}