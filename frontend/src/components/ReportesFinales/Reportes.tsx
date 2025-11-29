// src/components/ReportesFinales/Reportes.tsx

import { useState } from "react";
import "./ReportesFinales.css";
import { TabNavigation } from "../registro/TabNavigation";

import Certificados from "./Certificados";
import CeremoniaPremiacion from "./CeremoniaPremiacion";
import PublicacionOficial from "./PublicacionOficial";

type ReporteTab = "certificados" | "ceremonia" | "publicacion";

const Reportes = () => {
  const [activeTab, setActiveTab] = useState<ReporteTab>("certificados");

  const reporteTabs = [
    { id: "certificados", label: "Certificados" },
    { id: "ceremonia", label: "Ceremonia de Premiación" },
    { id: "publicacion", label: "Publicación Oficial" },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case "certificados":
        return <Certificados />;
      case "ceremonia":
        return <CeremoniaPremiacion />;
      case "publicacion":
        return <PublicacionOficial />;
      default:
        return <Certificados />;
    }
  };

  return (
    <div className="gestion-competidores-page">
      <div className="page-content-wrapper">
        
        {/* Cabecera */}
        <div className="page-header">
          <h1 className="page-title">Reportes</h1>
          <p className="page-subtitle">
            Visualiza certificados, datos para ceremonia de premiación y 
            la publicación oficial de resultados.
          </p>
        </div>

        {/* Tabs */}
        <TabNavigation
          tabs={reporteTabs}
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as ReporteTab)}
        />

        {/* Contenido dinámico */}
        <div className="registro-content">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
};

export default Reportes;
