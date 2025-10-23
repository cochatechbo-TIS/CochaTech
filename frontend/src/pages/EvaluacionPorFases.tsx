// src/pages/EvaluacionPorFases.tsx
import React, { useEffect, useState } from "react";
import type { Fase, Olimpista } from "../interfaces/Evaluacion";
import EvaluacionTable from "../components/evaluadores/EvaluacionTable";
import {
  obtenerFasesPorNivel,
  obtenerOlimpistasPorFase,
  guardarNotas,
} from "../services/evaluacionService";
import "./evaluacion.css";

const EvaluacionPorFases: React.FC = () => {
  const [fases, setFases] = useState<Fase[]>([]);
  const [faseSeleccionada, setFaseSeleccionada] = useState<Fase | null>(null);
  const [olimpistas, setOlimpistas] = useState<Olimpista[]>([]);
  const [loading, setLoading] = useState(false);

  const nivelId = 2; // ← luego vendrá del evaluador logueado

  useEffect(() => {
    (async () => {
      const fasesData = await obtenerFasesPorNivel(nivelId);
      setFases(fasesData);
      if (fasesData.length > 0) setFaseSeleccionada(fasesData[0]);
    })();
  }, []);

  useEffect(() => {
    if (faseSeleccionada) {
      cargarOlimpistas(faseSeleccionada.id);
    }
  }, [faseSeleccionada]);

  const cargarOlimpistas = async (faseId: number) => {
    setLoading(true);
    const data = await obtenerOlimpistasPorFase(faseId);
    setOlimpistas(data);
    setLoading(false);
  };

  const handleGuardar = async () => {
    if (!faseSeleccionada) return;
    await guardarNotas(faseSeleccionada.id, olimpistas);
    alert("Notas guardadas correctamente ✅");
  };

  return (
    <div className="evaluacion-container">
      <h1 className="titulo">Evaluación de olimpistas</h1>

      {/* Tabs dinámicos */}
      <div className="fases-tabs">
        {fases.map((f) => (
          <button
            key={f.id}
            onClick={() => setFaseSeleccionada(f)}
            className={`fase-tab ${
              faseSeleccionada?.id === f.id ? "active" : ""
            }`}
          >
            {f.nombre}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Cargando olimpistas...</p>
      ) : (
        <>
          <p className="info-olimpistas">
            👥 {olimpistas.length} olimpistas en esta fase
          </p>

          <EvaluacionTable olimpistas={olimpistas} onChange={setOlimpistas} />

          <div className="botones-evaluacion">
            <button className="btn btn-purple">Generar clasificados</button>
            <button className="btn btn-blue">Enviar lista</button>
            <button onClick={handleGuardar} className="btn btn-green">
              Guardar notas
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default EvaluacionPorFases;