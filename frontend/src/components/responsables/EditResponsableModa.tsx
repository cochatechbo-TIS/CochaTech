// src/components/responsables/EditResponsableModal.tsx
import React, { useState } from 'react';
import { XIcon } from 'lucide-react';
import type { Responsable } from '../../interfaces/Responsable';

interface EditResponsableModalProps {
  responsable: Responsable | null;
  onSave: (responsable: Responsable) => void;
  onCancel: () => void;
  isOpen: boolean;
}

const areas = [
  'Matemáticas',
  'Física', 
  'Química',
  'Biología',
  'Astronomía',
  'Geografía',
  'Informática'
];

const cargos = [
  'Responsable de Área',
  'Coordinador General', 
  'Supervisor',
  'Jefe de Área'
];

export function EditResponsableModal({ 
  responsable, 
  onSave, 
  onCancel, 
  isOpen
}: EditResponsableModalProps) {
  const [editedResponsable, setEditedResponsable] = useState<Responsable>(
    responsable || {
      nombre: '',
      documento: '',
      email: '',
      telefono: '',
      area: '',
      cargo: ''
    }
  );

  React.useEffect(() => {
    if (responsable) {
      setEditedResponsable(responsable);
    } else {
      setEditedResponsable({
        nombre: '',
        documento: '',
        email: '',
        telefono: '',
        area: '',
        cargo: ''
      });
    }
  }, [responsable]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedResponsable(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedResponsable);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3 className="modal-title">
            {responsable ? 'Editar Responsable' : 'Nuevo Responsable'}
          </h3>
          <button
            onClick={onCancel}
            className="modal-close-btn"
            type="button"
          >
            <XIcon size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-form-grid">
            <div className="modal-form-group">
              <label className="modal-label">
                Nombre Completo *
              </label>
              <input
                type="text"
                name="nombre"
                value={editedResponsable.nombre}
                onChange={handleChange}
                className="modal-input"
                placeholder="Ingrese nombre completo"
                required
              />
            </div>
            
            <div className="modal-form-group">
              <label className="modal-label">
                Documento *
              </label>
              <input
                type="text"
                name="documento"
                value={editedResponsable.documento}
                onChange={handleChange}
                className="modal-input"
                placeholder="Número de documento"
                required
              />
            </div>
            
            <div className="modal-form-group">
              <label className="modal-label">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={editedResponsable.email}
                onChange={handleChange}
                className="modal-input"
                placeholder="correo@ejemplo.com"
                required
              />
            </div>
            
            <div className="modal-form-group">
              <label className="modal-label">
                Teléfono
              </label>
              <input
                type="tel"
                name="telefono"
                value={editedResponsable.telefono || ''}
                onChange={handleChange}
                className="modal-input"
                placeholder="555-1234"
              />
            </div>
            
            <div className="modal-form-group">
              <label className="modal-label">
                Área *
              </label>
              <select
                name="area"
                value={editedResponsable.area}
                onChange={handleChange}
                className="modal-input"
                required
              >
                <option value="">Seleccione un área</option>
                {areas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
            
            <div className="modal-form-group">
              <label className="modal-label">
                Cargo *
              </label>
              <select
                name="cargo"
                value={editedResponsable.cargo}
                onChange={handleChange}
                className="modal-input"
                required
              >
                <option value="">Seleccione un cargo</option>
                {cargos.map(cargo => (
                  <option key={cargo} value={cargo}>{cargo}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="modal-footer">
            <button
              type="button"
              onClick={onCancel}
              className="modal-btn modal-btn-cancel"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="modal-btn modal-btn-primary"
            >
              {responsable ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}