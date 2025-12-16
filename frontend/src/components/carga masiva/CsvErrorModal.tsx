import React from 'react';
import './CsvErrorModal.css';

import {
  FileText,
  XCircle,
  AlertTriangle,
  CheckCircle,
  ListX
} from 'lucide-react';

interface CsvErrorModalProps {
  isOpen: boolean;
  data: {
    message: string;
    faltan?: string[];
    sobran?: string[];
    errores?: string[];
  } | null;
  onClose: () => void;
}

export const CsvErrorModal: React.FC<CsvErrorModalProps> = ({
  isOpen,
  data,
  onClose,
}) => {
  if (!isOpen || !data) return null;

  const faltan = data.faltan ?? [];
  const sobran = data.sobran ?? [];
  const errores = data.errores ?? [];

  return (
    <div className="csv-modal-overlay">
      <div className="csv-modal">
        {/* TÍTULO */}
        <h2 className="csv-title">
          <FileText className="icon error" />
          Error en el archivo CSV
        </h2>

        {/* MENSAJE PRINCIPAL */}
        <p className="csv-modal-message">
          <XCircle className="icon danger" />
          {data.message}
        </p>

        {/* ENCABEZADOS FALTANTES */}
        {faltan.length > 0 && (
          <div className="csv-section">
            <h4>
              <AlertTriangle className="icon warning" />
              Faltan los siguientes encabezados:
            </h4>
            <ul>
              {faltan.map((campo) => (
                <li key={campo}>{campo}</li>
              ))}
            </ul>
          </div>
        )}

        {/* ENCABEZADOS SOBRANTES */}
        {sobran.length > 0 && (
          <div className="csv-section">
            <h4>
              <CheckCircle className="icon info" />
              Encabezados no reconocidos:
            </h4>
            <ul>
              {sobran.map((campo) => (
                <li key={campo}>{campo}</li>
              ))}
            </ul>
          </div>
        )}

        {/* ERRORES POR FILA */}
        {errores.length > 0 && (
          <div className="csv-section csv-errors">
            <h4>
              <ListX className="icon danger" />
              Errores encontrados en el archivo:
            </h4>
            <ul className="csv-error-list">
              {errores.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* ACCIONES */}
        <div className="csv-modal-actions">
          <button onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
};
