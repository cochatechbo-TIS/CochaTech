
import { useState } from "react";
import { PencilIcon, TrashIcon } from "lucide-react";
import type { Responsable } from "../../types/User.types";
import { EditResponsableModal } from "./EditResponsableModal";
type ResponsableCreationData = Omit<Responsable, 'id_usuario' | 'id_rol'>;
interface ResponsableTableProps {
  usuarios: Responsable[];
  onEdit: (responsable: Responsable) => void;
  onDelete: (id_usuario: number) => void;
}

export function ResponsableTable({
  usuarios: responsables,
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

  const handleEditSave = (data: Responsable | ResponsableCreationData) => {
    if ('id_usuario' in data) {
      onEdit(data); // El onEdit de la tabla solo espera Responsable
    } else {
      // Aunque en teoría este modal solo se usa para editar, la prop onSave
      // debe aceptar el tipo más amplio. Si se intenta crear aquí, no hacemos nada.
      console.warn("Se intentó crear desde el modal de edición. Ignorando.");
      return;
    }
    setIsEditModalOpen(false);
    setCurrentResponsable(null);
  };

  const handleEditCancel = () => {
    setIsEditModalOpen(false);
    setCurrentResponsable(null);
  };

  const handleDelete = (id_usuario: number) => {
    onDelete(id_usuario);
  };

  return (
    <>
      <div className="table-container">
        <table className="data-table">
          <thead className="table-header">
            <tr>
              <th className="table-th">NOMBRE</th>
              <th className="table-th">APELLIDOS</th>
              <th className="table-th">CI</th>
              <th className="table-th">EMAIL</th>
              <th className="table-th">ÁREA</th>
              <th className="table-th">ACCIONES</th>
            </tr>
          </thead>

          <tbody className="table-body">
            {responsables.map((responsable) => (
              <tr key={responsable.id_usuario} className="table-row">
                <td className="table-td table-td-name">
                  {responsable.nombre}
                </td>
                <td className="table-td">
                  {responsable.apellidos}
                </td>
                <td className="table-td">{responsable.ci}</td>
                <td className="table-td">{responsable.email}</td>
                <td className="table-td">{responsable.area}</td>
                <td className="table-td">
                  <div className="table-actions">
                    <button
                      // CORRECCIÓN: Comentario JSX eliminado
                      className="table-btn table-btn-edit"
                      title="Editar"
                      onClick={() => handleEditClick(responsable)}
                    >
                      <PencilIcon size={16} />
                    </button>
                    <button
                      // CORRECCIÓN: Comentario JSX eliminado
                      className="table-btn table-btn-delete"
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