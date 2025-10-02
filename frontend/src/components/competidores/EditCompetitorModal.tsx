// src/components/competidores/EditCompetitorModal.tsx
import React, { useState } from 'react';
import { XIcon } from 'lucide-react';
import type { Competidor } from '../../interfaces/Competidor';

// Mover los mapeos fuera del componente (constantes fijas)
const departamentosMap = {
  'La Paz': 1,
  'Cochabamba': 2, 
  'Santa Cruz': 3,
  'Oruro': 4,
  'Potosí': 5,
  'Tarija': 6,
  'Chuquisaca': 7,
  'Beni': 8,
  'Pando': 9
};

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
    
    const idDepartamento = departamentosMap[editedCompetitor.departamentoNombre as keyof typeof departamentosMap];
    
    const competitorParaGuardar: Competidor = {
      ...editedCompetitor,
      ci: editedCompetitor.documento || editedCompetitor.ci,
      grado: editedCompetitor.gradoEscolaridad || editedCompetitor.grado,
      contacto_tutor: editedCompetitor.contactoTutor || editedCompetitor.contacto_tutor,
      id_departamento: idDepartamento
    };
    
    onSave(competitorParaGuardar);
  };

  // Ahora el useEffect solo depende de 'competitor'
  React.useEffect(() => {
    setEditedCompetitor({ 
      ...competitor,
      documento: competitor.ci,
      gradoEscolaridad: competitor.grado,
      contactoTutor: competitor.contacto_tutor,
      departamentoNombre: competitor.departamento?.nombre_departamento || ''
  });
  }, [competitor]); // Solo 'competitor' en las dependencias

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
                Nombre Completo *
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
                Documento (CI) *
              </label>
              <input
                type="text"
                name="documento"
                value={editedCompetitor.documento || editedCompetitor.ci}
                onChange={handleChange}
                className="modal-input"
                required
              />
            </div>
            
            <div className="modal-form-group">
              <label className="modal-label">
                Institución *
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
                Área *
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
                Nivel *
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
                value={editedCompetitor.gradoEscolaridad || editedCompetitor.grado}
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
                value={editedCompetitor.contactoTutor || editedCompetitor.contacto_tutor}
                onChange={handleChange}
                className="modal-input"
              />
            </div>
            
            <div className="modal-form-group">
              <label className="modal-label">
                Departamento *
              </label>
              <select
                name="departamentoNombre"
                value={editedCompetitor.departamentoNombre || ''}
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