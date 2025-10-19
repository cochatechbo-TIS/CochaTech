// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Registro from './pages/Registro';
import './App.css';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Listas from './components/ListaCompetidores/ListaCompetidores';
import { useAuth } from './context/AuthContext';

// --- Placeholder Pages ---
// (Estos ya los tenías, los mantengo)
const Inicio = () => (
  <div className="p-8 text-center">
    <h1 className="text-3xl font-bold text-gray-800 mb-4">Bienvenido al Sistema Oh! SanSi</h1>
    <p className="text-gray-600">Sistema de gestión para olimpiadas académicas</p>
  </div>
);
const Evaluacion = () => <div className="p-8"><h1 className="text-3xl">Evaluación</h1></div>;
const Final = () => <div className="p-8"><h1 className="text-3xl">Final</h1></div>;
const Reportes = () => <div className="p-8"><h1 className="text-3xl">Reportes</h1></div>;
const Historial = () => <div className="p-8"><h1 className="text-3xl">Historial</h1></div>;
// --- Fin Placeholders ---


function App() {
  const { isAuthenticated, isLoading } = useAuth();

  // Prevenir renderizado hasta que sepamos si está autenticado
  if (isLoading) {
    return <div>Cargando aplicación...</div>; // O un spinner
  }

  return (
    <Routes>
      {/* --- RUTAS PÚBLICAS --- */}
      {/* El Login NO usa el Layout principal */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />

      {/* --- RUTAS DE ADMINISTRADOR --- */}
      <Route element={<ProtectedRoute allowedRoles={['administrador']} />}>
        {/* Usamos 'Layout' para envolver todas las páginas de este rol */}
        <Route path="/administrador" element={<Layout />}>
          <Route path="inicio" element={<Inicio />} />
          <Route path="registro" element={<Registro />} />
          <Route path="evaluacion" element={<Evaluacion />} />
          <Route path="listas" element={<Listas />} />
          <Route path="final" element={<Final />} />
          <Route path="reportes" element={<Reportes />} />
          <Route path="historial" element={<Historial />} />
          {/* Redirigir de /administrador a /administrador/inicio */}
          <Route index element={<Navigate to="inicio" replace />} />
        </Route>
      </Route>

      {/* --- RUTAS DE RESPONSABLE --- */}
      <Route element={<ProtectedRoute allowedRoles={['responsable']} />}>
        <Route path="/responsable" element={<Layout />}>
          <Route path="inicio" element={<Inicio />} />
          <Route path="listas" element={<Listas />} />
          <Route path="reportes" element={<Reportes />} />
          <Route index element={<Navigate to="inicio" replace />} />
        </Route>
      </Route>

      {/* --- RUTAS DE EVALUADOR --- */}
      <Route element={<ProtectedRoute allowedRoles={['evaluador']} />}>
        <Route path="/evaluador" element={<Layout />}>
          <Route path="inicio" element={<Inicio />} />
          <Route path="evaluacion" element={<Evaluacion />} />
          <Route path="reportes" element={<Reportes />} />
          <Route index element={<Navigate to="inicio" replace />} />
        </Route>
      </Route>

      {/* --- REDIRECCIÓN PRINCIPAL Y RUTAS NO ENCONTRADAS --- */}
      
      {/* Si estás en la ruta raíz '/', redirige al dashboard correcto o a login */}
      <Route 
        path="/" 
        element={<RootRedirect />} 
      />

      {/* Cualquier otra ruta no definida */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Componente auxiliar para manejar la redirección raíz
const RootRedirect = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.rol.nombre_rol) {
    case 'administrador':
      return <Navigate to="/administrador/inicio" replace />;
    case 'responsable':
      return <Navigate to="/responsable/inicio" replace />;
    case 'evaluador':
      return <Navigate to="/evaluador/inicio" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default App;