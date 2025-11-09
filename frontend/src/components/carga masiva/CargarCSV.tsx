// src/components/carga-masiva/CargarCSV.tsx
import React, { useRef } from 'react';
import api from '../../services/api'; // Importamos la instancia centralizada
import { useNavigate } from "react-router-dom";
import './CargarCSV.css';
import axios from 'axios';
interface CargarCSVProps {
  onVerLista?: () => void;
  onGenerarListas?: () => void;
}

function CargarCSV({ onVerLista }: CargarCSVProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

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
        let successMessage = `✅ ¡Archivo cargado exitosamente!
Total insertados: ${data.total_insertados}
Total errores: ${data.total_errores}`;

        if (data.total_errores > 0) {
          successMessage += `\n⚠️ Revisa los ${data.total_errores} errores.`;
        }

        alert(successMessage);
        console.log('Datos de inserción:', data);
      } else {
        alert(`❌ Error en la carga: ${data.message || 'Error desconocido'}`);
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

      alert(errorMessage);
      return false;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileObj = e.target.files?.[0];
    if (fileObj && fileObj.name.endsWith('.csv')) {
      if (window.confirm(`¿Deseas cargar el archivo ${fileObj.name}? Esta acción guardará los datos en la base de datos.`)) {
        await uploadFile(fileObj);
      }

      // Limpiar input (sea éxito o cancelación)
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleSelectCSV = () => inputRef.current?.click();

  const handleVerLista = () => {
  if (onVerLista) {
    onVerLista();
  } else {
    alert('Función VER LISTA - En desarrollo');
  }
};

 const handleGenerarListas = () => {
    navigate("/listas");
  };

  return (
    <div className="management-container">
      <div className="csv-header">
        <h1 className="csv-title">Carga de Olimpistas</h1>
        <p className="csv-description">
          Sube un archivo CSV con los datos de los olimpistas. El archivo debe contener las siguientes columnas:
          Nombre, Apellidos, CI, Tutor legal, Contacto del tutor, Unidad educativa, Departamento, Grado, Área de competencia, Nivel, Tutor académico (opcional).
        </p>
      </div>

      <div className="carga-action-buttons">
        <button className="btn-primary" onClick={handleSelectCSV}>
          SELECCIONAR CSV
        </button>
        <button className="btn-secondary" onClick={handleVerLista}>
          VER LISTA
        </button>
        <button className="btn-secondary" onClick={handleGenerarListas}>
          GENERAR LISTAS POR ÁREA Y NIVEL
        </button>

        <input
          type="file"
          accept=".csv"
          ref={inputRef}
          className="csv-file-input-hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}

export default CargarCSV;
