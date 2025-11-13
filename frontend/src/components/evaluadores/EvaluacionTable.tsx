// src/components/evaluadores/EvaluacionTable.tsx
import React from "react";
import type { Participante } from "../../interfaces/Evaluacion";
import "../../pages/evaluacion.css";

interface Props {
  participantes: Participante[];
  onChange: (updated: Participante[]) => void;
  isEditable: boolean;
  esGrupal: boolean; // <-- Recibimos si es grupal
  esFaseFinal: boolean;
}

const EvaluacionTable: React.FC<Props> = ({ 
  participantes, 
  onChange, 
  isEditable, 
  esGrupal, // <-- Usamos la prop
  esFaseFinal
}) => {
  
  const handleNotaChange = (id: number, value: number) => {
    const updated = participantes.map(p =>
      p.id_evaluacion === id ? { ...p, nota: Math.min(100, Math.max(0, value)) } : p
    );
    onChange(updated);
  };

  const handleObsChange = (id: number, value: string) => {
    const updated = participantes.map(p =>
      p.id_evaluacion === id ? { ...p, observaciones: value } : p
    );
    onChange(updated);
  };

  const handleFaltaEticaChange = (id: number, checked: boolean) => {
    const updated = participantes.map(p =>
      p.id_evaluacion === id ? { ...p, falta_etica: checked } : p
    );
    onChange(updated);
  };

  // --- LÍNEA REDUNDANTE ELIMINADA ---
  // const esGrupal = participantes.length > 0 && participantes[0].tipo === 'equipo';
  // (Esta línea causaba el error 'length' of undefined)

  return (
    <div className="evaluacion-table-container">
      <table className="evaluacion-table">
        <thead>
          {/* Ahora usa la prop 'esGrupal' */}
          {esGrupal ? (
            <tr>
              <th>EQUIPO</th>
              <th>INSTITUCIÓN</th>
              <th>NOTA (0-100)</th>
              <th>FALTA ÉTICA</th>
              <th>OBSERVACIONES</th>
              <th>ESTADO</th>
              {esFaseFinal && <th>MEDALLERO</th>}
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
              {esFaseFinal && <th>MEDALLERO</th>}
            </tr>
          )}
        </thead>
        <tbody>
          {participantes.map(p => (
            <tr key={p.id_evaluacion}>
              
              <td className="font-bold">
                {esGrupal ? p.nombre_equipo : `${p.nombre} ${p.apellidos}`}
              </td>
              
              {!esGrupal && (
                <td>{p.ci}</td>
              )}

              <td>{p.institucion}</td>

              {/* ... (el resto de tus <td> son correctos) ... */}
              
              <td>
                <input
                   type="number"
                   min={0}
                   max={100}
                   value={p.nota === null || p.nota === undefined ? "" : p.nota}
                   onChange={(e) => {
                     const valor = e.target.value;

                      // Si borran la nota → dejar vacío
                     if (valor === "") {
                       handleNotaChange(p.id_evaluacion, NaN); // NaN = sin nota
                      return;
                     }

                     const numero = Number(valor);

                      // Validar que sea número entre 0 y 100
                      if (!isNaN(numero) && numero >= 0 && numero <= 100) {
                        handleNotaChange(p.id_evaluacion, numero);
                     }
                  }}
                 disabled={!isEditable}
               />
              </td>

              <td className="text-center">
                <input
                  type="checkbox"
                  checked={p.falta_etica ?? false}
                  onChange={evt => handleFaltaEticaChange(p.id_evaluacion, evt.target.checked)}
                  disabled={!isEditable}
                />
              </td>
              <td>
                <input
                  type="text"
                  value={p.observaciones ?? ""}
                  onChange={evt => handleObsChange(p.id_evaluacion, evt.target.value)}
                  placeholder={isEditable ? "Observaciones..." : "No editable"}
                  disabled={!isEditable}
                />
              </td>
              <td className="estado">
                <span className={
                  p.estado_olimpista === "Clasificado" ? "estado-aprobado" :
                  p.estado_olimpista === "No Clasificado" ? "estado-reprobado" : ""
                }>
                  {p.estado_olimpista ?? "-"}
                </span>
              </td>
              {esFaseFinal && (
                <td className="medallero">
                  {p.medalla ?? "—"}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EvaluacionTable;