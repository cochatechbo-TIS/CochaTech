// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Registro from './pages/Registro'
import './App.css';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute'; // <-- IMPORTANTE
import Listas from './components/Lista Competidores/ListaCompetidores';
// Componentes placeholder para las otras páginas
const Inicio = () => (
  <div className="p-8 text-center">
    <h1 className="text-3xl font-bold text-gray-800 mb-4">Bienvenido al Sistema Oh! SanSi</h1>
    <p className="text-gray-600">Sistema de gestión para olimpiadas académicas</p>
  </div>
);


//const CargaMasiva = () => (
 // <div className="p-8">
  //  <h1 className="text-3xl font-bold text-gray-800 mb-4">Carga Masiva</h1>
  //  <p className="text-gray-600">Funcionalidad en desarrollo...</p>
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

/*const Listas = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-gray-800 mb-4">Listas de Competidores (RF4)</h1>
    <p className="text-gray-600">Funcionalidad en desarrollo...</p>
  </div>
);*/

const Reportes = () => (
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

// Componente para rutas protegidas

function App() {
  return (
    <Routes>
      {/* RUTAS PÚBLICAS */}
      {/* El login no usa el Layout principal para no mostrar la barra de navegación */}
      <Route path="/login" element={<Layout showNavbar={true}><Login /></Layout>} />

      {/* RUTAS PROTEGIDAS */}
      {/* Todas las rutas dentro de 'ProtectedRoute' requerirán que el usuario esté logueado */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout showNavbar={true}><Login /></Layout>}/>
        <Route path="/inicio" element={<Layout showNavbar={true}><Inicio /></Layout>} />
        <Route path="/registro" element={<Layout showNavbar={true}><Registro /></Layout>} />
        <Route path="/listas" element={<Layout showNavbar={true}><Listas /></Layout>} />
        <Route path="/evaluacion" element={<Layout showNavbar={true}><Evaluacion /></Layout>} />
        <Route path="/final" element={<Layout showNavbar={true}><Final /></Layout>} />
        <Route path="/reportes" element={<Layout showNavbar={true}><Reportes /></Layout>} />
        <Route path="/historial" element={<Layout showNavbar={true}><Historial /></Layout>} />

        {/* La ruta raíz ahora redirige a /inicio si estás logueado */}
        <Route path="/" element={<Navigate to="/inicio" replace />} />
      </Route>

      {/* Ruta por defecto si ninguna coincide - redirige al login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
