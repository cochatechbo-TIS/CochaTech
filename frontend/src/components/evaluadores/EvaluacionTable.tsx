// src/components/evaluadores/EvaluacionTable.tsx
import React from "react";
import type { Olimpista } from "../../interfaces/Evaluacion";
import "../../pages/evaluacion.css";

interface Props {
  olimpistas: Olimpista[];
  onChange: (updated: Olimpista[]) => void;
}

const EvaluacionTable: React.FC<Props> = ({ olimpistas, onChange }) => {
  const handleNotaChange = (id: number, value: number) => {
    const updated = olimpistas.map(o =>
      o.id === id ? { ...o, nota: Math.min(100, Math.max(0, value)) } : o
    );
    onChange(updated);
  };

  const handleObsChange = (id: number, value: string) => {
    const updated = olimpistas.map(o =>
      o.id === id ? { ...o, observaciones: value } : o
    );
    onChange(updated);
  };

  const handleFaltaEticaChange = (id: number, checked: boolean) => {
    const updated = olimpistas.map(o =>
      o.id === id ? { ...o, falta_etica: checked } : o
    );
    onChange(updated);
  };

  return (
    <div className="evaluacion-table-container">
      <table className="evaluacion-table">
        <thead>
          <tr>
            <th>NOMBRE</th>
            <th>CI</th>
            <th>INSTITUCIÓN</th>
            <th>NOTA (0-100)</th>
            <th>FALTA ÉTICA</th>
            <th>OBSERVACIONES</th>
            <th>ESTADO</th>
          </tr>
        </thead>
        <tbody>
          {olimpistas.map(o => (
            <tr key={o.id}>
              <td className="font-bold">{o.nombre}</td>
              <td>{o.ci}</td>
              <td>{o.institucion}</td>
              <td>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={o.nota ?? ""}
                  onChange={e => handleNotaChange(o.id, Number(e.target.value))}
                />
              </td>
              <td className="text-center">
                <input
                  type="checkbox"
                  checked={o.falta_etica}
                  onChange={e => handleFaltaEticaChange(o.id, e.target.checked)}
                />
              </td>
              <td>
                <input
                  type="text"
                  value={o.observaciones}
                  onChange={e => handleObsChange(o.id, e.target.value)}
                  placeholder="Observaciones..."
                />
              </td>
              <td className="estado">
                {o.estado === "Aprobado" ? (
                  <span className="estado-aprobado">Aprobado</span>
                ) : o.estado === "Reprobado" ? (
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
