// src/components/cronograma/CronogramaFases.tsx

import React from "react";
import type { Phase } from "./types";
import "./CronogramaFases.css";

// Hora local actual formateada para datetime-local
const todayLocal = (() => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
})();

interface CronogramaFasesProps {
  phases: Phase[];
  onFieldChange: (
    id: string,
    field: "startDate" | "endDate",
    value: string
  ) => void;
  onSave: () => void;
  bloqueado: boolean;
}

export const CronogramaFases: React.FC<CronogramaFasesProps> = ({
  phases,
  onFieldChange,
  onSave,
  bloqueado,
}) => {
  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return "0h 0m";
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate.getTime() - startDate.getTime();
    if (isNaN(diffMs) || diffMs <= 0) return "0h 0m";

    const mins = Math.floor(diffMs / 60000);
    const days = Math.floor(mins / (60 * 24));
    const hours = Math.floor((mins % (60 * 24)) / 60);
    const minutes = mins % 60;
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="management-container">
      <div className="edit-button-container">
        <button className={`btn-primary ${bloqueado ? 'btn-disabled' : 'btn-primary-enabled'}`} onClick={onSave}>
          GUARDAR CRONOGRAMA
        </button>
      </div>
      <div className="competitor-table-container">
      <table className="cronograma-table">
        <thead className="competitor-table-header">
          <tr>
            <th>Fase</th>
            <th>Fecha Inicio</th>
            <th>Fecha Fin</th>
            <th>Duración</th>
          </tr>
        </thead>

        <tbody>
          {phases.map((phase, index) => {
            // Calcular minStartDate: para primera fase = todayLocal, para posteriores = fin anterior +1min
            let minStartDate = todayLocal;
            if (index > 0 && phases[index - 1].endDate) {
              const prevEnd = new Date(phases[index - 1].endDate);
              prevEnd.setMinutes(prevEnd.getMinutes() + 1); // +1 minuto
              const y = prevEnd.getFullYear();
              const m = String(prevEnd.getMonth() + 1).padStart(2, "0");
              const d = String(prevEnd.getDate()).padStart(2, "0");
              const h = String(prevEnd.getHours()).padStart(2, "0");
              const min = String(prevEnd.getMinutes()).padStart(2, "0");
              minStartDate = `${y}-${m}-${d}T${h}:${min}`;
            }

            return (
              <tr key={phase.id}>
                <td>{phase.name}</td>

                {/* FECHA INICIO */}
                <td>
                  <input
                    type="datetime-local"
                    value={phase.startDate || todayLocal}
                    min={minStartDate}
                    disabled={bloqueado}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value < minStartDate) return; // bloquea valores menores
                      onFieldChange(phase.id, "startDate", value);
                    }}
                  />
                </td>

                {/* FECHA FIN */}
                <td>
                  <input
                    type="datetime-local"
                    value={phase.endDate}
                    min={phase.startDate || minStartDate} // nunca menor que startDate
                    disabled={bloqueado}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (phase.startDate && value < phase.startDate) return;
                      onFieldChange(phase.id, "endDate", value);
                    }}
                  />
                </td>

                <td>
                  <span className="duration-badge">
                    {calculateDuration(phase.startDate, phase.endDate)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    </div>
  );
};
