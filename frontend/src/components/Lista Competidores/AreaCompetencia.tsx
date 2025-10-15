// src/components/Lista Competidores/AreaCompetencia.tsx

import React from "react";
import type { AreaCompetencia as AreaCompetenciaType } from "./tipo";
import TablaCompetidores from "./TablaCompetidores";


interface AreaCompetenciaProps {
  area: AreaCompetenciaType;
  onAsignarEvaluador: (area: string, nivel: string) => void;
  onVerDetalles: (area: string, nivel: string) => void;
  onIniciarEvaluacion: (area: string, nivel: string) => void;
  onContinuarEvaluacion: (area: string, nivel: string) => void;
}

const AreaCompetencia: React.FC<AreaCompetenciaProps> = ({
  area,
  onAsignarEvaluador,
  onVerDetalles,
  onIniciarEvaluacion,
  onContinuarEvaluacion,
}) => (
  <div>
    <h3>Área: {area.area}</h3>
    <span>Responsable: {area.responsable}</span>
    <div>
      {area.niveles.map((nivel) => (
        <TablaCompetidores
          key={nivel.nivel}
          nivel={nivel}
          onAsignarEvaluador={(nivelStr: string) => onAsignarEvaluador(area.area, nivelStr)}
          onVerDetalles={(nivelStr: string) => onVerDetalles(area.area, nivelStr)}
          onIniciarEvaluacion={(nivelStr: string) => onIniciarEvaluacion(area.area, nivelStr)}
          onContinuarEvaluacion={(nivelStr: string) => onContinuarEvaluacion(area.area, nivelStr)}
        />
      ))}
    </div>
  </div>
);

export default AreaCompetencia;