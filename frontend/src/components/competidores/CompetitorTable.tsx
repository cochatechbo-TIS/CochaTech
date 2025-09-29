// src/components/competidores/CompetitorTable.tsx
import { useState } from 'react';
import { PencilIcon, TrashIcon } from 'lucide-react';
import type { Competidor } from '../../interfaces/Competidor';
import { EditCompetitorModal } from './EditCompetitorModal'; // Importar el modal

interface CompetitorTableProps {
  competitors: Competidor[];
  onEdit: (competitor: Competidor) => void;
  onDelete: (id: number) => void;
}

export function CompetitorTable({ competitors, onEdit, onDelete }: CompetitorTableProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentCompetitor, setCurrentCompetitor] = useState<Competidor | null>(null);

  const handleEditClick = (competitor: Competidor) => {
    setCurrentCompetitor(competitor);
    setIsEditModalOpen(true);
  };

  const handleEditSave = (editedCompetitor: Competidor) => {
    onEdit(editedCompetitor);
    setIsEditModalOpen(false);
    setCurrentCompetitor(null);
  };

  const handleEditCancel = () => {
    setIsEditModalOpen(false);
    setCurrentCompetitor(null);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este competidor?')) {
      onDelete(id);
    }
  };

  return (
    <>
      {/* Vista desktop - TABLA COMPLETA */}
      <div className="competitor-table-container">
        <table className="competitor-table">
          <thead className="competitor-table-header">
            <tr>
              <th className="competitor-table-th">NOMBRE</th>
              <th className="competitor-table-th">DOCUMENTO</th>
              <th className="competitor-table-th">INSTITUCIÓN</th>
              <th className="competitor-table-th">ÁREA</th>
              <th className="competitor-table-th">NIVEL</th>
              <th className="competitor-table-th">GRADO</th>
              <th className="competitor-table-th">CONTACTO TUTOR</th>
              <th className="competitor-table-th">DEPARTAMENTO</th>
              <th className="competitor-table-th">ACCIONES</th>
            </tr>
          </thead>
          <tbody className="competitor-table-body">
            {competitors.map((competitor) => (
              <tr key={competitor.id} className="competitor-table-row">
                <td className="competitor-table-td competitor-table-td-name">{competitor.nombre}</td>
                <td className="competitor-table-td">{competitor.documento}</td>
                <td className="competitor-table-td">{competitor.institucion}</td>
                <td className="competitor-table-td">{competitor.area}</td>
                <td className="competitor-table-td">{competitor.nivel}</td>
                <td className="competitor-table-td">{competitor.gradoEscolaridad}</td>
                <td className="competitor-table-td">{competitor.contactoTutor}</td>
                <td className="competitor-table-td">{competitor.departamento}</td>
                <td className="competitor-table-td">
                  <div className="competitor-table-actions">
                    <button 
                      className="competitor-table-btn competitor-table-btn-edit" 
                      title="Editar"
                      onClick={() => handleEditClick(competitor)}
                    >
                      <PencilIcon size={16} />
                    </button>
                    <button 
                      className="competitor-table-btn competitor-table-btn-delete" 
                      title="Eliminar"
                      onClick={() => handleDelete(competitor.id)}
                    >
                      <TrashIcon size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal separado */}
      {currentCompetitor && (
        <EditCompetitorModal
          competitor={currentCompetitor}
          onSave={handleEditSave}
          onCancel={handleEditCancel}
          isOpen={isEditModalOpen}
        />
      )}
    </>
  );
}