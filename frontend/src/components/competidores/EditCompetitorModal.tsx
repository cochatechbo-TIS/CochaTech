// src/components/competidores/EditCompetitorModal.tsx
import React, { useState } from 'react';
import { XIcon } from 'lucide-react';
import type { Competidor } from '../../interfaces/Competidor';

interface EditCompetitorModalProps {
  competitor: Competidor;
  onSave: (competitor: Competidor) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export function EditCompetitorModal({ 
  competitor, 
  onSave, 
  onCancel, 
  isOpen 
}: EditCompetitorModalProps) {
  const [editedCompetitor, setEditedCompetitor] = useState<Competidor>({ ...competitor });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedCompetitor({ ...editedCompetitor, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedCompetitor);
  };

  // Reset form when competitor changes
  React.useEffect(() => {
    setEditedCompetitor({ ...competitor });
  }, [competitor]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3 className="modal-title">Editar Competidor</h3>
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
                Nombre Completo
              </label>
              <input
                type="text"
                name="nombre"
                value={editedCompetitor.nombre}
                onChange={handleChange}
                className="modal-input"
                required
              />
            </div>
            
            <div className="modal-form-group">
              <label className="modal-label">
                Documento
              </label>
              <input
                type="text"
                name="documento"
                value={editedCompetitor.documento}
                onChange={handleChange}
                className="modal-input"
                required
              />
            </div>
            
            <div className="modal-form-group">
              <label className="modal-label">
                Institución
              </label>
              <input
                type="text"
                name="institucion"
                value={editedCompetitor.institucion}
                onChange={handleChange}
                className="modal-input"
                required
              />
            </div>
            
            <div className="modal-form-group">
              <label className="modal-label">
                Área
              </label>
              <select
                name="area"
                value={editedCompetitor.area}
                onChange={handleChange}
                className="modal-input"
                required
              >
                <option value="Matemáticas">Matemáticas</option>
                <option value="Física">Física</option>
                <option value="Química">Química</option>
                <option value="Biología">Biología</option>
                <option value="Astronomía">Astronomía</option>
                <option value="Geografía">Geografía</option>
              </select>
            </div>
            
            <div className="modal-form-group">
              <label className="modal-label">
                Nivel
              </label>
              <select
                name="nivel"
                value={editedCompetitor.nivel}
                onChange={handleChange}
                className="modal-input"
                required
              >
                <option value="Nivel 1">Nivel 1</option>
                <option value="Nivel 2">Nivel 2</option>
                <option value="Nivel 3">Nivel 3</option>
              </select>
            </div>
            
            <div className="modal-form-group">
              <label className="modal-label">
                Grado Escolaridad
              </label>
              <select
                name="gradoEscolaridad"
                value={editedCompetitor.gradoEscolaridad}
                onChange={handleChange}
                className="modal-input"
              >
                <option value="Primaria">Primaria</option>
                <option value="Secundaria">Secundaria</option>
                <option value="Bachillerato">Bachillerato</option>
              </select>
            </div>
            
            <div className="modal-form-group">
              <label className="modal-label">
                Contacto Tutor
              </label>
              <input
                type="tel"
                name="contactoTutor"
                value={editedCompetitor.contactoTutor}
                onChange={handleChange}
                className="modal-input"
              />
            </div>
            
            <div className="modal-form-group">
              <label className="modal-label">
                Departamento
              </label>
              <select
                name="departamento"
                value={editedCompetitor.departamento}
                onChange={handleChange}
                className="modal-input"
                required
              >
                <option value="La Paz">La Paz</option>
                <option value="Cochabamba">Cochabamba</option>
                <option value="Santa Cruz">Santa Cruz</option>
                <option value="Oruro">Oruro</option>
                <option value="Potosí">Potosí</option>
                <option value="Tarija">Tarija</option>
                <option value="Chuquisaca">Chuquisaca</option>
                <option value="Beni">Beni</option>
                <option value="Pando">Pando</option>
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
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}