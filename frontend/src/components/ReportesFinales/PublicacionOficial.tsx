// src/components/reportes/PublicacionOficial.tsx
import { useState, useCallback } from 'react';
import './PublicacionOficial.css';

// ========== INTERFACES ==========
interface ParticipantePublicacion {
  id: number;
  nombre: string;
  area: string;
  lugarObtenido: string;
}

interface PublicacionOficialProps {
  area?: string;
  nivel?: string;
}

// ========== DATOS DE PRUEBA ==========
const PARTICIPANTES_PUBLICACION: ParticipantePublicacion[] = [
  {
    id: 1,
    nombre: 'Juan Pérez',
    area: 'Matemática',
    lugarObtenido: '1° Lugar'
  },
  {
    id: 2,
    nombre: 'Carlos Mamani',
    area: 'Matemática',
    lugarObtenido: '2° Lugar'
  },
  {
    id: 3,
    nombre: 'María López',
    area: 'Matemática',
    lugarObtenido: '2° Lugar'
  },
  {
    id: 4,
    nombre: 'Pedro Flores',
    area: 'Matemática',
    lugarObtenido: '3° Lugar'
  },
  {
    id: 5,
    nombre: 'Laura Torrez',
    area: 'Matemática',
    lugarObtenido: '3° Lugar'
  }
];

// ========== COMPONENTE ==========
function PublicacionOficial({ area, nivel }: PublicacionOficialProps) {
  const [participantes] = useState<ParticipantePublicacion[]>(PARTICIPANTES_PUBLICACION);

  // ========== MANEJADOR DE EXPORTACIÓN ==========
  const handleExportarCSV = useCallback(() => {
    console.log('Exportando CSV para:', { area, nivel });
    // TODO: Implementar exportación a CSV
    alert(`Exportando datos de ${area} - ${nivel}`);
  }, [area, nivel]);

  return (
    <div className="publicacion-oficial-container">
      {/* Header con botón de exportación */}
      <div className="publicacion-header">
        <h3 className="publicacion-title">Publicación Oficial</h3>
        <button className="btn-export-csv" onClick={handleExportarCSV}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          EXPORTAR CSV
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

      {/* Tabla Simple */}
      <div className="publicacion-table-container">
        <table className="publicacion-table">
          <thead>
            <tr>
              <th>Nombre Completo</th>
              <th>Área</th>
              <th>Lugar Obtenido</th>
            </tr>
          </thead>
          <tbody>
            {participantes.map((participante) => (
              <tr key={participante.id}>
                <td>{participante.nombre}</td>
                <td className="area-cell">{participante.area}</td>
                <td className="lugar-cell">{participante.lugarObtenido}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PublicacionOficial;