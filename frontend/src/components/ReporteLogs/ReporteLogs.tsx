// src/components/logs/ReporteLogs.tsx
import { useState, useCallback, useMemo } from 'react';
import './ReporteLogs.css';

// ========== INTERFACES ==========
interface Log {
  id: number;
  fecha: string;
  hora: string;
  evaluador: string;
  area: string;
  nivel: string;
  nombreEstudiante: string;
  notaAnterior: number;
  notaNueva: number;
  motivo: string;
}

// ========== DATOS DE PRUEBA ==========
const LOGS_MOCK: Log[] = [
  {
    id: 1,
    fecha: '2024-11-15',
    hora: '10:30:45',
    evaluador: 'Dr. Carlos Gutiérrez',
    area: 'Matemática',
    nivel: 'Avanzado',
    nombreEstudiante: 'Juan Pérez',
    notaAnterior: 85,
    notaNueva: 92,
    motivo: 'Revisión de examen - error en suma de puntos'
  },
  {
    id: 2,
    fecha: '2024-11-15',
    hora: '11:15:20',
    evaluador: 'Dra. Ana López',
    area: 'Física',
    nivel: 'Intermedio',
    nombreEstudiante: 'María García',
    notaAnterior: 78,
    notaNueva: 82,
    motivo: 'Corrección por pregunta mal formulada'
  },
  {
    id: 3,
    fecha: '2024-11-16',
    hora: '09:20:10',
    evaluador: 'Ing. Pedro Sánchez',
    area: 'Química',
    nivel: 'Básico',
    nombreEstudiante: 'Carlos Mamani',
    notaAnterior: 90,
    notaNueva: 88,
    motivo: 'Corrección de procedimiento mal evaluado'
  },
  {
    id: 4,
    fecha: '2024-11-16',
    hora: '14:45:33',
    evaluador: 'Dr. Carlos Gutiérrez',
    area: 'Matemática',
    nivel: 'Avanzado',
    nombreEstudiante: 'Laura Torrez',
    notaAnterior: 75,
    notaNueva: 80,
    motivo: 'Recalificación por apelación del estudiante'
  },
  {
    id: 5,
    fecha: '2024-11-17',
    hora: '08:30:15',
    evaluador: 'Lic. María Rodríguez',
    area: 'Biología',
    nivel: 'Intermedio',
    nombreEstudiante: 'Pedro Flores',
    notaAnterior: 92,
    notaNueva: 95,
    motivo: 'Puntos adicionales por respuesta completa'
  },
  {
    id: 6,
    fecha: '2024-11-17',
    hora: '10:00:50',
    evaluador: 'Dr. Jorge Martínez',
    area: 'Matemática',
    nivel: 'Básico',
    nombreEstudiante: 'Ana Quispe',
    notaAnterior: 68,
    notaNueva: 72,
    motivo: 'Error en transcripción de respuestas'
  },
  {
    id: 7,
    fecha: '2024-11-18',
    hora: '13:25:40',
    evaluador: 'Dra. Ana López',
    area: 'Física',
    nivel: 'Avanzado',
    nombreEstudiante: 'Roberto Choque',
    notaAnterior: 88,
    notaNueva: 85,
    motivo: 'Revisión de desarrollo - error en fórmula'
  },
  {
    id: 8,
    fecha: '2024-11-18',
    hora: '15:10:25',
    evaluador: 'Ing. Pedro Sánchez',
    area: 'Química',
    nivel: 'Avanzado',
    nombreEstudiante: 'Sofía Condori',
    notaAnterior: 79,
    notaNueva: 84,
    motivo: 'Corrección por criterio mal aplicado'
  },
  {
    id: 9,
    fecha: '2024-11-19',
    hora: '09:45:12',
    evaluador: 'Dr. Carlos Gutiérrez',
    area: 'Matemática',
    nivel: 'Intermedio',
    nombreEstudiante: 'Diego Vargas',
    notaAnterior: 83,
    notaNueva: 87,
    motivo: 'Revisión de procedimiento algebraico'
  },
  {
    id: 10,
    fecha: '2024-11-19',
    hora: '11:30:08',
    evaluador: 'Lic. María Rodríguez',
    area: 'Biología',
    nivel: 'Básico',
    nombreEstudiante: 'Valentina Cruz',
    notaAnterior: 91,
    notaNueva: 93,
    motivo: 'Puntos adicionales por diagramas correctos'
  },
  {
    id: 11,
    fecha: '2024-11-20',
    hora: '08:15:30',
    evaluador: 'Dr. Jorge Martínez',
    area: 'Matemática',
    nivel: 'Avanzado',
    nombreEstudiante: 'Andrés Mamani',
    notaAnterior: 77,
    notaNueva: 81,
    motivo: 'Error en suma total de puntos'
  },
  {
    id: 12,
    fecha: '2024-11-20',
    hora: '10:40:22',
    evaluador: 'Dra. Ana López',
    area: 'Física',
    nivel: 'Básico',
    nombreEstudiante: 'Camila Ríos',
    notaAnterior: 86,
    notaNueva: 89,
    motivo: 'Reconsideración de respuesta parcial'
  },
  {
    id: 13,
    fecha: '2024-11-21',
    hora: '14:20:15',
    evaluador: 'Ing. Pedro Sánchez',
    area: 'Química',
    nivel: 'Intermedio',
    nombreEstudiante: 'Javier Pinto',
    notaAnterior: 74,
    notaNueva: 78,
    motivo: 'Corrección por nomenclatura aceptada'
  },
  {
    id: 14,
    fecha: '2024-11-21',
    hora: '16:05:40',
    evaluador: 'Dr. Carlos Gutiérrez',
    area: 'Matemática',
    nivel: 'Avanzado',
    nombreEstudiante: 'Isabella Rojas',
    notaAnterior: 94,
    notaNueva: 96,
    motivo: 'Bonificación por método alternativo correcto'
  },
  {
    id: 15,
    fecha: '2024-11-22',
    hora: '09:10:55',
    evaluador: 'Lic. María Rodríguez',
    area: 'Biología',
    nivel: 'Avanzado',
    nombreEstudiante: 'Lucas Fernández',
    notaAnterior: 82,
    notaNueva: 85,
    motivo: 'Revisión de terminología científica'
  },
  {
    id: 16,
    fecha: '2024-11-22',
    hora: '11:35:18',
    evaluador: 'Dr. Jorge Martínez',
    area: 'Matemática',
    nivel: 'Intermedio',
    nombreEstudiante: 'Martina Silva',
    notaAnterior: 89,
    notaNueva: 92,
    motivo: 'Error en contabilización de ejercicios'
  },
  {
    id: 17,
    fecha: '2024-11-23',
    hora: '13:50:25',
    evaluador: 'Dra. Ana López',
    area: 'Física',
    nivel: 'Avanzado',
    nombreEstudiante: 'Sebastián Torres',
    notaAnterior: 76,
    notaNueva: 80,
    motivo: 'Recalificación por unidades correctas'
  },
  {
    id: 18,
    fecha: '2024-11-23',
    hora: '15:25:10',
    evaluador: 'Ing. Pedro Sánchez',
    area: 'Química',
    nivel: 'Básico',
    nombreEstudiante: 'Emma Gutiérrez',
    notaAnterior: 87,
    notaNueva: 90,
    motivo: 'Corrección por respuesta incompleta bien fundamentada'
  },
  {
    id: 19,
    fecha: '2024-11-24',
    hora: '08:40:35',
    evaluador: 'Dr. Carlos Gutiérrez',
    area: 'Matemática',
    nivel: 'Básico',
    nombreEstudiante: 'Mateo Vega',
    notaAnterior: 71,
    notaNueva: 75,
    motivo: 'Revisión de operaciones básicas'
  },
  {
    id: 20,
    fecha: '2024-11-24',
    hora: '10:15:48',
    evaluador: 'Lic. María Rodríguez',
    area: 'Biología',
    nivel: 'Intermedio',
    nombreEstudiante: 'Olivia Castro',
    notaAnterior: 93,
    notaNueva: 95,
    motivo: 'Bonificación por diagrama ejemplar'
  },
  {
    id: 21,
    fecha: '2024-11-25',
    hora: '12:30:20',
    evaluador: 'Dr. Jorge Martínez',
    area: 'Matemática',
    nivel: 'Avanzado',
    nombreEstudiante: 'Santiago Morales',
    notaAnterior: 80,
    notaNueva: 84,
    motivo: 'Error en evaluación de límites'
  },
  {
    id: 22,
    fecha: '2024-11-25',
    hora: '14:45:55',
    evaluador: 'Dra. Ana López',
    area: 'Física',
    nivel: 'Intermedio',
    nombreEstudiante: 'Mía Herrera',
    notaAnterior: 85,
    notaNueva: 88,
    motivo: 'Reconsideración de experimento descrito'
  },
  {
    id: 23,
    fecha: '2024-11-26',
    hora: '09:20:30',
    evaluador: 'Ing. Pedro Sánchez',
    area: 'Química',
    nivel: 'Avanzado',
    nombreEstudiante: 'Benjamín Ortiz',
    notaAnterior: 78,
    notaNueva: 82,
    motivo: 'Corrección por reacción alternativa válida'
  },
  {
    id: 24,
    fecha: '2024-11-26',
    hora: '11:10:15',
    evaluador: 'Dr. Carlos Gutiérrez',
    area: 'Matemática',
    nivel: 'Intermedio',
    nombreEstudiante: 'Lucía Ramírez',
    notaAnterior: 91,
    notaNueva: 94,
    motivo: 'Puntos adicionales por demostración completa'
  },
  {
    id: 25,
    fecha: '2024-11-27',
    hora: '13:55:40',
    evaluador: 'Lic. María Rodríguez',
    area: 'Biología',
    nivel: 'Básico',
    nombreEstudiante: 'Gabriel Méndez',
    notaAnterior: 84,
    notaNueva: 87,
    motivo: 'Revisión de clasificación taxonómica'
  }
];

const AREAS_DISPONIBLES = ['Matemática', 'Física', 'Química', 'Biología'];
const NIVELES_DISPONIBLES = ['Básico', 'Intermedio', 'Avanzado'];



// ========== COMPONENTE PRINCIPAL ==========
function ReporteLogs() {
  const [logs] = useState<Log[]>(LOGS_MOCK);
  const [busqueda, setBusqueda] = useState('');
  const [areaFiltro, setAreaFiltro] = useState('');
  const [nivelFiltro, setNivelFiltro] = useState('');

  // ========== FILTRADO DE LOGS ==========
  const logsFiltrados = useMemo(() => {
    let resultado = logs;

    // Filtrar por área
    if (areaFiltro) {
      resultado = resultado.filter(log => log.area === areaFiltro);
    }

    // Filtrar por nivel
    if (nivelFiltro) {
      resultado = resultado.filter(log => log.nivel === nivelFiltro);
    }

    // Filtrar por búsqueda
    if (busqueda.trim()) {
      const searchLower = busqueda.toLowerCase().trim();
      resultado = resultado.filter(log =>
        log.nombreEstudiante.toLowerCase().includes(searchLower) ||
        log.evaluador.toLowerCase().includes(searchLower) ||
        log.motivo.toLowerCase().includes(searchLower)
      );
    }

    return resultado;
  }, [logs, areaFiltro, nivelFiltro, busqueda]);

  // ========== MANEJADORES ==========
  const handleBusquedaChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setBusqueda(e.target.value);
  }, []);

  const handleAreaChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setAreaFiltro(e.target.value);
  }, []);

  const handleNivelChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setNivelFiltro(e.target.value);
  }, []);

  return (
    <div className="logs-container">
      {/* Header */}
      <div className="logs-header">
        <div className="logs-title-section">
          <h1 className="logs-title">Reporte de Logs</h1>
          <p className="logs-subtitle">Historial de cambios de notas</p>
        </div>
        
      </div>

      {/* Info Box */}
      <div className="logs-info-box">
        <svg className="logs-info-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" stroke="white" strokeWidth="2" />
          <line x1="12" y1="8" x2="12.01" y2="8" stroke="white" strokeWidth="2" />
        </svg>
        <p className="logs-info-text">
          Este reporte muestra todos los cambios realizados en las notas de los estudiantes, incluyendo el evaluador responsable, las notas anterior y nueva, y el motivo del cambio.
        </p>
      </div>

      {/* Filtros */}
      <div className="logs-filtros">
        <div className="filtro-busqueda-logs">
          <svg className="filtro-icon-logs" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por estudiante, evaluador o motivo..."
            value={busqueda}
            onChange={handleBusquedaChange}
            className="filtro-input-logs"
          />
        </div>
        
        <select value={areaFiltro} onChange={handleAreaChange} className="filtro-select-logs">
          <option value="">Todas las áreas</option>
          {AREAS_DISPONIBLES.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        <select 
          value={nivelFiltro} 
          onChange={handleNivelChange} 
          className="filtro-select-logs"
        >
          <option value="">Todos los niveles</option>
          {NIVELES_DISPONIBLES.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      <div className="logs-table-container">
        <table className="logs-table">
          <thead>
            <tr>
              <th>Nº</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Evaluador</th>
              <th>Área</th>
              <th>Nivel</th>
              <th>Nombre Estudiante</th>
              <th>Nota Anterior</th>
              <th>Nota Nueva</th>
              <th>Motivo</th>
            </tr>
          </thead>
          <tbody>
            {logsFiltrados.length === 0 ? (
              <tr>
                <td colSpan={10} className="empty-message-logs">
                  No se encontraron registros con los filtros aplicados
                </td>
              </tr>
            ) : (
              logsFiltrados.map((log, index) => (
                <tr key={log.id}>
                  <td className="numero-cell">{index + 1}</td>
                  <td>{new Date(log.fecha).toLocaleDateString('es-ES')}</td>
                  <td>{log.hora}</td>
                  <td>{log.evaluador}</td>
                  <td>{log.area}</td>
                  <td>{log.nivel}</td>
                  <td>{log.nombreEstudiante}</td>
                  <td className="nota-anterior-cell">{log.notaAnterior}</td>
                  <td className="nota-nueva-cell">{log.notaNueva}</td>
                  <td className="motivo-cell">{log.motivo}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Resumen */}
      <div className="logs-resumen">
        <p>Total de registros: <strong>{logsFiltrados.length}</strong></p>
      </div>
    </div>
  );
}

export default ReporteLogs;