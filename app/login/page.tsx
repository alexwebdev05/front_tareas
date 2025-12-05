"use client";

import { Formik, FormikHelpers } from 'formik';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  const [loginResult, setLoginResult] = useState<LoginResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const APOLLO_SERVER_URL = process.env.NEXT_PUBLIC_APOLLO_URL || 'http://localhost:4000';
  
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
              setError(result.errors[0].message);
            } else if (result.data?.autenticarUsuario) {
              const authData = result.data.autenticarUsuario;
              setLoginResult(authData);
              
              // Guardar en localStorage
              localStorage.setItem('auth_token', authData.token);
              localStorage.setItem('user', JSON.stringify(authData.usuario));
              
              // Resetear formulario
              resetForm();
              
              // Redirigir inmediatamente al dashboard
              router.push('/dashboard');
              
            } else {
              setError('Error desconocido');
            }
            
          } catch (err: unknown) {
            console.error('Error en login:', err);
            
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
              
              <button 
                type="button"
                onClick={() => router.push('/')}
                style={{ 
                  padding: '10px', 
                  backgroundColor: '#666', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginTop: '10px'
                }}
              >
                ← Volver al Home
              </button>
            </form>
            
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
            
            {loginResult && (
              <div style={{ 
                marginTop: '20px', 
                padding: '15px', 
                backgroundColor: '#e8f5e9', 
                color: '#2e7d32',
                borderRadius: '4px',
                textAlign: 'center'
              }}>
                <p>✅ Login exitoso! Redirigiendo...</p>
              </div>
            )}
          </>
        )}
      </Formik>
    </div>
  );
}