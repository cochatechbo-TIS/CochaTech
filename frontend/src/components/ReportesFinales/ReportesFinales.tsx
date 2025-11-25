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

// Función para exportar a CSV
const exportarCSV = (participantes: Participante[], area: string, nivel: string) => {
  const headers = [
    'Nombre',
    'CI',
    'Unidad Educativa',
    'Departamento',
    'Área',
    'Nivel',
    'Nota Final',
    'Posición',
    'Tutor',
    'Responsable de Área'
  ];

  const rows = participantes.map(p => [
    p.nombre,
    p.ci,
    p.unidadEducativa,
    p.departamento,
    p.area,
    p.nivel,
    p.notaFinal.toString(),
    p.posicion,
    p.profesor,
    p.responsableArea
  ]);

  let csvContent = '\uFEFF'; // BOM para UTF-8
  csvContent += headers.join(',') + '\n';
  
  rows.forEach(row => {
    const escapedRow = row.map(cell => {
      // Escapar comillas y comas
      const cellStr = String(cell);
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    });
    csvContent += escapedRow.join(',') + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `Certificados_${area}_${nivel}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Función para exportar a Excel (HTML con formato)
const exportarExcel = (participantes: Participante[], area: string, nivel: string) => {
  const tabla = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Certificados</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          table { border-collapse: collapse; width: 100%; }
          th { background-color: #1e40af; color: white; font-weight: bold; padding: 10px; border: 1px solid #ddd; }
          td { padding: 8px; border: 1px solid #0712a4ff; }
          .nota-cell { text-align: center; font-weight: bold; }
          .posicion-oro { background-color: #e7c12dff; color: #c99f17ff; font-weight: bold; padding: 4px 8px; }
          .posicion-plata { background-color: #e5e7eb; color: #374151; font-weight: bold; padding: 4px 8px; }
          .posicion-bronce { background-color: #fed7aa; color: #92400e; font-weight: bold; padding: 4px 8px; }
        </style>
      </head>
      <body>
        <h2>Certificados - ${area} - ${nivel}</h2>
        <table>
          <thead>
            <tr>
              <th>NOMBRE</th>
              <th>CI</th>
              <th>UNIDAD EDUCATIVA</th>
              <th>DEPARTAMENTO</th>
              <th>ÁREA</th>
              <th>NIVEL</th>
              <th>NOTA FINAL</th>
              <th>POSICION</th>
              <th>TUTOR</th>
              <th>RESPONSANBLE DE ÁREA</th>
            </tr>
          </thead>
          <tbody>
            ${participantes.map(p => `
              <tr>
                <td>${p.nombre}</td>
                <td>${p.ci}</td>
                <td>${p.unidadEducativa}</td>
                <td>${p.departamento}</td>
                <td>${p.area}</td>
                <td>${p.nivel}</td>
                <td class="nota-cell">${p.notaFinal}</td>
                <td><span class="${getPosicionClass(p.posicion)}">${p.posicion}</span></td>
                <td>${p.profesor}</td>
                <td>${p.responsableArea}</td>
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
  link.setAttribute('download', `Certificados_${area}_${nivel}_${new Date().toISOString().split('T')[0]}.xls`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Función para exportar a PDF
const exportarPDF = (participantes: Participante[], area: string, nivel: string) => {
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
      <title>Certificados - ${area} - ${nivel}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          padding: 20px;
          font-size: 12px;
        }
        h1 { 
          text-align: center; 
          color: #1a1a1a;
          margin-bottom: 10px;
        }
        h2 {
          text-align: center;
          color: #666;
          font-weight: normal;
          margin-bottom: 20px;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-top: 20px;
        }
        th { 
          background-color: #3b82f6; 
          color: white; 
          padding: 10px; 
          text-align: center;
          font-size: 11px;
        }
        td { 
          padding: 8px; 
          border-bottom: 1px solid #ddd;
          font-size: 10px;
        }
        tr:hover { 
          background-color: #f9fafb; 
        }
        .nota-cell { 
          text-align: center; 
          font-weight: bold; 
        }
        .posicion-oro { 
          background-color: #fef3c7; 
          color: #92400e; 
          padding: 4px 8px; 
          border-radius: 8px;
          display: inline-block;
          font-weight: bold;
        }
        .posicion-plata { 
          background-color: #e5e7eb; 
          color: #374151; 
          padding: 4px 8px; 
          border-radius: 8px;
          display: inline-block;
          font-weight: bold;
        }
        .posicion-bronce { 
          background-color: #fed7aa; 
          color: #92400e; 
          padding: 4px 8px; 
          border-radius: 8px;
          display: inline-block;
          font-weight: bold;
        }
        .fecha {
          text-align: right;
          color: #666;
          margin-bottom: 20px;
          font-size: 11px;
        }
        @media print {
          body { padding: 10px; }
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>Certificados</h1>
      <h2>${area} - ${nivel}</h2>
      <div class="fecha">Fecha: ${new Date().toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}</div>
      
      <table>
        <thead>
          <tr>
            <th>NOMBRE</th>
            <th>CI</th>
            <th>UNIDAD EDUCATIVA</th>
            <th>DEPARTAMENTO</th>
            <th>CALIFICACION FINAL</th>
            <th>MEDALLERO</th>
            <th>TUTOR</th>
          </tr>
        </thead>
        <tbody>
          ${participantes.map(p => `
            <tr>
              <td>${p.nombre}</td>
              <td>${p.ci}</td>
              <td>${p.unidadEducativa}</td>
              <td>${p.departamento}</td>
              <td class="nota-cell">${p.notaFinal}</td>
              <td><span class="${getPosicionClass(p.posicion)}">${p.posicion}</span></td>
              <td>${p.profesor}</td>
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

  // ========== MANEJADORES DE EXPORTACIÓN ==========`
  const handleExportarCSV = useCallback(() => {
    console.log('Exportando a CSV...');
    exportarCSV(participantes, areaInicial, nivelInicial);
  }, [participantes, areaInicial, nivelInicial]);

  const handleExportarExcel = useCallback(() => {
  console.log('Exportando a Excel...');
  exportarExcel(participantes, areaInicial, nivelInicial); // <-- Ejecuta la función real
}, [participantes, areaInicial, nivelInicial]);

const handleExportarPDF = useCallback(() => {
  console.log('Exportando a PDF...');
  exportarPDF(participantes, areaInicial, nivelInicial); // <-- Ejecuta la función real
}, [participantes, areaInicial, nivelInicial]);


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
                <button className="btn-export btn-csv" onClick={handleExportarCSV}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  EXPORTAR CSV
                </button>
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
                    <th>NOMBRE</th>
                    <th>CI</th>
                    <th>UNIDAD EDUCATIVA</th>
                    <th>DEPARTAMENTO</th>
                    <th>ÁREA</th>
                    <th>NIVEL</th>
                    <th>NOTA FINAL</th>
                    <th>MEDALLA</th>
                    <th>TUTOR</th>
                    <th>RESPONSABLE DE ÁREA</th>
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