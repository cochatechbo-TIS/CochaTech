// src/components/reportes/CeremoniaPremiacion.tsx
import { useState, useCallback, useMemo, useEffect } from 'react';
import './CeremoniaPremiacion.css';
import api from '../../services/api';
import { useFiltrosAreaNivel } from '../../hooks/useFiltrosAreaNivel';
import FiltrosAreaNivel from '../../components/filtrosAreaNivel/FiltrosAreaNivel';

// ========== INTERFACES ==========
interface ParticipantePremiacion {
  id: number;
  nombre: string;
  unidadEducativa: string;
  area: string;
  nivel: string;
  posicion: string;
}
function CeremoniaPremiacion() {
  const [participantes, setParticipantes] = useState<ParticipantePremiacion[]>([]);
  const [busqueda, setBusqueda] = useState('');
  // ========== USUARIO ==========
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const isAdmin = user?.rol?.nombre_rol === 'administrador';

  const {
    areas,
    niveles,
    selectedArea,
    selectedAreaId,
    selectedNivel,
    selectedNivelId,
    handleAreaChange,
    handleNivelChange
  } = useFiltrosAreaNivel(isAdmin);

   // ========== CARGAR DATOS DEL BACKEND ==========
  useEffect(() => {
    const cargar = async () => {
      if (!selectedAreaId || !selectedNivelId) return;

      try {
        const resp = await api.get(`/reporte-ceremonia/${selectedAreaId}/${selectedNivelId}`);

        const premiados = resp.data?.premiados || [];

        const parsed = premiados.map((p: any, index: number) => ({
          id: index + 1,
          nombre: p.nombre,
          unidadEducativa: p.institucion,
          area: p.area,
          nivel: p.nivel,
          posicion: p.posicion
        }));

        setParticipantes(parsed);
      } catch (err) {
        console.error("Error cargando premiación:", err);
        setParticipantes([]);
      }
    };

    cargar();
  }, [selectedAreaId, selectedNivelId]);

  // ========== FILTRADO DE PARTICIPANTES ==========
  const participantesFiltrados = useMemo(() => {
    let resultado = participantes;

    // Filtrar por área
    if (selectedArea) {
      resultado = resultado.filter(p => p.area === selectedArea);
    }

    // Filtrar por nivel
    if (selectedNivel) {
      resultado = resultado.filter(p => p.nivel === selectedNivel);
    }

    // Filtrar por búsqueda
    if (busqueda.trim()) {
      const searchLower = busqueda.toLowerCase().trim();
      resultado = resultado.filter(p =>
        p.nombre.toLowerCase().includes(searchLower) ||
        p.unidadEducativa.toLowerCase().includes(searchLower)
      );
    }

    return resultado;
  }, [participantes, selectedArea, selectedNivel, busqueda]);

// Función para exportar a Excel
const exportarExcel = (participantes: ParticipantePremiacion[], area: string, nivel: string) => {
  const tabla = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head>
        <meta charset="utf-8">
        <style>
          table { border-collapse: collapse; width: 100%; }
          th { background-color: #3b82f6; color: white; font-weight: bold; padding: 10px; border: 1px solid #ddd; }
          td { padding: 8px; border: 1px solid #ddd; text-align: center; }
          .posicion-oro { background-color: #fef3c7; color: #92400e; font-weight: bold; }
          .posicion-plata { background-color: #e5e7eb; color: #374151; font-weight: bold; }
          .posicion-bronce { background-color: #fed7aa; color: #92400e; font-weight: bold; }
        </style>
      </head>
      <body>
        <h2>Ceremonia de Premiación - ${area} - ${nivel}</h2>
        <p>Esta lista incluye solo a los participantes que obtuvieron medallas o menciones de honor, ordenados por área y nivel.</p>
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Institución</th>
              <th>Área</th>
              <th>Nivel</th>
              <th>Posición</th>
            </tr>
          </thead>
          <tbody>
            ${participantes.map(p => `
              <tr>
                <td>${p.nombre}</td>
                <td>${p.unidadEducativa}</td>
                <td>${p.area}</td>
                <td>${p.nivel}</td>
                <td class="lugar-cell">${p.posicion}° Lugar</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', tabla], { type: 'application/vnd.ms-excel' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `Ceremonia_${area}_${nivel}_${new Date().toISOString().split('T')[0]}.xls`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Función para exportar a PDF
const exportarPDF = (participantes: ParticipantePremiacion[], area: string, nivel: string) => {
  const ventana = window.open('', '', 'height=800,width=1000');
  
  if (!ventana) {
    alert('Por favor, permite las ventanas emergentes para exportar a PDF');
    return;
  }

  const contenido = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Ceremonia de Premiación - ${area} - ${nivel}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { text-align: center; color: #1a1a1a; }
        h2 { text-align: center; color: #666; font-weight: normal; }
        .info { text-align: center; color: #666; margin-bottom: 20px; font-style: italic; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background-color: #3b82f6; color: white; padding: 12px; text-align: center; }
        td { padding: 10px; border-bottom: 1px solid #ddd; text-align: center; }
        .posicion-oro { background-color: #fef3c7; color: #92400e; padding: 6px 12px; border-radius: 8px; font-weight: bold; }
        .posicion-plata { background-color: #e5e7eb; color: #374151; padding: 6px 12px; border-radius: 8px; font-weight: bold; }
        .posicion-bronce { background-color: #fed7aa; color: #92400e; padding: 6px 12px; border-radius: 8px; font-weight: bold; }
        @media print { button { display: none; } }
      </style>
    </head>
    <body>
      <h1>Ceremonia de Premiación</h1>
      <h2>${area} - ${nivel}</h2>
      <p class="info">Esta lista incluye solo a los participantes que obtuvieron medallas o menciones de honor.</p>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Unidad Educativa</th>
            <th>Área</th>
            <th>Nivel</th>
            <th>Posición</th>
          </tr>
        </thead>
        <tbody>
          ${participantes.map(p => `
            <tr>
              <td>${p.nombre}</td>
              <td>${p.unidadEducativa}</td>
              <td>${p.area}</td>
              <td>${p.nivel}</td>
              <td><span class="lugar-cell">${p.posicion}° Lugar</span></td>
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

  // ========== MANEJADORES ==========
  const handleExportarExcel = useCallback(() => {
    exportarExcel(participantesFiltrados, selectedArea ?? 'Todos', selectedNivel ?? 'Todos');
  }, [participantesFiltrados, selectedArea, selectedNivel]);

  const handleExportarPDF = useCallback(() => {
    exportarPDF(participantesFiltrados, selectedArea ?? 'Todos', selectedNivel ?? 'Todos');
  }, [participantesFiltrados, selectedArea, selectedNivel]);
  return (
    <div className="ceremonia-container">
      {/* Header con botones de exportación */}
      <div className="ceremonia-header">
        <h3 className="ceremonia-title">Ceremonia de Premiación</h3>
        <div className="ceremonia-export-buttons">
                <button className="btn-export-ceremonia btn-excel-ceremonia" onClick={handleExportarExcel}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  EXPORTAR EXCEL
                </button>
                <button className="btn-export-ceremonia btn-pdf-ceremonia" onClick={handleExportarPDF}>
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
      <div className="ceremonia-info-box">
        <svg className="ceremonia-info-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" stroke="white" strokeWidth="2" />
          <line x1="12" y1="8" x2="12.01" y2="8" stroke="white" strokeWidth="2" />
        </svg>
        <p className="ceremonia-info-text">
          Esta lista incluye solo a los participantes que obtuvieron medallas o menciones de honor, ordenados por área y nivel.
        </p>
      </div>
      {/* Filtros usando el componente reutilizable */}
      <FiltrosAreaNivel
        areas={areas}
        niveles={niveles}
        selectedArea={selectedArea}
        selectedNivel={selectedNivel}
        onAreaChange={handleAreaChange}
        onNivelChange={handleNivelChange}
        showBusqueda={true}
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
        placeholderBusqueda="Buscar participante o institución"
        isAdmin={isAdmin}
      />
      {/* Tabla */}
      <div className="ceremonia-table-container">
        <table className="ceremonia-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Unidad Educativa</th>
              <th>Área</th>
              <th>Nivel</th>
              <th>Posición</th>
            </tr>
          </thead>
          <tbody>
            {participantesFiltrados.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-message">
                  No se encontraron participantes con los filtros aplicados
                </td>
              </tr>
            ) : (
              participantesFiltrados.map((participante) => (
                <tr key={participante.id}>
                  <td>{participante.nombre}</td>
                  <td>{participante.unidadEducativa}</td>
                  <td>{participante.area}</td>
                  <td>{participante.nivel}</td>
                  <td>
                    <span className="lugar-cell">
                      {participante.posicion}° Lugar
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CeremoniaPremiacion;