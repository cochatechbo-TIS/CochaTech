// src/components/logs/ReporteLogs.tsx
import { useState, useCallback, useMemo, useEffect } from 'react';
import api from '../../services/api';
import './ReporteLogs.css';

// ========== INTERFACES ==========
interface Log {
  numero: number;
  fecha: string;
  hora: string;
  evaluador: string;
  area: string;
  nivel: string;
  estudiante: string;
  nota_anterior: number;
  nota_nueva: number;
  motivo: string;
}

// ========== FUNCIÓN DE EXPORTACIÓN PDF ==========
const exportarPDF = (logs: Log[]) => {
  const ventana = window.open('', '', 'height=800,width=1200');
  
  if (!ventana) {
    alert('Por favor, permite las ventanas emergentes para exportar a PDF');
    return;
  }

  const contenido = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reporte de Logs - Cambios de Notas</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          padding: 20px;
          font-size: 11px;
        }
        h1 { 
          text-align: center; 
          color: #1a1a1a;
          margin-bottom: 10px;
          font-size: 22px;
        }
        h2 {
          text-align: center;
          color: #666;
          font-weight: normal;
          margin-bottom: 20px;
          font-size: 14px;
        }
        .fecha-reporte {
          text-align: right;
          color: #666;
          margin-bottom: 20px;
          font-size: 11px;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-top: 20px;
        }
        th { 
          background-color: #dc2626; 
          color: white; 
          padding: 10px 8px;
          text-align: left;
          font-size: 10px;
          font-weight: 600;
        }
        td { 
          padding: 8px;
          border-bottom: 1px solid #ddd;
          font-size: 10px;
        }
        tr:hover { 
          background-color: #f9fafb; 
        }
        .nota-anterior {
          color: #dc2626;
          font-weight: 600;
        }
        .nota-nueva {
          color: #059669;
          font-weight: 600;
        }
        .motivo-cell {
          max-width: 200px;
          font-size: 9px;
        }
        @media print {
          body { padding: 10px; }
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>Reporte de Logs</h1>
      <h2>Historial de Cambios de Notas</h2>
      <div class="fecha-reporte">
        Fecha de generación: ${new Date().toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Nº</th>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Evaluador</th>
            <th>Área</th>
            <th>Nivel</th>
            <th>Estudiante</th>
            <th>Nota Ant.</th>
            <th>Nota Nueva</th>
            <th>Motivo</th>
          </tr>
        </thead>
        <tbody>
          ${logs.map((log, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${new Date(log.fecha).toLocaleDateString('es-ES')}</td>
              <td>${log.hora}</td>
              <td>${log.evaluador}</td>
              <td>${log.area}</td>
              <td>${log.nivel}</td>
              <td>${log.estudiante}</td>
              <td class="nota-anterior">${log.nota_anterior}</td>
              <td class="nota-nueva">${log.nota_nueva}</td>
              <td class="motivo-cell">${log.motivo}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

  ventana.document.write(contenido);
  ventana.document.close();
  
  setTimeout(() => {
    ventana.print();
  }, 250);
};

// ========== COMPONENTE PRINCIPAL ==========
function ReporteLogs() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);

    // ========== CARGAR LOGS DEL BACKEND ==========
  useEffect(() => {
    const obtenerLogs = async () => {
      try {
        const res = await api.get('/log');
        setLogs(res.data || []);
      } catch (err:any) {
        console.error("Error al cargar logs", err);
      } finally {
        setLoading(false);
      }
    };
    obtenerLogs();
  }, []);

  // ========== FILTRADO DE LOGS ==========
  const logsFiltrados = useMemo(() => {
    if (!busqueda.trim()) return logs;

    const term = busqueda.toLowerCase().trim();

      return logs.filter(log =>
        log.estudiante.toLowerCase().includes(term) ||
        log.evaluador.toLowerCase().includes(term) ||
        log.motivo.toLowerCase().includes(term)
      );
  }, [logs, busqueda]);

  // ========== MANEJADORES ==========
  const handleBusquedaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusqueda(e.target.value);
  };

  const handleExportarPDF = useCallback(() => {
    exportarPDF(logsFiltrados);
  }, [logsFiltrados]);

  if (loading) {
    return <p style={{ textAlign: 'center', padding: '2rem' }}>Cargando logs...</p>;
  }
  return (
    <div className="logs-container">
      {/* Header */}
      <div className="logs-header">
        <div className="logs-title-section">
          <h1 className="logs-title">Reporte de Logs</h1>
          <p className="logs-subtitle">Historial de cambios de notas</p>
        </div>
        <button className="btn-export-pdf-logs" onClick={handleExportarPDF}>
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
            placeholder="Buscar por estudiante, evaluador o motivo de cambio"
            value={busqueda}
            onChange={handleBusquedaChange}
            className="filtro-input-logs"
          />
        </div>
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
              <th>Estudiante</th>
              <th>Nota Anterior</th>
              <th>Nota Nueva</th>
              <th>Motivo</th>
            </tr>
          </thead>
          <tbody>
            {logsFiltrados.length === 0 ? (
              <tr>
                <td colSpan={10} className="empty-message">
                  No se encontraron registros con los filtros aplicados
                </td>
              </tr>
            ) : (
              logsFiltrados.map((log, index) => (
                <tr key={log.numero}>
                  <td className="numero-cell">{index + 1}</td>
                  <td>{new Date(log.fecha).toLocaleDateString('es-ES')}</td>
                  <td>{log.hora}</td>
                  <td>{log.evaluador}</td>
                  <td>{log.area}</td>
                  <td>{log.nivel}</td>
                  <td>{log.estudiante}</td>
                  <td className="nota-anterior-cell">{log.nota_anterior}</td>
                  <td className="nota-nueva-cell">{log.nota_nueva}</td>
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