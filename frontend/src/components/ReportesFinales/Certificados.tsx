import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import "./Certificados.css";
import api from "../../services/api";
import { useFiltrosAreaNivel } from "../../hooks/useFiltrosAreaNivel";
import FiltrosAreaNivel from "../../components/filtrosAreaNivel/FiltrosAreaNivel";
import { Download, ChevronDown } from "lucide-react";
// ✅ CORRECTO - Desde ReportesFinales hacia certificados
import {generarCertificadoIndividual,generarCertificadosMasivosUnido} from "../certificados/GeneradorCertificados";

interface Participante {
  id: number;
  nombre: string;
  ci: string;
  institucion: string;
  departamento: string;
  area: string;
  nivel: string;
  notaFinal: number;
  posicion: string;
  profesor: string;
  responsableArea: string;
  esGrupal: boolean;
}

const Certificados = () => {
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [busqueda, setBusqueda] = useState("");

  const [showMenu, setShowMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);


//-------------
const [generandoMasivo, setGenerandoMasivo] = useState(false);
const [progreso, setProgreso] = useState({ actual: 0, total: 0 });
const [showConfirmMasivo, setShowConfirmMasivo] = useState(false);
const [certSeleccionado, setCertSeleccionado] = useState<Participante | null>(null);
const [showConfirmIndividual, setShowConfirmIndividual] = useState(false);
  // Usuario
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const isAdmin = user?.rol?.nombre_rol === "administrador";

  // Filtros
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

  // ===================================================
  // 🔄 Cargar datos del backend
  // ===================================================
  useEffect(() => {
    const cargar = async () => {
      if (!selectedAreaId || !selectedNivelId) return;

      try {
        const resp = await api.get(
          `/reporte-premiacion/${selectedAreaId}/${selectedNivelId}`
        );

        const premiados = resp.data?.premiados || [];

        const parsed = premiados.map((p: any, index: number) => {
          const integrantes = p.integrantes
            ? Object.values(p.integrantes)
            : [];
          return {
          id: index + 1,
          nombre: p.nombre,
          ci: p.ci,
          institucion: p.institucion ?? "SIN INFORMACIÓN",
          departamento: p.departamento,
          area: p.area,
          nivel: p.nivel,
          notaFinal: Number(p.nota),
          posicion: p.medalla,
          profesor: p.tutor,
          responsableArea: p.responsable_area,
          esGrupal: integrantes.length > 0, // <<< NUEVO
          integrantes,
        };
      });

        setParticipantes(parsed);
      } catch (error) {
        console.error("Error cargando certificados:", error);
        setParticipantes([]);
      }
    };

    cargar();
  }, [selectedAreaId, selectedNivelId]);

  // ===================================================
  // FILTROS + BÚSQUEDA
  // ===================================================

  const participantesFiltrados = useMemo(() => {
    let result = participantes;

    if (selectedArea) {
      result = result.filter((p) => p.area === selectedArea);
    }
    if (selectedNivel) {
      result = result.filter((p) => p.nivel === selectedNivel);
    }

    if (busqueda.trim()) {
      const s = busqueda.toLowerCase();
      result = result.filter(
        (p) =>
          p.nombre.toLowerCase().includes(s) ||
          p.ci?.includes(s) ||
          p.institucion.toLowerCase().includes(s)
      );
    }

    return result;
  }, [participantes, selectedArea, selectedNivel, busqueda]);

  // Detectar si existe algún ganador grupal
  const hayGrupal = participantesFiltrados.some((p) => p.esGrupal);
// ===================================================
  // GENERAR CERTIFICADO INDIVIDUAL
  // ===================================================
  const handleGenerarCertificado = useCallback(async (participante: Participante) => {
  const resultado = await generarCertificadoIndividual(participante);

  if (resultado) {
    alert(`Certificado generado exitosamente para ${participante.nombre}`);
  } else {
    alert('Error al generar el certificado. Por favor, intenta nuevamente.');
  }
}, []);

const confirmarGenerarIndividual = useCallback(async () => {
  if (!certSeleccionado) return;

  setShowConfirmIndividual(false);

  await handleGenerarCertificado(certSeleccionado);
}, [certSeleccionado, handleGenerarCertificado]);

   // ===================================================
  // GENERAR CERTIFICADOS MASIVOS
  // ===================================================
  //Solo abre el modal
const handleGenerarTodosCertificados = useCallback(() => {
  if (participantesFiltrados.length === 0) return;
  setShowConfirmMasivo(true);
}, [participantesFiltrados]);

//Se ejecuta al hacer clic en "Aceptar" en el modal
const confirmarGenerarTodos = useCallback(async () => {
  setShowConfirmMasivo(false);
  setGenerandoMasivo(true);
  setProgreso({ actual: 0, total: participantesFiltrados.length });

  const resultado = await generarCertificadosMasivosUnido(
    participantesFiltrados,
    (actual: number, total: number) => {
      setProgreso({ actual, total });
    }
  );

  setGenerandoMasivo(false);
  alert(resultado.mensaje);
}, [participantesFiltrados]);


  // Expande los grupales: una fila por integrante
const expandirFilas = (lista: any[]) => {
  const filas: any[] = [];

  lista.forEach((p) => {
    const integrantes = Array.isArray(p.integrantes) ? p.integrantes : [];
    if (!p.esGrupal) {
      // INDIVIDUAL
      filas.push({
        grupo: "",
        nombre: p.nombre,
        ci: p.ci,
        institucion: p.institucion,
        departamento: p.departamento,
        area: p.area,
        nivel: p.nivel,
        nota: p.notaFinal,
        medalla: p.posicion,
        tutor: p.profesor,
        responsable: p.responsableArea
      });
    } else {
      // GRUPAL — UNA FILA POR INTEGRANTE
      integrantes.forEach((i: any) => {
        filas.push({
          grupo: p.nombre,
          nombre: i.nombre,
          ci: i.ci,
          institucion: p.institucion,
          departamento: p.departamento,
          area: p.area,
          nivel: p.nivel,
          nota: p.notaFinal,
          medalla: p.posicion,
          tutor: p.profesor,
          responsable: p.responsableArea
        });
      });
    }
  });

  return filas;
};

  useEffect(() => {
  const handleClickOutside = (e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setShowMenu(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);


  // ===================================================
  // EXPORTAR CSV
  // ===================================================
  const handleExportarCSV = useCallback(() => {
    const filas = expandirFilas(participantesFiltrados);
    const encabezado = [
      ...(hayGrupal ? ["Nombre Grupo"] : []),
      "Nombre",
      "CI",
      "Unidad Educativa",
      "Departamento",
      "Área",
      "Nivel",
      "Nota Final",
      "Medalla",
      "Tutor",
      "Responsable de Área",
    ];

    const contenidoFilas = filas.map((f) =>
      [
        ...(hayGrupal ? [f.grupo] : []),
      f.nombre,
      f.ci,
      f.institucion,
      f.departamento,
      f.area,
      f.nivel,
      f.nota,
      f.medalla,
      f.tutor,
      f.responsable
    ].join(",")
    );

    const contenido = [encabezado.join(","), ...contenidoFilas].join("\n");

    const blob = new Blob(["\ufeff", contenido], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Certificados_${selectedArea}_${selectedNivel}.csv`;
    link.click();
  }, [participantesFiltrados, selectedArea, selectedNivel, hayGrupal]);

  // ===================================================
  // EXPORTAR EXCEL
  // ===================================================
  const handleExportarExcel = useCallback(() => {
    const filas = expandirFilas(participantesFiltrados);
    const table = `
      <table border="1">
        <tr>
          ${hayGrupal ? "<th>NOMBRE GRUPO</th>" : ""}
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
        ${filas
          .map(
            (f) => `
          <tr>
            ${hayGrupal ? `<td>${f.grupo}</td>` : ""}
            <td>${f.nombre}</td>
            <td>${f.ci}</td>
            <td>${f.institucion}</td>
            <td>${f.departamento}</td>
            <td>${f.area}</td>
            <td>${f.nivel}</td>
            <td>${f.nota}</td>
            <td>${f.medalla}</td>
            <td>${f.tutor}</td>
            <td>${f.responsable}</td>
          </tr>`
          )
          .join("")}
      </table>
    `;

    const blob = new Blob(["\ufeff", table], {
      type: "application/vnd.ms-excel",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Certificados_${selectedArea}_${selectedNivel}.xls`;
    link.click();
  }, [participantesFiltrados, selectedArea, selectedNivel,hayGrupal]);

  // ===================================================
  // EXPORTAR PDF
  // ===================================================
  const handleExportarPDF = useCallback(() => {
    const filas = expandirFilas(participantesFiltrados);
    const ventana = window.open("", "", "width=1000,height=800");

    if (!ventana) return;

    ventana.document.write(`
      <html>
      <head>
        <title>Certificados</title>
        <style>
          table { width:100%; border-collapse: collapse; }
          th { background: #2563eb; color:white; padding:8px; }
          td { padding:8px; border-bottom:1px solid #ddd; text-align:center; }
        </style>
      </head>
      <body>
        <h1 style="text-align:center">Lista de Certificados</h1>
        <table>
          <tr>
            ${hayGrupal ? "<th>NOMBRE GRUPO</th>" : ""}
            <th>NOMBRE</th>
            <th>CI</th>
            <th>UNIDAD EDUCATIVA</th>
            <th>DEPARTAMENTO</th>
            <th>ÁREA</th>
            <th>NIVEL</th>
            <th>NOTA FINAL</th>
            <th>MEDALLA</th>
            <th>TUTOR</th>
            <th>RESPONSABLE</th>
          </tr>
          ${filas
            .map(
              (f) => `
            <tr>
              ${hayGrupal ? `<td>${f.grupo}</td>` : ""}
              <td>${f.nombre}</td>
              <td>${f.ci}</td>
              <td>${f.institucion}</td>
              <td>${f.departamento}</td>
              <td>${f.area}</td>
              <td>${f.nivel}</td>
              <td>${f.nota}</td>
              <td>${f.medalla}</td>
              <td>${f.tutor}</td>
              <td>${f.responsable}</td>
            </tr>`
            )
            .join("")}
        </table>
      </body>
      </html>
    `);

    ventana.document.close();
    setTimeout(() => ventana.print(), 300);
  }, [participantesFiltrados, hayGrupal]);

  const getPosicionClass = (pos: string) => {
    switch (pos.toLowerCase()) {
      case "oro": return "posicion-oro";
      case "plata": return "posicion-plata";
      case "bronce": return "posicion-bronce";
      default: return "sin-medalla";
    }
  };

  return (
    <div className="tab-content">
      {/* TÍTULO Y BOTONES */}
      <div className="content-header">
        <h3 className="content-title">Lista de Certificados</h3>
        <div className="content-header-right">
    <button 
      className="btn-export btn-certificado" 
      onClick={handleGenerarTodosCertificados}
      disabled={generandoMasivo || participantesFiltrados.length === 0}
    >
      {generandoMasivo 
        ? `GENERANDO... (${progreso.actual}/${progreso.total})`
        : '📜 GENERAR CERTIFICADOS'
      }
    </button>

    <div className="export-dropdown" ref={dropdownRef}>
      <button
        className="export-main-button"
        onClick={() => setShowMenu(!showMenu)}
      >
        <Download size={18} className="export-main-icon" />
        <span>Exportar</span>
        <ChevronDown size={18} className="export-main-chevron"/>
      </button>

      {showMenu && (
        <div className="export-menu">
          <button onClick={handleExportarCSV}>
            <i className="icon-file"></i> Exportar CSV
          </button>
          <button onClick={handleExportarExcel}>
            <i className="icon-excel"></i> Exportar Excel
          </button>
          <button onClick={handleExportarPDF}>
            <i className="icon-pdf"></i> Exportar PDF
          </button>
        </div>
      )}
    </div>
  </div>
</div>
      {/* FILTROS */}
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
        placeholderBusqueda="Buscar por nombre, CI o institución"
        isAdmin={isAdmin}
      />

      {/* TABLA */}
      <div className="ceremonia-table-container">
        <table className="ceremonia-table">
          <thead>
            <tr>
              <th>NOMBRE</th>
              {!hayGrupal && <th>CI</th>}
              <th>UNIDAD EDUCATIVA</th>
              <th>DEPARTAMENTO</th>
              <th>ÁREA</th>
              <th>NIVEL</th>
              <th>NOTA FINAL</th>
              <th>MEDALLA</th>
              <th>TUTOR</th>
              <th>RESPONSABLE DE ÁREA</th>
              <th>ACCIONES</th>
            </tr>
          </thead>

          <tbody>
            {participantesFiltrados.length === 0 ? (
              <tr>
                <td colSpan={10} className="empty-message">
                  No se encontraron participantes con los filtros aplicados.
                </td>
              </tr>
            ) : (
              participantesFiltrados.map((p) => (
                <tr key={p.id}>
                  <td>{p.nombre}</td>
                  {!p.esGrupal && <td>{p.ci}</td>}
                  <td>{p.institucion}</td>
                  <td>{p.departamento}</td>
                  <td>{p.area}</td>
                  <td>{p.nivel}</td>
                  <td className="nota-cell">{p.notaFinal}</td>
                  <td>
                    <span className={`badge-posicion ${getPosicionClass(p.posicion)}`}>
                      {p.posicion}
                    </span>
                  </td>
                  <td>{p.profesor}</td>
                  <td>{p.responsableArea}</td>
                  {/*certificado*/}
                  <td>
                    <button 
                    className="btn-generar-certificado"
                      onClick={() => {
                        setCertSeleccionado(p);
                        setShowConfirmIndividual(true);
                      }}
                      disabled={generandoMasivo}
                    >
                      📜
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {showConfirmMasivo && (
          <div className="modal-backdrop">
            <div className="modal">
              <h3>Generar certificados</h3>
              <p>
                ¿Deseas generar <strong>UN PDF</strong> con {participantesFiltrados.length} certificados?
                <br />
                Esto puede tomar varios minutos.
              </p>
              <div className="modal-actions">
              <button
                className="btn-outline"
                onClick={() => setShowConfirmMasivo(false)}
                disabled={generandoMasivo}
              >
                Cancelar
              </button>
              <button
                className="btn-danger"
                onClick={confirmarGenerarTodos}
                disabled={generandoMasivo}
              >
                {generandoMasivo ? 'Generando...' : 'Sí, Confirmar'}
              </button>
            </div>
            </div>
          </div>
        )}
        {showConfirmIndividual && certSeleccionado && (
          <div className="modal-backdrop">
            <div className="modal">
              <h3>Generar certificado</h3>
              <p>
                ¿Deseas generar el certificado para<br />
                <strong>{certSeleccionado.nombre}</strong>?
              </p>
              <div className="modal-actions">
                <button
                  className="btn-outline"
                  onClick={() => setShowConfirmIndividual(false)}
                  disabled={generandoMasivo}
                >
                  Cancelar
                </button>
                <button
                  className="btn-danger"
                  onClick={confirmarGenerarIndividual}
                  disabled={generandoMasivo}
                >
                  Sí, Confirmar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Certificados;
