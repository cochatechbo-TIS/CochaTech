// src/components/responsables/ResponsableTable.tsx
import { useState } from "react";
import { PencilIcon, TrashIcon } from "lucide-react";
import type { Usuario } from "../../interfaces/Usuario";
import { EditResponsableModal } from "./EditResponsableModal";

interface UsuarioTableProps {
  usuario: Usuario[];
  onEdit: (responsable: Usuario) => void;
  onDelete: (id: number) => void;
}

export function ResponsableTable({
  usuario,
  onEdit,
  onDelete,
}: UsuarioTableProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUsuario, setCurrentUsuario] =
    useState<Usuario | null>(null);

  const handleEditClick = (usuario: Usuario) => {
    setCurrentUsuario(usuario);
    setIsEditModalOpen(true);
  };

  const handleEditSave = (editedUsuario: Usuario) => {
    onEdit(editedUsuario);
    setIsEditModalOpen(false);
    setCurrentUsuario(null);
  };

  const handleEditCancel = () => {
    setIsEditModalOpen(false);
    setCurrentUsuario(null);
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
              <th className="competitor-table-th">TELÉFONO</th>
              <th className="competitor-table-th">ÁREA</th>
              <th className="competitor-table-th">ACCIONES</th>
            </tr>
          </thead>
          <tbody className="competitor-table-body">
            {usuario.map((usuario) => (
              <tr key={usuario.id_usuario} className="competitor-table-row">
                <td className="competitor-table-td competitor-table-td-name">
                  {usuario.nombre}
                </td>
                <td className="competitor-table-td">
                  {usuario.apellidos}
                </td>
                <td className="competitor-table-td">{usuario.ci}</td>
                <td className="competitor-table-td">{usuario.email}</td>
                <td className="competitor-table-td">{usuario.telefono || 'N/A'}</td>
                <td className="competitor-table-td">{usuario.area}</td>
                <td className="competitor-table-td">
                  <div className="competitor-table-actions">
                    <button
                      className="competitor-table-btn competitor-table-btn-edit"
                      title="Editar"
                      onClick={() => handleEditClick(usuario)}
                    >
                      <PencilIcon size={16} />
                    </button>
                    <button
                      className="competitor-table-btn competitor-table-btn-delete"
                      title="Eliminar"
                      onClick={() => handleDelete(usuario.id_usuario)}
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
      {currentUsuario && (
        <EditResponsableModal
          usuario={currentUsuario}
          onSave={handleEditSave}
          onCancel={handleEditCancel}
          isOpen={isEditModalOpen}
        />
      )}
    </>
  );
}