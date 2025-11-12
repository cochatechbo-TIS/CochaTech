// src/components/reportes/ReportesFinales.tsx
import { useState, useCallback, useMemo } from 'react';
import PublicacionOficial from './PublicacionOficial';
import './ReportesFinales.css';

// ========== INTERFACES ==========
interface Participante {
  id: number;
  nombre: string;
  ci: string;
  unidadEducativa: string;
  departamento: string;
  area: string;
  nivel: string;
  notaFinal: number;
  posicion: string;
  profesor: string;
  responsableArea: string;
}

interface ReportesFinalesProps {
  areaInicial?: string;
  nivelInicial?: string;
}

// ========== TIPOS DE TABS ==========
type TabType = 'certificados' | 'ceremonia' | 'publicacion';

// ========== DATOS DE PRUEBA ==========
const PARTICIPANTES_MOCK: Participante[] = [
  {
    id: 1,
    nombre: 'Juan Pérez',
    ci: '12345678',
    unidadEducativa: 'Colegio Nacional Simón Bolívar',
    departamento: 'La Paz',
    area: 'Matemáticas',
    nivel: 'Nivel 2',
    notaFinal: 92,
    posicion: 'Oro',
    profesor: 'Dr. Carlos Gutiérrez',
    responsableArea: 'Ing. María Rodríguez'
  },
  {
    id: 2,
    nombre: 'Carlos Mamani',
    ci: '23456789',
    unidadEducativa: 'Colegio Don Bosco',
    departamento: 'Cochabamba',
    area: 'Matemáticas',
    nivel: 'Nivel 2',
    notaFinal: 88,
    posicion: 'Plata',
    profesor: 'Dr. Carlos Gutiérrez',
    responsableArea: 'Ing. María Rodríguez'
  },
  {
    id: 3,
    nombre: 'María López',
    ci: '34567890',
    unidadEducativa: 'Unidad Educativa La Salle',
    departamento: 'La Paz',
    area: 'Matemáticas',
    nivel: 'Nivel 2',
    notaFinal: 85,
    posicion: 'Plata',
    profesor: 'Dr. Carlos Gutiérrez',
    responsableArea: 'Ing. María Rodríguez'
  },
  {
    id: 4,
    nombre: 'Pedro Flores',
    ci: '45678901',
    unidadEducativa: 'Colegio Alemán',
    departamento: 'Santa Cruz',
    area: 'Matemáticas',
    nivel: 'Nivel 2',
    notaFinal: 80,
    posicion: 'Bronce',
    profesor: 'Dr. Carlos Gutiérrez',
    responsableArea: 'Ing. María Rodríguez'
  },
  {
    id: 5,
    nombre: 'Laura Torrez',
    ci: '56789012',
    unidadEducativa: 'Colegio Saint Andrews',
    departamento: 'La Paz',
    area: 'Matemáticas',
    nivel: 'Nivel 2',
    notaFinal: 78,
    posicion: 'Bronce',
    profesor: 'Dr. Carlos Gutiérrez',
    responsableArea: 'Ing. María Rodríguez'
  },
  {
    id: 6,
    nombre: 'Monica Toribio',
    ci: '75789012',
    unidadEducativa: 'Colegio San Antonio',
    departamento: 'Cochabamba',
    area: 'Matemáticas',
    nivel: 'Nivel 2',
    notaFinal: 73,
    posicion: 'Mencion de Honor',
    profesor: 'Dr. Ismael Gutiérrez',
    responsableArea: 'Ing. María Rodríguez'
  },
  {id: 7,
    nombre: 'Juan Peredo',
    ci: '56745212',
    unidadEducativa: 'Colegio San Antonio',
    departamento: 'Cochabamba',
    area: 'Matemáticas',
    nivel: 'Nivel 2',
    notaFinal: 73,
    posicion: 'Mencion de Honor',
    profesor: 'Dr. Ismael Gutiérrez',
    responsableArea: 'Ing. María Rodríguez'
  }
];

// ========== UTILIDADES ==========
const getPosicionClass = (posicion: string): string => {
  const posicionLower = posicion.toLowerCase();
  if (posicionLower === 'oro') return 'posicion-oro';
  if (posicionLower === 'plata') return 'posicion-plata';
  if (posicionLower === 'bronce') return 'posicion-bronce';
  return '';
};

// ========== COMPONENTE PRINCIPAL ==========
function ReportesFinales({ 
  areaInicial = 'Matemática', 
  nivelInicial = 'Nivel 2' 
}: ReportesFinalesProps) {
  const [tabActivo, setTabActivo] = useState<TabType>('certificados');
  const [participantes] = useState<Participante[]>(PARTICIPANTES_MOCK);

  // ========== INFORMACIÓN DEL ÁREA/NIVEL ==========
  const tituloCompleto = useMemo(
    () => `${areaInicial} - ${nivelInicial}`,
    [areaInicial, nivelInicial]
  );

  // ========== MANEJADORES DE TABS ==========
  const handleTabChange = useCallback((tab: TabType) => {
    setTabActivo(tab);
  }, []);

  // ========== MANEJADORES DE EXPORTACIÓN ==========
  const handleExportarExcel = useCallback(() => {
    console.log('Exportando a Excel...');
    // TODO: Implementar exportación a Excel
    alert('Funcionalidad de exportar a Excel en desarrollo');
  }, []);

  const handleExportarPDF = useCallback(() => {
    console.log('Exportando a PDF...');
    // TODO: Implementar exportación a PDF
    alert('Funcionalidad de exportar a PDF en desarrollo');
  }, []);

  // ========== RENDER ==========
  return (
    <div className="reportes-container">
      {/* Header */}
      <div className="reportes-header">
        <h1 className="reportes-title">Resultados Finales</h1>
      </div>

      {/* Card Principal */}
      <div className="reportes-card">
        {/* Título del Área/Nivel */}
        <h2 className="area-titulo">Area: {tituloCompleto}</h2>

        {/* Tabs */}
        <div className="tabs-container">
          <button
            className={`tab-button ${tabActivo === 'certificados' ? 'tab-active' : ''}`}
            onClick={() => handleTabChange('certificados')}
          >
            CERTIFICADOS
          </button>
          <button
            className={`tab-button ${tabActivo === 'ceremonia' ? 'tab-active' : ''}`}
            onClick={() => handleTabChange('ceremonia')}
          >
            CEREMONIA DE PREMIACIÓN
          </button>
          <button
            className={`tab-button ${tabActivo === 'publicacion' ? 'tab-active' : ''}`}
            onClick={() => handleTabChange('publicacion')}
          >
            PUBLICACIÓN OFICIAL
          </button>
        </div>

        {/* Contenido de Certificados */}
        {tabActivo === 'certificados' && (
          <div className="tab-content">
            {/* Título y Botones de Exportación */}
            <div className="content-header">
              <h3 className="content-title">Certificados</h3>
              <div className="export-buttons">
                <button className="btn-export btn-excel" onClick={handleExportarExcel}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  EXPORTAR EXCEL
                </button>
                <button className="btn-export btn-pdf" onClick={handleExportarPDF}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <line x1="12" y1="9" x2="8" y2="9" />
                  </svg>
                  EXPORTAR PDF
                </button>
              </div>
            </div>

            {/* Info Box */}
            <div className="info-box">
              <svg className="info-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" stroke="white" strokeWidth="2" />
                <line x1="12" y1="8" x2="12.01" y2="8" stroke="white" strokeWidth="2" />
              </svg>
              <p className="info-text">
                Esta lista incluye a todos los participantes que completaron la evaluación final, con los datos necesarios para generar certificados.
              </p>
            </div>

            {/* Tabla de Participantes */}
            <div className="table-container">
              <table className="participantes-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>CI</th>
                    <th>Unidad Educativa</th>
                    <th>Departamento</th>
                    <th>Área</th>
                    <th>Nivel</th>
                    <th>Nota Final</th>
                    <th>Posición</th>
                    <th>Profesor</th>
                    <th>Responsable de Área</th>
                  </tr>
                </thead>
                <tbody>
                  {participantes.map((participante) => (
                    <tr key={participante.id}>
                      <td>{participante.nombre}</td>
                      <td>{participante.ci}</td>
                      <td>{participante.unidadEducativa}</td>
                      <td>{participante.departamento}</td>
                      <td>{participante.area}</td>
                      <td>{participante.nivel}</td>
                      <td className="nota-cell">{participante.notaFinal}</td>
                      <td>
                        <span className={`badge-posicion ${getPosicionClass(participante.posicion)}`}>
                          {participante.posicion}
                        </span>
                      </td>
                      <td>{participante.profesor}</td>
                      <td>{participante.responsableArea}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Contenido de Ceremonia de Premiación */}
        {tabActivo === 'ceremonia' && (
          <div className="tab-content">
            <div className="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              <h3>Ceremonia de Premiación</h3>
              <p>Esta sección estará disponible próximamente.</p>
            </div>
          </div>
        )}

        {/* Contenido de Publicación Oficial */}
        {tabActivo === 'publicacion' && (
          <div className="tab-content">
            <PublicacionOficial area={areaInicial} nivel={nivelInicial} />
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportesFinales;