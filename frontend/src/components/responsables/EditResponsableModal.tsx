// src/components/responsables/EditResponsableModal.tsx
import React, { useState, useEffect } from 'react';
import { XIcon } from 'lucide-react';
// CORRECCIÓN: Importa el tipo específico 'Responsable'
import type { Responsable } from '../../types/User.types';

interface EditResponsableModalProps {
  // CORRECCIÓN: Usa el tipo 'Responsable' y renombra la prop
  responsable: Responsable | null; // Null indica modo creación
  // CORRECCIÓN: Ajusta el tipo de onSave para aceptar datos de creación
  onSave: (data: Responsable | Omit<Responsable, 'id_usuario' | 'id_rol'>) => void;
  onCancel: () => void;
  isOpen: boolean;
}

// Mueve las áreas a una constante fuera si no cambian
const areasDisponibles = [
  'Matemáticas', 'Física', 'Química', 'Biología',
  'Astronomía', 'Geografía', 'Informática'
];

// Estado inicial para el modo creación
const initialState: Omit<Responsable, 'id_usuario' | 'id_rol'> = {
  nombre: '',
  apellidos: '',
  ci: '',
  email: '',
  telefono: null,
  area: '',
};

export function EditResponsableModal({
  responsable,
  onSave,
  onCancel,
  isOpen
}: EditResponsableModalProps) {

  // CORRECCIÓN: Usa el tipo 'Responsable' o el tipo parcial para el estado
  const [editedData, setEditedData] = useState<Responsable | Omit<Responsable, 'id_usuario' | 'id_rol'>>(
    responsable || initialState
  );

  // Sincronizar estado cuando 'responsable' (la prop) cambia
  useEffect(() => {
    setEditedData(responsable || initialState);
  }, [responsable, isOpen]); // Resetea también cuando se abre/cierra

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const finalValue = name === 'telefono' && value === '' ? null : value;
    setEditedData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validación simple opcional
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
            {/* CORRECCIÓN: Título dinámico */}
            {responsable ? 'Editar Responsable' : 'Nuevo Responsable'}
          </h3>
          <button onClick={onCancel} className="modal-close-btn" type="button">
            <XIcon size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body modal-form-grid"> {/* Simplificado */}
            {/* Nombre */}
            <div className="modal-form-group">
              <label className="modal-label">Nombre *</label>
              <input
                type="text"
                name="nombre"
                value={editedData.nombre}
                onChange={handleChange}
                className="modal-input"
                placeholder="Nombre de pila"
                required
              />
            </div>

            {/* Apellidos */}
            <div className="modal-form-group">
              <label className="modal-label">Apellidos *</label>
              <input
                type="text"
                name="apellidos"
                // CORRECCIÓN: Asegúrate que apellidos exista en el tipo
                value={editedData.apellidos || ''}
                onChange={handleChange}
                className="modal-input"
                placeholder="Apellidos"
                required
              />
            </div>

            {/* CI */}
            <div className="modal-form-group">
              <label className="modal-label">Documento (CI) *</label>
              <input
                type="text"
                name="ci"
                value={editedData.ci}
                onChange={handleChange}
                className="modal-input"
                placeholder="Número de documento"
                required
                // Opcional: Deshabilitar en modo edición si CI no se puede cambiar
                // disabled={!!responsable}
              />
            </div>

            {/* Email */}
            <div className="modal-form-group">
              <label className="modal-label">Email *</label>
              <input
                type="email"
                name="email"
                value={editedData.email}
                onChange={handleChange}
                className="modal-input"
                placeholder="correo@ejemplo.com"
                required
              />
            </div>

            {/* Teléfono */}
            <div className="modal-form-group">
              <label className="modal-label">Teléfono</label>
              <input
                type="tel"
                name="telefono"
                value={editedData.telefono || ''} // Muestra string vacío si es null
                onChange={handleChange}
                className="modal-input"
                placeholder="Ej: 71234567"
              />
            </div>

            {/* Área */}
            <div className="modal-form-group">
              <label className="modal-label">Área *</label>
              <select
                name="area"
                value={editedData.area}
                onChange={handleChange}
                className="modal-input" // Misma clase que input para consistencia
                required
              >
                <option value="">Seleccione un área</option>
                {/* CORRECCIÓN: Usa la constante definida arriba */}
                {areasDisponibles.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
          </div> {/* Fin modal-body */}

          <div className="modal-footer">
            <button type="button" onClick={onCancel} className="modal-btn modal-btn-cancel">
              Cancelar
            </button>
            <button type="submit" className="modal-btn modal-btn-primary">
              {/* CORRECCIÓN: Texto dinámico */}
              {responsable ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}