// src/components/evaluadores/EvaluacionTable.tsx
import React from "react";
import type { Participante } from "../../interfaces/Evaluacion";
import "../../pages/evaluacion.css";
import { MessageSquareText } from "lucide-react";

interface Props {
  participantes: Participante[];
  onChange: (updated: Participante[]) => void;
  isEditable: boolean;
  esGrupal: boolean; // <-- Recibimos si es grupal
  esFaseFinal: boolean;
  estadoFase?: string; // <-- Nuevo prop opcional
  onOpenComentario?: (p: Participante) => void; // <-- Nuevo prop opcional
  comentariosIndividuales?: { [id_evaluacion: number]: string };
}

const EvaluacionTable: React.FC<Props> = ({ 
  participantes, 
  onChange, 
  isEditable, 
  esGrupal, // <-- Usamos la prop
  esFaseFinal,
  estadoFase,
  onOpenComentario,
  comentariosIndividuales
}) => {
  
  // Función para determinar la clase CSS según el tipo de medalla
  const getMedallaClass = (medalla: string): string => {
    const medallaNormalizada = medalla.toLowerCase().trim();
    
    if (medallaNormalizada === 'oro') return 'medalla-oro';
    if (medallaNormalizada === 'plata') return 'medalla-plata';
    if (medallaNormalizada === 'bronce') return 'medalla-bronce';
    if (medallaNormalizada.includes('mención') || medallaNormalizada.includes('mencion')) {
      return 'medalla-mencion';
    }
    
    return 'sin-medalla'; // Fallback
  };

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
              {esFaseFinal && <th>MEDALLA</th>}
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
              {esFaseFinal && <th>MEDALLA</th>}
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
             
              <td className="nota-cell">
                {isEditable ? (
                <div className="celda-nota">
                <input
                   type="number"
                   min={0}
                   max={100}
                   value={p.nota === null || p.nota === undefined ? "" : p.nota}
                   onChange={(e) => {
                     const valor = e.target.value;

                      // Si borran la nota → dejar vacío
                     if (valor === "") return handleNotaChange(p.id_evaluacion, NaN); // NaN = sin nota
 
                     const numero = Number(valor);

                      // Validar que sea número entre 0 y 100
                      if (!isNaN(numero) && numero >= 0 && numero <= 100) {
                        handleNotaChange(p.id_evaluacion, numero);
                     }
                  }}
                  disabled={
                    !isEditable ||
                   (estadoFase === "Rechazada" && !comentariosIndividuales?.[p.id_evaluacion])
                  }
                 className={
                  comentariosIndividuales?.[p.id_evaluacion]
                    ? "nota-editable"
                    : "nota-no-editable"}
                  />
                  {/* 🔵 PUNTO AZUL SI HAY COMENTARIO TEMPORAL */}
                {comentariosIndividuales?.[p.id_evaluacion] && (
                <span
                  className="punto-azul-indicador"
                  onClick={() => onOpenComentario?.(p)}
                ></span>
                )}
                </div>
                ) : (
                  <div className="nota-wrapper">
                    {p.nota ?? "-"}
               {estadoFase === "En Revisión" && onOpenComentario && (
                 <button
                   className="btn-comentario-nota"
                   onClick={() => onOpenComentario(p)}
                   title="Agregar comentario personalizado"
                   >
                   <MessageSquareText size={16}/>
                 </button>
                )}
              </div>
                )}
              </td>
              <td className="text-center">
                <input
                  type="checkbox"
                  checked={p.falta_etica ?? false}
                  onChange={evt => handleFaltaEticaChange(p.id_evaluacion, evt.target.checked)}
                  disabled={
                    !isEditable ||
                    (estadoFase === "Rechazada" && !comentariosIndividuales?.[p.id_evaluacion])
                  }
                />
              </td>
              <td>
                <input
                  type="text"
                  value={p.observaciones ?? ""}
                  onChange={evt => handleObsChange(p.id_evaluacion, evt.target.value)}
                  placeholder={isEditable ? "Observaciones..." : "No editable"}
                  disabled={
                    !isEditable ||
                    (estadoFase === "Rechazada" && !comentariosIndividuales?.[p.id_evaluacion])
                  } 
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
                  {p.medalla ? (
                    <span className={getMedallaClass(p.medalla)}>
                      {p.medalla}
                    </span>
                  ) : (
                    <span className="sin-medalla">—</span>
                  )}
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