// src/components/DashboardContent.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  username: string;
  ultimoAcceso: string;
}

export default function DashboardContent() {
  const router = useRouter();
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const APOLLO_SERVER_URL = process.env.NEXT_PUBLIC_APOLLO_URL || 'http://localhost:4000';

  useEffect(() => {
    // Validar autenticación
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user');
    
    if (!token) {
      router.push('/login');
      return;
    }
    
    // Cargar datos del usuario desde localStorage mientras valida con el servidor
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Error parseando userData:', e);
      }
    }
    
    // Validar token con el servidor
    fetchUserProfile(token);
  }, [router]);

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch(APOLLO_SERVER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`
        },
        body: JSON.stringify({
          query: `
            query GetProfile {
              obtenerPerfil {
                id
                nombre
                email
                username
                ultimoAcceso
              }
            }
          `
        })
      });

      if (!response.ok) {
        // Si el token es inválido o expiró, redirigir al login
        if (response.status === 400 || response.status === 401 || response.status === 403) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          router.push('/login');
          return;
        }
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.errors) {
        console.error('GraphQL errors:', result.errors);
        const errorMsg = result.errors[0]?.message || 'Error desconocido';
        
        // Si es error de autenticación, limpiar y redirigir
        if (errorMsg.toLowerCase().includes('autenticado') || 
            errorMsg.toLowerCase().includes('token')) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          router.push('/login');
          return;
        }
        
        setError(errorMsg);
        return;
      }
      
      if (result.data?.obtenerPerfil) {
        setUser(result.data.obtenerPerfil);
        localStorage.setItem('user', JSON.stringify(result.data.obtenerPerfil));
      } else {
        setError('No se pudo obtener el perfil del usuario');
      }
      
    } catch (err) {
      console.error('Error obteniendo perfil:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar datos del usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h2>⏳ Cargando dashboard...</h2>
        <p style={{ color: '#666', marginTop: '10px' }}>Validando autenticación...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h2>❌ Error</h2>
        <p style={{ color: '#c62828', marginTop: '20px' }}>{error}</p>
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reintentar
          </button>
          <button 
            onClick={() => router.push('/login')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Volver al login
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h2>⚠️ No hay datos de usuario</h2>
        <button 
          onClick={() => router.push('/login')}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Ir al login
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '30px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <h1>📊 Dashboard</h1>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Cerrar Sesión
        </button>
      </div>

      <div style={{
        backgroundColor: '#f5f5f5',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2>👤 Información del Usuario</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '15px', 
          marginTop: '15px' 
        }}>
          <div>
            <strong>Nombre:</strong>
            <p style={{ margin: '5px 0 0 0' }}>{user.nombre}</p>
          </div>
          <div>
            <strong>Email:</strong>
            <p style={{ margin: '5px 0 0 0' }}>{user.email}</p>
          </div>
          <div>
            <strong>Username:</strong>
            <p style={{ margin: '5px 0 0 0' }}>{user.username}</p>
          </div>
          <div>
            <strong>Último acceso:</strong>
            <p style={{ margin: '5px 0 0 0' }}>
              {new Date(user.ultimoAcceso).toLocaleString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <div>
            <strong>ID:</strong>
            <p style={{ 
              fontSize: '12px', 
              wordBreak: 'break-all', 
              fontFamily: 'monospace',
              margin: '5px 0 0 0',
              backgroundColor: '#e0e0e0',
              padding: '5px',
              borderRadius: '4px'
            }}>
              {user.id}
            </p>
          </div>
        </div>
      </div>

      <div style={{
        backgroundColor: '#e3f2fd',
        padding: '15px',
        borderRadius: '8px',
        border: '1px solid #2196F3'
      }}>
        <p style={{ margin: 0, fontSize: '14px' }}>
          <strong>💡 Tip:</strong> Esta información se valida automáticamente con el servidor cada vez que cargas el dashboard.
        </p>
      </div>
    </div>
  );
}