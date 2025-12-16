// src/components/carga-masiva/CargarCSV.tsx
import React, { useRef, useState, useCallback, useEffect } from 'react';
import api from '../../services/api'; // Importamos la instancia centralizada
import { useNavigate } from "react-router-dom";
import './CargarCSV.css';
import axios from 'axios';
import { NotificationModal } from '../common/NotificationModal'; // Importamos el modal
import { CsvErrorModal } from './CsvErrorModal';

// Tipos para el modal de notificación
type NotificationType = 'success' | 'error' | 'info' | 'confirm';

interface CargarCSVProps {
  onVerLista: () => void;
  onGenerarListas: () => void;
  onUploadSuccess: () => Promise<void>;
}


function CargarCSV({ onUploadSuccess }: CargarCSVProps) {

  const [csvError, setCsvError] = useState<{
    message: string;
    faltan?: string[];
    sobran?: string[];
  } | null>(null);
  
  const [showCsvError, setShowCsvError] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [bloquearCSV, setBloquearCSV] = useState(false);

  // Estado para controlar el modal de notificaciones
  const [notification, setNotification] = useState({
    isVisible: false,
    message: '',
    type: 'info' as NotificationType,
    title: undefined as string | undefined,
    onConfirm: undefined as (() => void) | undefined,
  });

    const [confirmDialog, setConfirmDialog] = useState<{
    isVisible: boolean;
    file?: File;
  }>({ isVisible: false });

  const [isUploading, setIsUploading] = useState(false);

  // Función para mostrar una notificación
  const showNotification = useCallback((
    message: string,
    type: NotificationType,
    title?: string
  ) => {
    setNotification({
      isVisible: true,
      message,
      type,
      title,
      onConfirm: undefined, // No se usa confirmación aquí
    });
  }, []);

  // Función para cerrar la notificación
  const closeNotification = useCallback(() => setNotification(prev => ({ ...prev, isVisible: false })), []);

  // ✅ Función para subir archivo CSV al backend (con token)
  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file); // debe coincidir con $request->file('file') en Laravel

    try {
      const response = await api.post('/olimpistas/importar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // necesario para FormData
        },
      });

      const data = response.data;

      if (response.status === 200) {
        let successMessage = `Se procesó el archivo. Total de registros insertados: ${data.total_insertados}. Total de errores encontrados: ${data.total_errores}.`;
        let notificationType: NotificationType = 'success';
        let notificationTitle = 'Carga Exitosa';

        if (data.total_errores > 0) {
          notificationType = 'info'; // Cambiamos a 'info' si hay errores para que no parezca un éxito total
          notificationTitle = 'Carga con Errores';
          successMessage += ` Por favor, revisa los ${data.total_errores} registros que no pudieron ser importados.`;
        }

        showNotification(successMessage, notificationType, notificationTitle);
        console.log('Datos de inserción:', data);

        if (onUploadSuccess) {
          onUploadSuccess();
        }
      } else {
        // Usamos el modal de error
        showNotification(data.message || 'Ocurrió un error desconocido durante la carga.', 'error', 'Error en la Carga');
        console.error('Error del servidor:', data);
      }

      return true;
      } catch (error: unknown) {
        console.error('Error al cargar CSV:', error);
      
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          const data = error.response?.data;
      
          // 🟥 CUALQUIER ERROR 422 → MODAL CSV
          if (status === 422 && data?.message) {
            setCsvError(data);
            setShowCsvError(true);
            return false; // ⛔ NO mostrar toast
          }
      
          // 🔐 NO AUTORIZADO
          if (status === 401) {
            showNotification(
              'Tu sesión ha expirado. Vuelve a iniciar sesión.',
              'error',
              'No autorizado'
            );
            return false;
          }
      
          // ❌ OTROS ERRORES
          showNotification(
            data?.message || error.message,
            'error',
            'Error en la Carga'
          );
          return false;
        }
      
        // ❌ ERROR DESCONOCIDO
        showNotification(
          'Error inesperado al procesar el archivo.',
          'error',
          'Error'
        );
        return false;
      }
    
    
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileObj = e.target.files?.[0];
    if (fileObj && fileObj.name.endsWith('.csv')) {
      setConfirmDialog({ isVisible: true, file: fileObj });
     
      // Limpiar input (sea éxito o cancelación)
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleSelectCSV = () => {
    if (bloquearCSV) {
      showNotification(
        "Las olimpiadas ya iniciaron. No se pueden cargar más participantes.",
        "info",
        "Carga no permitida"
      );
      return;
    }
  inputRef.current?.click();
};

  const handleVerLista = () => {
    navigate("/administrador/listas");
  };

  useEffect(() => {
  const verificarFases = async () => {
    try {
      const res = await api.get('/fases/existen'); 

      if (res.data?.existen === true) {
        setBloquearCSV(true);
      }
      
    } catch (err) {
      console.error("Error verificando fases:", err);
    }
  };

  verificarFases();
}, []);


  return (
    <div className="management-container">
      <div className="csv-header">
        <h1 className="csv-title">Carga de Olimpistas</h1>

        <p className="csv-description">

          Sube un archivo CSV con los datos de los olimpistas. El archivo debe contener las siguientes columnas:
        </p>

        <div className="csv-columns">
          <span>ci</span>
          <span>nombre</span>
          <span>apellidos</span>
          <span>institucion</span>
          <span>area</span>
          <span>nivel</span>
          <span>grado</span>
          <span>contacto_tutor</span>
          <span>nombre_tutor</span>
          <span>departamento</span>
          <span>nombre_equipo</span>
        </div>

        <p className="csv-note">
          Nota: También debe respetar los tildes de las áreas, de lo contrario dará error.
        </p>
        <p className="csv-note">
          Nota 2: La columna de nombre_equipo puede dejarla vacia si es que el olimpista no pertenece a ningun equipo.

        </p>
      </div>

      <div className="carga-action-buttons">
        <button className={`btn-primary ${bloquearCSV ? 'btn-disabled' : 'btn-primary-enabled'}`}
        onClick={handleSelectCSV}
        >
          SELECCIONAR CSV
        </button>
        <button className="btn-secondary" onClick={handleVerLista}>
          VER LISTA
        </button>

        <input
          type="file"
          accept=".csv"
          ref={inputRef}
          className="csv-file-input-hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Componente de Notificación */}
      <div className="notification-container-wrapper">
        <NotificationModal
          isVisible={notification.isVisible}
          message={notification.message}
          type={notification.type}
          title={notification.title}
          onClose={closeNotification}
        />
        <CsvErrorModal
          isOpen={showCsvError}
          data={csvError}
          onClose={() => {
            setShowCsvError(false);
            setCsvError(null);
          }}
        />
        <NotificationModal
          isVisible={confirmDialog.isVisible}
          type="confirm"
          title="Confirmar Carga"
          message={`¿Deseas cargar el archivo ${confirmDialog.file?.name}? Esta acción guardará los datos en la base de datos.`}
          onClose={() => setConfirmDialog({ isVisible: false })}
          isConfirmDisabled={isUploading}
          onConfirm={async () => {
            if (confirmDialog.file) {
              setIsUploading(true);
              await uploadFile(confirmDialog.file);
              setIsUploading(false);
            }
            setConfirmDialog({ isVisible: false });
          }}
        />
      </div>
    </div>
  );
}

export default CargarCSV;

