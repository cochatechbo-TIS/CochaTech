import React, { useEffect, useState } from "react";
import { TabNavigation } from "../components/tabNavegacion/TabNavigation";
import ParametrizacionMedallero from "../components/configuracion/ParametrizacionMedallero";
import { CronogramaFases } from "../components/cronograma/CronogramaFases";
import type { Phase } from "../components/cronograma/types";
import api from "../services/api";
import { NotificationModal } from "../components/common/NotificationModal";

type HistorialTab = "parametrizacion" | "cronograma";

//  CONVIERTE LOCAL → BACKEND (SIN CAMBIAR HORA)
const toBackendDateLocal = (local: string | null) => {
  if (!local) return null;
  return local.replace("T", " ") + ":00";
};

//  OBTENER FECHA/HORA LOCAL
const getNowLocal = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const Configuracion: React.FC = () => {
  const [bloquearCronograma, setBloquearCronograma] = useState(false);
  const [notification, setNotification] = useState({
  isVisible: false,
  message: "",
  type: "info" as "success" | "error" | "info",
  title: "",
});

const showNotification = (
  message: string,
  type: "success" | "error" | "info",
  title?: string
) => {
  setNotification({
    isVisible: true,
    message,
    type,
    title: title || "",
  });
};

const closeNotification = () => {
  setNotification((prev) => ({ ...prev, isVisible: false }));
};

  const [activeTab, setActiveTab] = useState<HistorialTab>("parametrizacion");
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const historialTabs = [
    { id: "parametrizacion", label: "Parametrización del Medallero" },
    { id: "cronograma", label: "Cronograma" },
  ];

  // Cargar fases
  const fetchFases = async () => {
    setLoading(true);
    try {
      const res = await api.get("/fases");

      const formatted: Phase[] = res.data.map((f: any, index: number) => {
        let startDate = f.fecha_inicio
          ? f.fecha_inicio.replace(" ", "T").slice(0, 16)
          : "";

        // Si la Fase 1 no tiene fecha, asignar AHORA local
        if (index === 0 && !startDate) {
          startDate = getNowLocal();
        }

        return {
          id: String(f.id_fase),
          name: f.nombre,
          startDate,
          endDate: f.fecha_fin
            ? f.fecha_fin.replace(" ", "T").slice(0, 16)
            : "",
        };
      });

      setPhases(formatted);
    } catch (error) {
      console.error("Error obteniendo fases:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFases();
    const verificarBloqueoCronograma = async () => {
    try {
      const res = await api.get('/fases/existen');
      if (res.data?.existen === true) {
        setBloquearCronograma(true);
      }
    } catch (err) {
      console.error('Error verificando fases:', err);
    }
  };

  verificarBloqueoCronograma();
}, []);

  // Actualizar campo editable
  const onFieldChange = (
    id: string,
    field: "startDate" | "endDate",
    value: string
  ) => {
    setPhases((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  // Guardar fases (SIN new Date)
 const onSave = async () => {
  if (bloquearCronograma) {
    showNotification(
  "Las olimpiadas ya iniciaron. No se puede modificar el cronograma.",
  "info",
  "Edición no permitida"
);
    return;
  }

  const compare = (a: string, b: string) => a.localeCompare(b);

  // Validaciones locales
  for (let i = 0; i < phases.length; i++) {
    const curr = phases[i];

    if (!curr.startDate || !curr.endDate) {
      showNotification(
  `La fase "${curr.name}" debe tener fecha de inicio y fin.`,
  "info",
  "Datos incompletos"
);
return;

    }

    if (compare(curr.endDate, curr.startDate) <= 0) {
      showNotification(
  `La fase "${curr.name}" tiene una duración inválida. La fecha de fin debe ser posterior a la de inicio.`,
  "info",
  "Duración inválida"
);
return;

    }

    if (i > 0) {
      if (compare(curr.startDate, phases[i - 1].endDate) < 0) {
        showNotification(
  `La fase "${curr.name}" inicia antes de que finalice la fase anterior.`,
  "info",
  "Orden de fases inválido"
);
return;

      }
    }
  }

  // Armar payload MASIVO
  const payload = {
    fases: phases.map((p) => ({
      id_fase: Number(p.id),
      fecha_inicio: toBackendDateLocal(p.startDate),
      fecha_fin: toBackendDateLocal(p.endDate),
    })),
  };

  console.log("PUT /fases/actualizar-fechas", payload);

  // Enviar UNA sola petición
  try {
    await api.put("/fases/actualizar-fechas", payload);
    showNotification(
  "El cronograma fue guardado correctamente.",
  "success",
  "Guardado exitoso"
);

    fetchFases();
  } catch (error: any) {
    showNotification(
  error.response?.data?.error || "Error al guardar el cronograma.",
  "error",
  "Error"
);

    fetchFases();
  }
};

  // Render
  const renderActiveTab = () => {
    switch (activeTab) {
      case "parametrizacion":
        return <ParametrizacionMedallero />;

      case "cronograma":
        return loading ? (
      <div className="management-container">
        <p>Cargando cronograma...</p>
      </div>
      ) : (
          <CronogramaFases
            phases={phases}
            onFieldChange={onFieldChange}
            onSave={onSave}
            bloqueado={bloquearCronograma}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="gestion-competidores-page">
      <div className="page-content-wrapper">
        <div className="page-header">
          <h1 className="page-title">Configuración</h1>
          <p className="page-subtitle">
            Gestiona la configuración del sistema
          </p>
        </div>

        <TabNavigation
          tabs={historialTabs}
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as HistorialTab)}
        />

        <div className="historial-content">{renderActiveTab()}</div>
      </div>
      <NotificationModal
  isVisible={notification.isVisible}
  message={notification.message}
  type={notification.type}
  title={notification.title}
  onClose={closeNotification}
/>

    </div>
  );
};

export default Configuracion;
