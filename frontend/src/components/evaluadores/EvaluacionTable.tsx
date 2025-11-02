// src/components/evaluadores/EvaluacionTable.tsx
import React from "react";
import type { Evaluable } from "../../interfaces/Evaluacion"; // <-- CORREGIDO
import "../../pages/evaluacion.css";

interface Props {
  evaluables: Evaluable[]; // <-- CORREGIDO
  onChange: (updated: Evaluable[]) => void; // <-- CORREGIDO
  isEditable: boolean; // <-- CORREGIDO (asegúrate de que esté en la interfaz)
}

// CORREGIDO: Asegúrate de que 'isEditable' esté en la lista de parámetros
const EvaluacionTable: React.FC<Props> = ({ evaluables, onChange, isEditable }) => {
  
  // Las funciones handle ahora operan sobre 'evaluables'
  const handleNotaChange = (id: number, value: number) => {
    const updated = evaluables.map(e =>
      e.id === id ? { ...e, nota: Math.min(100, Math.max(0, value)) } : e
    );
    onChange(updated);
  };

  const handleObsChange = (id: number, value: string) => {
    const updated = evaluables.map(e =>
      e.id === id ? { ...e, observaciones: value } : e
    );
    onChange(updated);
  };

  const handleFaltaEticaChange = (id: number, checked: boolean) => {
    const updated = evaluables.map(e =>
      e.id === id ? { ...e, falta_etica: checked } : e
    );
    onChange(updated);
  };

  // Determinar si es una tabla de equipos o individuos
  const esGrupal = evaluables.length > 0 && evaluables[0].tipo === 'equipo';

  return (
    <div className="evaluacion-table-container">
      <table className="evaluacion-table">
        <thead>
          {/* Renderizado condicional del Header */}
          {esGrupal ? (
            <tr>
              <th>EQUIPO</th>
              <th>INSTITUCIÓN</th>
              <th>INTEGRANTES</th>
              <th>NOTA (0-100)</th>
              <th>FALTA ÉTICA</th>
              <th>OBSERVACIONES</th>
              <th>ESTADO</th>
            </tr>
          ) : (
            <tr>
              <th>NOMBRE</th>
              <th>CI</th>
              <th>INSTITUCIÓN</th>
              <th>NOTA (0-100)</th>
              <th>FALTA ÉTICA</th>
              <th>OBSERVACIONES</th>
              <th>ESTADO</th>
            </tr>
          )}
        </thead>
        <tbody>
          {evaluables.map(e => (
            <tr key={e.id}>
              {/* Renderizado condicional de las celdas */}
              <td className="font-bold">{e.nombre}</td>
              
              {esGrupal ? (
                // Columna 2: Institución
                <td>{e.institucion}</td>
              ) : (
                // Columna 2: CI
                <td>{e.ci}</td>
              )}

              {esGrupal ? (
                // Columna 3: Integrantes
                <td>{e.integrantes}</td>
              ) : (
                 // Columna 3: Institución
                 <td>{e.institucion}</td>
              )}
              
              {/* Columnas comunes */}
              <td>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={e.nota ?? ""}
                  onChange={evt => handleNotaChange(e.id, Number(evt.target.value))}
                  disabled={!isEditable}
                />
              </td>
              <td className="text-center">
                <input
                  type="checkbox"
                  checked={e.falta_etica}
                  onChange={evt => handleFaltaEticaChange(e.id, evt.target.checked)}
                  disabled={!isEditable}
                />
              </td>
              <td>
                <input
                  type="text"
                  value={e.observaciones}
                  onChange={evt => handleObsChange(e.id, evt.target.value)}
                  placeholder={isEditable ? "Observaciones..." : "No editable"}
                  disabled={!isEditable}
                />
              </td>
              <td className="estado">
                {e.estado === "Aprobado" ? (
                  <span className="estado-aprobado">Aprobado</span>
                ) : e.estado === "Reprobado" ? (
                  <span className="estado-reprobado">Reprobado</span>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EvaluacionTable;