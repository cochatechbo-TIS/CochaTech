// src/components/evaluadores/EditEvaluadorModal.tsx
import React, { useState, useEffect } from 'react';
import { XIcon } from 'lucide-react';
// CORRECCIÓN: Importa el tipo específico 'Evaluador'
import type { Evaluador } from '../../types/User.types';

interface EditEvaluadorModalProps {
  // CORRECCIÓN: Usa tipo 'Evaluador' y renombra prop
  evaluador: Evaluador | null; // Null indica modo creación
  // CORRECCIÓN: Ajusta tipo de onSave
  onSave: (data: Evaluador | Omit<Evaluador, 'id_usuario' | 'id_rol'>) => void;
  onCancel: () => void;
  isOpen: boolean;
}

// Mueve listas a constantes fuera si no cambian
const areasDisponibles = [
  'Matemáticas', 'Física', 'Química', 'Biología',
  'Astronomía', 'Geografía', 'Informática'
];
// AÑADIDO: Lista de niveles (ajusta según tus datos reales)
const nivelesDisponibles = [
    '1ro Secundaria', '2do Secundaria', '3ro Secundaria', // ...etc
    'Alfa', 'Beta', 'Gamma' // O los nombres que uses
];


// Estado inicial para modo creación
const initialState: Omit<Evaluador, 'id_usuario' | 'id_rol'> = {
  nombre: '',
  apellidos: '',
  ci: '',
  email: '',
  telefono: null,
  area: '',
  nivel: null, // Campo de Evaluador
  id_nivel: null, // Campo de Evaluador
  disponible: true, // Campo de Evaluador (default a true)
};


export function EditEvaluadorModal({
  evaluador,
  onSave,
  onCancel,
  isOpen
}: EditEvaluadorModalProps) {

  // CORRECCIÓN: Usa el tipo 'Evaluador' o el tipo parcial
  const [editedData, setEditedData] = useState<Evaluador | Omit<Evaluador, 'id_usuario' | 'id_rol'>>(
    evaluador || initialState
  );

  // Sincronizar estado cuando 'evaluador' (la prop) cambia
  useEffect(() => {
    // Si estamos editando, usamos los datos del evaluador. Si creamos, usamos initialState.
    // Importante: Asegúrate que el objeto `evaluador` que viene de la tabla TENGA los campos `nivel` y `disponible`.
    setEditedData(evaluador ? { ...evaluador } : initialState);
  }, [evaluador, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    // Manejo especial para checkbox 'disponible'
    if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setEditedData(prev => ({ ...prev, [name]: checked }));
    } else {
        const finalValue = name === 'telefono' && value === '' ? null : value;
        // Si cambia el nombre del nivel, podrías necesitar buscar su ID aquí o en el onSave
        setEditedData(prev => ({ ...prev, [name]: finalValue }));
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validación simple opcional
    if (!editedData.nombre || !editedData.apellidos || !editedData.ci || !editedData.email || !editedData.area) {
        alert("Por favor complete todos los campos requeridos (*)");
        return;
    }
     // OJO: Si seleccionas nivel por NOMBRE, necesitas convertirlo a ID antes de enviar a `onSave` si el backend espera ID.
     // Ejemplo (necesitarías un mapa de nombre a ID): const nivelId = nivelNameToIdMap[editedData.nivel];
    onSave(editedData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container"> {/* Considera aumentar max-w-xl o max-w-2xl si hay muchos campos */}
        <div className="modal-header">
          <h3 className="modal-title">
            {/* CORRECCIÓN: Título dinámico */}
            {evaluador ? 'Editar Evaluador' : 'Nuevo Evaluador'}
          </h3>
          <button onClick={onCancel} className="modal-close-btn" type="button">
            <XIcon size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Usa grid-cols-1 md:grid-cols-2 para mejor layout en pantallas más grandes */}
          <div className="modal-body modal-form-grid md:grid-cols-2">
            {/* --- Columna 1 --- */}
            {/* Nombre */}
            <div className="modal-form-group">
              <label className="modal-label">Nombre *</label>
              <input type="text" name="nombre" value={editedData.nombre} onChange={handleChange} className="modal-input" required />
            </div>
            {/* Apellidos */}
            <div className="modal-form-group">
              <label className="modal-label">Apellidos *</label>
              <input type="text" name="apellidos" value={editedData.apellidos || ''} onChange={handleChange} className="modal-input" required />
            </div>
            {/* CI */}
            <div className="modal-form-group">
              <label className="modal-label">Documento (CI) *</label>
              <input type="text" name="ci" value={editedData.ci} onChange={handleChange} className="modal-input" required disabled={!!evaluador} />
            </div>
             {/* Teléfono */}
            <div className="modal-form-group">
              <label className="modal-label">Teléfono</label>
              <input type="tel" name="telefono" value={editedData.telefono || ''} onChange={handleChange} className="modal-input" placeholder="Ej: 71234567" />
            </div>

            {/* --- Columna 2 --- */}
             {/* Email */}
             <div className="modal-form-group">
              <label className="modal-label">Email *</label>
              <input type="email" name="email" value={editedData.email} onChange={handleChange} className="modal-input" required />
            </div>
            {/* Área */}
            <div className="modal-form-group">
              <label className="modal-label">Área *</label>
              <select name="area" value={editedData.area} onChange={handleChange} className="modal-input" required >
                <option value="">Seleccione un área</option>
                {areasDisponibles.map(area => (<option key={area} value={area}>{area}</option>))}
              </select>
            </div>
             {/* Nivel (Evaluador) */}
             <div className="modal-form-group">
              <label className="modal-label">Nivel (Opcional)</label>
              <select name="nivel" value={editedData.nivel || ''} onChange={handleChange} className="modal-input">
                <option value="">Seleccione un nivel</option>
                {/* AÑADIDO: Mapea los niveles disponibles */}
                {nivelesDisponibles.map(nivel => (<option key={nivel} value={nivel}>{nivel}</option>))}
              </select>
            </div>
             {/* Disponible (Evaluador) */}
             <div className="modal-form-group flex items-center mt-4 md:mt-6"> {/* Alineación vertical */}
                <input
                    type="checkbox"
                    name="disponible"
                    id="disponibleCheckbox" // ID para el label
                    // CORRECCIÓN: Asegúrate que 'disponible' exista en el tipo
                    checked={!!editedData.disponible} // Usa !! para convertir a boolean
                    onChange={handleChange}
                    className="modal-checkbox mr-2" // Clase para checkbox
                />
                <label htmlFor="disponibleCheckbox" className="modal-label mb-0"> {/* mb-0 para alinear */}
                    Disponible para evaluar
                </label>
            </div>

          </div> {/* Fin modal-body */}

          <div className="modal-footer">
            <button type="button" onClick={onCancel} className="modal-btn modal-btn-cancel">
              Cancelar
            </button>
            <button type="submit" className="modal-btn modal-btn-primary">
              {evaluador ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}