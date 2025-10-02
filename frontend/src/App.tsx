// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import GestionCompetidores from './pages/GestionCompetidores'
import GestionResponsables from './pages/GestionResponsable'
import './App.css'
//import CargaMasiva from './components/carga masiva/CargarCSV';
import CargaMasiva from './components/carga masiva/CargarCSV';

// Componentes placeholder para las otras páginas
const Inicio = () => (
  <div className="p-8 text-center">
    <h1 className="text-3xl font-bold text-gray-800 mb-4">Bienvenido al Sistema Oh! SanSi</h1>
    <p className="text-gray-600">Sistema de gestión para olimpiadas académicas</p>
  </div>
)

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

const Evaluadores = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-gray-800 mb-4">Gestión de Evaluadores</h1>
    <p className="text-gray-600">Funcionalidad en desarrollo...</p>
  </div>
)

const Medallero = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-gray-800 mb-4">Medallero</h1>
    <p className="text-gray-600">Funcionalidad en desarrollo...</p>
  </div>
)

const Listas = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-gray-800 mb-4">Listas de Competidores (RF4)</h1>
    <p className="text-gray-600">Funcionalidad en desarrollo...</p>
  </div>
)

const Validacion = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-gray-800 mb-4">Validación</h1>
    <p className="text-gray-600">Funcionalidad en desarrollo...</p>
  </div>
)

const Reportes = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-gray-800 mb-4">Reportes</h1>
    <p className="text-gray-600">Funcionalidad en desarrollo...</p>
  </div>
)

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/inicio" element={<Inicio />} />
        <Route path="/carga-masiva" element={<CargaMasiva />} />
        <Route path="/competidores" element={<GestionCompetidores />} />
        <Route path="/responsables" element={<GestionResponsables />} />
        <Route path="/evaluadores" element={<Evaluadores />} />
        <Route path="/medallero" element={<Medallero />} />
        <Route path="/listas" element={<Listas />} />
        <Route path="/validacion" element={<Validacion />} />
        <Route path="/reportes" element={<Reportes />} />
        
        {/* Ruta por defecto - redirige a inicio */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App