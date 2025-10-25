// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Registro from './pages/Registro'
import './App.css';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute'; // <-- Nuestro NUEVO ProtectedRoute con roles
import Listas from './components/Lista Competidores/ListaCompetidores';
import { useAuth } from './context/AuthContext'; // <-- Importar useAuth

// --- ¡IMPORTAR NUEVAS PÁGINAS! ---
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';


// --- Componentes Placeholder (Originales) ---
const Inicio = () => (
  <div className="p-8 text-center">
    <h1 className="text-3xl font-bold text-gray-800 mb-4">Bienvenido al Sistema Oh! SanSi</h1>
    <p className="text-gray-600">Sistema de gestión para olimpiadas académicas</p>
  </div>
);


//const CargaMasiva = () => (
 // <div className="p-8">
  //  <h1 className="text-3xl font-bold text-gray-800 mb-4">Carga Masiva</h1>
  //  <p className="text-gray-600">Funcionalidad en desarrollo...</p>
  //</div>
//)

/*const Responsables = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-gray-800 mb-4">Gestión de Responsables (RF3)</h1>
    <p className="text-gray-600">Funcionalidad en desarrollo...</p>
  </div>

)*/

const Evaluacion = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-gray-800 mb-4">Evaluación</h1>
    <p className="text-gray-600">Funcionalidad en desarrollo...</p>
  </div>
);

const Final = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-gray-800 mb-4">Final</h1>
    <p className="text-gray-600">Funcionalidad en desarrollo...</p>
  </div>
);

/*const Listas = () => ( // <-- Tu comentario original sobre Listas (aunque se importa arriba)
  <div className="p-8">
    <h1 className="text-3xl font-bold text-gray-800 mb-4">Listas de Competidores (RF4)</h1>
    <p className="text-gray-600">Funcionalidad en desarrollo...</p>
  </div>
);*/

const Reportes = () => ( // 'Reportes' e 'Informes' es lo mismo, usaré 'Reportes'
  <div className="p-8">
    <h1 className="text-3xl font-bold text-gray-800 mb-4">Reportes</h1>
    <p className="text-gray-600">Funcionalidad en desarrollo...</p>
  </div>
);

const Historial = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-gray-800 mb-4">Historial</h1>
    <p className="text-gray-600">Funcionalidad en desarrollo...</p>
  </div>
);
// --- Fin de Componentes Placeholder ---


// --- NUEVO ---
// Componente para manejar la redirección inicial
const RootRedirect = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirige al dashboard principal según el rol
  switch (user.rol.nombre_rol) {
    case 'administrador':
      return <Navigate to="/administrador/inicio" replace />;
    case 'evaluador':
      return <Navigate to="/evaluador/inicio" replace />;
    case 'responsable':
      return <Navigate to="/responsable/inicio" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};
// --- FIN NUEVO ---


// Componente para rutas protegidas // <-- Tu comentario original
function App() {
  return (
    <Routes>
      {/* RUTAS PÚBLICAS */}
      {/* El login no usa el Layout principal para no mostrar la barra de navegación */}
      <Route path="/login" element={<Login />} />

      {/* --- ¡NUEVAS RUTAS PÚBLICAS! --- */}
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      {/* --- FIN NUEVAS RUTAS --- */}

      {/* RUTA RAÍZ - Redirige automáticamente */}
      <Route path="/" element={<RootRedirect />} />


      {/* RUTAS PROTEGIDAS - REESTRUCTURADAS POR ROL */}
      
      {/* --- RUTAS DE ADMINISTRADOR --- */}
      {/* Grupo de rutas protegidas para 'administrador' */}
      <Route element={<ProtectedRoute allowedRoles={['administrador']} />}>
        {/* Mantenemos la estructura "plana" que pediste */}
        <Route path="/administrador/inicio" element={<Layout showNavbar={true}><Inicio /></Layout>} />
        <Route path="/administrador/registro" element={<Layout showNavbar={true}><Registro /></Layout>} />
        <Route path="/administrador/evaluacion" element={<Layout showNavbar={true}><Evaluacion /></Layout>} />
        <Route path="/administrador/listas" element={<Layout showNavbar={true}><Listas /></Layout>} />
        <Route path="/administrador/final" element={<Layout showNavbar={true}><Final /></Layout>} />
        <Route path="/administrador/reportes" element={<Layout showNavbar={true}><Reportes /></Layout>} />
        <Route path="/administrador/historial" element={<Layout showNavbar={true}><Historial /></Layout>} />
      </Route>

      {/* --- RUTAS DE RESPONSABLE --- */}
      {/* Grupo de rutas protegidas para 'responsable' */}
      <Route element={<ProtectedRoute allowedRoles={['responsable']} />}>
        <Route path="/responsable/inicio" element={<Layout showNavbar={true}><Inicio /></Layout>} />
        <Route path="/responsable/listas" element={<Layout showNavbar={true}><Listas /></Layout>} />
        <Route path="/responsable/informes" element={<Layout showNavbar={true}><Reportes /></Layout>} />
D   </Route>

      {/* --- RUTAS DE EVALUADOR --- */}
      {/* Grupo de rutas protegidas para 'evaluador' */}
      <Route element={<ProtectedRoute allowedRoles={['evaluador']} />}>
        <Route path="/evaluador/inicio" element={<Layout showNavbar={true}><Inicio /></Layout>} />
config         <Route path="/evaluador/evaluacion" element={<Layout showNavbar={true}><Evaluacion /></Layout>} />
        <Route path="/evaluador/informes" element={<Layout showNavbar={true}><Reportes /></Layout>} />
      </Route>

      {/* --- Mantenemos tus rutas originales comentadas --- */}
      {/* <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout showNavbar={true}><Login /></Layout>}/>
        <Route path="/inicio" element={<Layout showNavbar={true}><Inicio /></Layout>} />
        <Route path="/registro" element={<Layout showNavbar={true}><Registro /></Layout>} />
        <Route path="/listas" element={<Layout showNavbar={true}><Listas /></Layout>} />
        <Route path="/evaluacion" element={<Layout showNavbar={true}><Evaluacion /></Layout>} />
        <Route path="/final" element={<Layout showNavbar={true}><Final /></Layout>} />
        <Route path="/reportes" element={<Layout showNavbar={true}><Reportes /></Layout>} />
        <Route path="/historial" element={<Layout showNavbar={true}><Historial /></Layout>} />

        
        <Route path="/" element={<Navigate to="/inicio" replace />} />
      </Route> */}


      {/* Ruta por defecto si ninguna coincide - redirige a la raíz */}
      {/* Modificado para que redirija a "/" y RootRedirect se encargue */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
