// src/components/carga-masiva/CargarCSV.tsx
import React, { useRef, useState, useCallback } from 'react';
import api from '../../services/api'; // Importamos la instancia centralizada
import { useNavigate } from "react-router-dom";
import './CargarCSV.css';
import axios from 'axios';
import { NotificationModal } from '../common/NotificationModal'; // Importamos el modal

// Tipos para el modal de notificación
type NotificationType = 'success' | 'error' | 'info' | 'confirm';

interface CargarCSVProps {
}

function CargarCSV({}: CargarCSVProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

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
      } else {
        // Usamos el modal de error
        showNotification(data.message || 'Ocurrió un error desconocido durante la carga.', 'error', 'Error en la Carga');
        console.error('Error del servidor:', data);
      }

      return true;
    } catch (error: unknown) {
      console.error('Error al cargar CSV:', error);

      let errorMessage = 'Error de conexión o autenticación.';

      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message || errorMessage;

        if (error.response?.status === 401) {
          errorMessage = 'No autorizado. Tu sesión puede haber expirado.';
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      showNotification(errorMessage, 'error', 'Error de Conexión');
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

  const handleSelectCSV = () => inputRef.current?.click();

  const handleVerLista = () => {
  navigate("/administrador/listas");
};
 

  return (
    <div className="management-container">
      <div className="csv-header">
        <h1 className="csv-title">Carga de Olimpistas</h1>
        <p className="csv-description">
          Sube un archivo CSV con los datos de los olimpistas. El archivo debe contener las siguientes columnas:
          Nombre, Apellidos, Documento, Institucion,  Área, Nivel, Grado, Nombre Tutor, Contacto Tutor, Departamento.
        </p>
      </div>

      <div className="carga-action-buttons">
        <button className="btn-primary" onClick={handleSelectCSV}>
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
