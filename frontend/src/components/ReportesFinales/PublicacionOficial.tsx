// src/components/reportes/PublicacionOficial.tsx
import { useState, useCallback, useEffect, useMemo } from 'react';
import './PublicacionOficial.css';
import api from '../../services/api';
import { useFiltrosAreaNivel } from '../../hooks/useFiltrosAreaNivel';
import FiltrosAreaNivel from '../../components/filtrosAreaNivel/FiltrosAreaNivel'

interface PublicacionIndividual {
  nombre: string;
  apellido: string;
  area: string;
  posicion: number;
}

interface PublicacionGrupal {
  nombre: string;
  institucion: string;
  area: string;
  nivel: string;
  posicion: number;
}
type ParticipantePublicacion = PublicacionIndividual | PublicacionGrupal;

// ========== COMPONENTE ==========

function PublicacionOficial() {
  const [participantes, setParticipantes] = useState<ParticipantePublicacion[]>([]);
  const [tipo, setTipo] = useState<'grupal' | 'individual' | null>(null);
  const [busqueda, setBusqueda] = useState('');

  // ========== USUARIO ACTUAL ==========
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const isAdmin = user?.rol?.nombre_rol === 'administrador';

  // ========== HOOK DE FILTROS ==========
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

  useEffect(() => {
    const cargar = async () => {
      // Validaciones
      if (!selectedAreaId || !selectedNivelId) return;

      try {
        const resp = await api.get(`/reporte-oficial/${selectedAreaId}/${selectedNivelId}`);

        setTipo(resp.data.tipo);
        setParticipantes(resp.data.premiados || []);

      } catch (err) {
        console.error("Error cargando publicación oficial:", err);
        setParticipantes([]);
      }
    };

    cargar();
  }, [selectedAreaId, selectedNivelId]);

// ========== FILTRO DE BÚSQUEDA ==========
  const participantesFiltrados = useMemo(() => {
    if (!busqueda.trim()) return participantes;

    const search = busqueda.toLowerCase().trim();

    return participantes.filter((p: any) =>
      (p.nombre?.toLowerCase().includes(search) ||
       p.apellido?.toLowerCase().includes(search) ||
       p.institucion?.toLowerCase().includes(search) ||
       p.area?.toLowerCase().includes(search))
    );
  }, [busqueda, participantes]);
  
  // ========== MANEJADOR DE EXPORTACIÓN ==========
  const handleExportarPDF = useCallback(() => {
    exportarPDF(
    participantesFiltrados,
    selectedArea ?? 'Todos',
    selectedNivel ?? 'Todos'
  );
}, [participantesFiltrados, selectedArea, selectedNivel]);
   
const exportarPDF = (participantes: ParticipantePublicacion[], area: string, nivel: string) => {
  const ventana = window.open('', '', 'height=800,width=1000');

  if (!ventana) {
    alert('Por favor, habilita ventanas emergentes para exportar a PDF');
    return;
  }

  const contenido = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Publicación Oficial - ${area} - ${nivel}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { text-align: center; margin-bottom: 5px; }
        h2 { text-align: center; color: #555; margin-top: 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background: #3B82F6; color: #fff; padding: 12px; border: 1px solid #ddd; }
        td { padding: 10px; border: 1px solid #ddd; text-align: center; }
        @media print { button { display: none; } }
      </style>
    </head>
    <body>
      <h1>Publicación Oficial - Oh SanSi</h1>
      <h2>${area} - ${nivel}</h2>

      <table>
        <thead>
          <tr>
            <th>Nombre Completo</th>
            <th>Área</th>
            <th>Nivel</th>
            <th>Lugar Obtenido</th>
          </tr>
        </thead>
        <tbody>
          ${participantes
            .map(
              (p: any) => `
            <tr>
              <td>${p.apellido ? `${p.nombre} ${p.apellido}` : p.nombre}</td>
              <td>${p.area}</td>
              <td>${nivel}</td>
              <td>${p.posicion}° Lugar</td>
            </tr>`
            )
            .join('')}
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

  return (
    <div className="publicacion-oficial-container">
      {/* Header con botón de exportación */}
      <div className="publicacion-header">
        <h3 className="publicacion-title">Publicación Oficial</h3>
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

      {/* Info Box */}
      <div className="publicacion-info-box">
        <svg className="publicacion-info-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" stroke="white" strokeWidth="2" />
          <line x1="12" y1="8" x2="12.01" y2="8" stroke="white" strokeWidth="2" />
        </svg>
        <p className="publicacion-info-text">
          Formato simplificado para publicación en la web oficial Oh SanSi.
        </p>
      </div>
      {/* Filtros reutilizables */}
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
        placeholderBusqueda="Buscar por nombre o institución"
        isAdmin={isAdmin}
      />

      {/* Tabla Simple */}
      <div className="publicacion-table-container">
        <table className="publicacion-table">
          <thead>
            <tr>
              <th>Nombre Completo</th>
              <th>Área</th>
              <th>Nivel</th>
              <th>Lugar Obtenido</th>
            </tr>
          </thead>
          <tbody>
            {participantesFiltrados.length === 0 ? (
              <tr>
                <td colSpan={4} className="empty-message">
                  No hay premiados para esta área y nivel
                </td>
              </tr>
            ) : (
              participantesFiltrados.map((p: any, index: number) => (
                <tr key={index}>
                  <td>
                    {tipo === 'grupal'
                      ? p.nombre             // nombre del equipo
                      : `${p.nombre} ${p.apellido}`}  {/* individual */}
                  </td>
                  <td>{p.area}</td>
                  <td>{selectedNivel}</td>
                  <td className="lugar-cell">{p.posicion}° Lugar</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PublicacionOficial;