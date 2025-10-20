// src/components/evaluadores/EditEvaluadorModal.tsx
import React, { useState, useEffect } from 'react';
import { XIcon } from 'lucide-react';
import type { Evaluador } from '../../types/User.types';

interface EditEvaluadorModalProps {
  evaluador: Evaluador | null; // Null indica modo creación
  onSave: (data: Evaluador | Omit<Evaluador, 'id_usuario' | 'id_rol'>) => void;
  onCancel: () => void;
  isOpen: boolean;
}

const areasDisponibles = [
  'Matemáticas', 'Física', 'Química', 'Biología',
  'Astronomía', 'Geografía', 'Informática'
];
// Lista de niveles ELIMINADA

// Estado inicial para modo creación
const initialState: Omit<Evaluador, 'id_usuario' | 'id_rol'> = {
  nombre: '',
  apellidos: '',
  ci: '',
  email: '',
  telefono: null,
  area: '',
  // nivel: null,       <-- ELIMINADO
  // id_nivel: null,    <-- ELIMINADO
  // disponible: true,  <-- ELIMINADO
};


export function EditEvaluadorModal({
  evaluador,
  onSave,
  onCancel,
  isOpen
}: EditEvaluadorModalProps) {

  const [editedData, setEditedData] = useState<Evaluador | Omit<Evaluador, 'id_usuario' | 'id_rol'>>(
    evaluador || initialState
  );

  useEffect(() => {
    setEditedData(evaluador ? { ...evaluador } : initialState);
  }, [evaluador, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Manejo de checkbox ELIMINADO

    const finalValue = name === 'telefono' && value === '' ? null : value;
    setEditedData(prev => ({ ...prev, [name]: finalValue }));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedData.nombre || !editedData.apellidos || !editedData.ci || !editedData.email || !editedData.area) {
        alert("Por favor complete todos los campos requeridos (*)");
        return;
    }
    onSave(editedData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3 className="modal-title">
            {evaluador ? 'Editar Evaluador' : 'Nuevo Evaluador'}
          </h3>
          <button onClick={onCancel} className="modal-close-btn" type="button">
            <XIcon size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* APLICADO md:grid-cols-2 para mejor layout */}
          <div className="modal-body modal-form-grid md:grid-cols-2">
            
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
            
            {/* Campo Nivel ELIMINADO */}
            
            {/* Campo Disponible ELIMINADO */}

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