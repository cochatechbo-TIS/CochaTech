// src/components/carga-masiva/CargarCSV.tsx
import React, { useRef, useState } from 'react';
import './CargarCSV.css';


function CargarCSV() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

//arrastrar o soltar un archivo desde una carpeta
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const fileObj = e.dataTransfer.files[0];
    if (fileObj && fileObj.name.endsWith('.csv')) {
      setFileName(fileObj.name);
      setFile(fileObj);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileObj = e.target.files?.[0];
    if (fileObj && fileObj.name.endsWith('.csv')) {
      setFileName(fileObj.name);
      setFile(fileObj);
    }
  };

//actuva el imput oculto
  const handleUploadClick = () => {
    inputRef.current?.click();
  };

  const handleSubmit = () => {
    alert('¡Archivo cargado! (simulación)');
    setFile(null);
    setFileName(null);
  };

  return (
    <div className="min-h-[70vh] flex flex-col justify-center items-center bg-transparent">
      <h1 className="text-3xl font-bold text-gray-900 mb-4 pt-4">Carga Masiva de Inscritos</h1>
      <p className="text-gray-600">Administrar la carga de un CSV de inscritos</p>
      <div className="cargar-csv-card">
        
        
        <div className="bg-white rounded-xl shadow px-6 py-8 min-h-[300px] flex flex-col justify-between">
          {/* Título de sección */}
          <label className="block text-lg mb-3 font-medium text-gray-800">
            Subir archivo CSV
          </label>
          {/* Área de dropzone horizontal y centrada */}
          <div
            className="flex flex-col justify-center items-center h-56 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer transition hover:border-blue-500"
            onClick={handleUploadClick}
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
          >
            <input
              type="file"
              accept=".csv"
              ref={inputRef}
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="text-5xl text-gray-400 mb-4">&#8682;</div>
            {fileName ? (
              <span className="text-blue-700 mt-2">{fileName}</span>
            ) : (
              <>
                <span className="text-gray-700 text-center">Haz clic para seleccionar un archivo CSV</span>
                <span className="text-gray-500 text-sm text-center"> o arrastra y suelta aquí</span>
              </>
            )}
          </div>
          {/* Botón alineado a la derecha */}
          <div className="flex flex-row-reverse mt-8">
            <button
                
             // className="cargar-csv-btn"
              disabled={!file}
              onClick={handleSubmit}
            >
              Cargar Datos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CargarCSV;

