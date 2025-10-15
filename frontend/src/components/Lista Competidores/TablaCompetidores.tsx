// src/components/Lista Competidores/TablaCompetidores.tsx

import React from "react";
import type { NivelCompetencia } from "./tipo";

interface TablaCompetidoresProps {
  nivel: NivelCompetencia;
  onAsignarEvaluador: (nivel: string) => void;
  onVerDetalles: (nivel: string) => void;
  onIniciarEvaluacion: (nivel: string) => void;
  onContinuarEvaluacion: (nivel: string) => void;
}

const TablaCompetidores: React.FC<TablaCompetidoresProps> = ({
  nivel,
  onAsignarEvaluador,
  onVerDetalles,
  onIniciarEvaluacion,
  onContinuarEvaluacion,
}) => {
  const getEstadoBadge = () => {
    switch (nivel.estado) {
      case "no_iniciado":
        return <span>No iniciado - {nivel.fases_completadas} fase(s)</span>;
      case "en_proceso":
        return <span>En proceso - {nivel.fases_completadas} fase(s)</span>;
      case "completado":
        return <span>Completado</span>;
      default:
        return <span>No iniciado</span>;
    }
  };

  return (
    <div>
      <div>
        <span>{nivel.nivel}</span>{" "}
        <span>{nivel.competidores.length} participantes</span>{" "}
        <span>
          {nivel.evaluador ? `${nivel.evaluador.nombre} ${nivel.evaluador.apellidos}` : "No asignado"}
        </span>
        <div>{getEstadoBadge()}</div>
        <div>
          <button onClick={() => onAsignarEvaluador(nivel.nivel)}>Asignar Evaluador</button>
          <button onClick={() => onVerDetalles(nivel.nivel)}>Ver Detalles</button>
          {nivel.evaluador && nivel.estado === "en_proceso" && (
            <button onClick={() => onContinuarEvaluacion(nivel.nivel)}>
              Continuar Evaluación
            </button>
          )}
          {nivel.evaluador && nivel.estado === "no_iniciado" && (
            <button onClick={() => onIniciarEvaluacion(nivel.nivel)}>
              Iniciar Evaluación
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TablaCompetidores;