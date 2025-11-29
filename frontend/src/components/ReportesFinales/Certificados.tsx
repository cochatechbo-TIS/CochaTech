import { useEffect, useState, useMemo, useCallback } from "react";
import "./Certificados.css";
import api from "../../services/api";
import { useFiltrosAreaNivel } from "../../hooks/useFiltrosAreaNivel";
import FiltrosAreaNivel from "../../components/filtrosAreaNivel/FiltrosAreaNivel";

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
  esGrupal: boolean;
}

const Certificados = () => {
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [busqueda, setBusqueda] = useState("");

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

        const parsed = premiados.map((p: any, index: number) => ({
          id: index + 1,
          nombre: p.nombre,
          ci: p.ci,
          unidadEducativa: p.institucion,
          departamento: p.departamento,
          area: p.area,
          nivel: p.nivel,
          notaFinal: Number(p.nota),
          posicion: p.medalla,
          profesor: p.tutor,
          responsableArea: p.responsable_area,
          esGrupal: Array.isArray(p.integrantes) // <<< NUEVO
        }));

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
          p.unidadEducativa.toLowerCase().includes(s)
      );
    }

    return result;
  }, [participantes, selectedArea, selectedNivel, busqueda]);

  // Detectar si existe algún ganador grupal
  const hayGrupal = participantesFiltrados.some((p) => p.esGrupal);

  // ===================================================
  // EXPORTAR CSV
  // ===================================================
  const handleExportarCSV = useCallback(() => {
    const encabezado = [
      "Nombre",
      ...(!hayGrupal ? ["CI"] : []),
      "Unidad Educativa",
      "Departamento",
      "Área",
      "Nivel",
      "Nota Final",
      "Medalla",
      "Tutor",
      "Responsable de Área",
    ];

    const filas = participantesFiltrados.map((p) =>
      [
        p.nombre,
        ...(!hayGrupal ? [p.ci] : []),
        p.unidadEducativa,
        p.departamento,
        p.area,
        p.nivel,
        p.notaFinal,
        p.posicion,
        p.profesor,
        p.responsableArea,
      ].join(",")
    );

    const contenido = [encabezado.join(","), ...filas].join("\n");

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
    const table = `
      <table border="1">
        <tr>
          <th>NOMBRE</th>
          ${!hayGrupal ? "<th>CI</th>" : ""}
          <th>UNIDAD EDUCATIVA</th>
          <th>DEPARTAMENTO</th>
          <th>ÁREA</th>
          <th>NIVEL</th>
          <th>NOTA FINAL</th>
          <th>MEDALLA</th>
          <th>TUTOR</th>
          <th>RESPONSABLE DE ÁREA</th>
        </tr>
        ${participantesFiltrados
          .map(
            (p) => `
          <tr>
            <td>${p.nombre}</td>
            ${!hayGrupal ? `<td>${p.ci}</td>` : ""}
            <td>${p.unidadEducativa}</td>
            <td>${p.departamento}</td>
            <td>${p.area}</td>
            <td>${p.nivel}</td>
            <td>${p.notaFinal}</td>
            <td>${p.posicion}</td>
            <td>${p.profesor}</td>
            <td>${p.responsableArea}</td>
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
  }, [participantesFiltrados, selectedArea, selectedNivel, hayGrupal]);

  // ===================================================
  // EXPORTAR PDF
  // ===================================================
  const handleExportarPDF = useCallback(() => {
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
            <th>NOMBRE</th>
            ${!hayGrupal ? "<th>CI</th>" : ""}
            <th>UNIDAD EDUCATIVA</th>
            <th>DEPARTAMENTO</th>
            <th>ÁREA</th>
            <th>NIVEL</th>
            <th>NOTA FINAL</th>
            <th>MEDALLA</th>
            <th>TUTOR</th>
            <th>RESPONSABLE</th>
          </tr>
          ${participantesFiltrados
            .map(
              (p) => `
            <tr>
              <td>${p.nombre}</td>
              ${!hayGrupal ? `<td>${p.ci}</td>` : ""}
              <td>${p.unidadEducativa}</td>
              <td>${p.departamento}</td>
              <td>${p.area}</td>
              <td>${p.nivel}</td>
              <td>${p.notaFinal}</td>
              <td>${p.posicion}</td>
              <td>${p.profesor}</td>
              <td>${p.responsableArea}</td>
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
        <h3 className="content-title">Lista Certificados</h3>
        <div className="export-buttons">
          <button className="btn-export btn-csv" onClick={handleExportarCSV}>EXPORTAR CSV</button>
          <button className="btn-export btn-excel" onClick={handleExportarExcel}>EXPORTAR EXCEL</button>
          <button className="btn-export btn-pdf" onClick={handleExportarPDF}>EXPORTAR PDF</button>
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
      <div className="table-container">
        <table className="participantes-table">
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
                  <td>{p.unidadEducativa}</td>
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Certificados;
