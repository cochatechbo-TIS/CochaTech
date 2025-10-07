// src/components/responsables/ResponsableTable.tsx
import { useState } from "react";
import { PencilIcon, TrashIcon } from "lucide-react";
import type { Responsable } from "../../interfaces/Responsable";
import { EditResponsableModal } from "./EditResponsableModa";

interface ResponsableTableProps {
  responsables: Responsable[];
  onEdit: (responsable: Responsable) => void;
  onDelete: (id: number) => void;
}

export function ResponsableTable({
  responsables,
  onEdit,
  onDelete,
}: ResponsableTableProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentResponsable, setCurrentResponsable] =
    useState<Responsable | null>(null);

  const handleEditClick = (responsable: Responsable) => {
    setCurrentResponsable(responsable);
    setIsEditModalOpen(true);
  };

  const handleEditSave = (editedResponsable: Responsable) => {
    onEdit(editedResponsable);
    setIsEditModalOpen(false);
    setCurrentResponsable(null);
  };

  const handleEditCancel = () => {
    setIsEditModalOpen(false);
    setCurrentResponsable(null);
  };

  const handleDelete = (id: number) => {
    onDelete(id);
  };

  return (
    <>
      <div className="competitor-table-container">
        <table className="competitor-table">
          <thead className="competitor-table-header">
            <tr>
              <th className="competitor-table-th">NOMBRE</th>
              <th className="competitor-table-th">APELLIDOS</th>
              <th className="competitor-table-th">CI</th>
              <th className="competitor-table-th">EMAIL</th>
              <th className="competitor-table-th">ÁREA</th>
              <th className="competitor-table-th">ACCIONES</th>
            </tr>
          </thead>

          <tbody className="competitor-table-body">
            {responsables.map((responsable) => (
              <tr key={responsable.id_usuario} className="competitor-table-row">
                <td className="competitor-table-td competitor-table-td-name">
                  {responsable.nombre}
                </td>
                <td className="competitor-table-td">
                  {responsable.apellidos}
                </td>
                <td className="competitor-table-td">{responsable.ci}</td>
                <td className="competitor-table-td">{responsable.email}</td>
                <td className="competitor-table-td">{responsable.area}</td>
                <td className="competitor-table-td">
                  <div className="competitor-table-actions">
                    <button
                      className="competitor-table-btn competitor-table-btn-edit"
                      title="Editar"
                      onClick={() => handleEditClick(responsable)}
                    >
                      <PencilIcon size={16} />
                    </button>
                    <button
                      className="competitor-table-btn competitor-table-btn-delete"
                      title="Eliminar"
                      onClick={() => handleDelete(responsable.id_usuario)}
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

      {currentResponsable && (
        <EditResponsableModal
          responsable={currentResponsable}
          onSave={handleEditSave}
          onCancel={handleEditCancel}
          isOpen={isEditModalOpen}
        />
      )}
    </>
  );
}
