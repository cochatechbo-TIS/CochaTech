// src/components/evaluadores/EvaluadorTable.tsx
import { useState } from "react";
import { PencilIcon, TrashIcon } from "lucide-react";
import type { Evaluador } from "../../types/User.types";
import { EditEvaluadorModal } from "./EditEvaluadorModal";
type EvaluadorCreationData = Omit<Evaluador, 'id_usuario' | 'id_rol'>;
interface EvaluadorTableProps {
  usuarios: Evaluador[];
  onEdit: (evaluador: Evaluador) => void;
  onDelete: (id_usuario: number) => void;
}

export function EvaluadorTable({
  usuarios: evaluadores,
  onEdit,
  onDelete,
}: EvaluadorTableProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEvaluador, setCurrentEvaluador] =
    useState<Evaluador | null>(null);

  const handleEditClick = (evaluador: Evaluador) => {
    setCurrentEvaluador(evaluador);
    setIsEditModalOpen(true);
  };

  const handleEditSave = (data: Evaluador | EvaluadorCreationData) => {
    if ('id_usuario' in data) {
      onEdit(data); 
     } else {
      // Esto solo sucedería si intentáramos guardar un objeto de creación en modo edición, lo cual es seguro ignorar aquí.
      console.warn("Error de tipo: Se intentó pasar datos parciales a la edición.");
      return;
      }
     setIsEditModalOpen(false);
     setCurrentEvaluador(null);

  };

  const handleEditCancel = () => {
    setIsEditModalOpen(false);
    setCurrentEvaluador(null);
  };

  const handleDelete = (id_usuario: number) => {
    onDelete(id_usuario);
  };

  return (
    <>
      <div className="table-container">
        <table className="data-table">
          <thead className="table-header">
            {/* APLICADA CORRECCIÓN DE WHITESPACE (TR Y TH JUNTOS) */}
            <tr><th className="table-th">NOMBRE</th>
              <th className="table-th">APELLIDOS</th>
              <th className="table-th">CI</th>
              <th className="table-th">EMAIL</th>
              <th className="table-th">ÁREA</th>
              {/* <th className="table-th">NIVEL</th>      <-- ELIMINADO */}
              {/* <th className="table-th">DISPONIBLE</th> <-- ELIMINADO */}
              <th className="table-th">ACCIONES</th>
            </tr>
          </thead>

          <tbody className="table-body">
            {evaluadores.map((evaluador) => (
              <tr key={evaluador.id_usuario} className="table-row">
                <td className="table-td table-td-name">
                  {evaluador.nombre}
                </td>
                <td className="table-td">{evaluador.apellidos}</td>
                <td className="table-td">{evaluador.ci}</td>
                <td className="table-td">{evaluador.email}</td>
                <td className="table-td">{evaluador.area}</td>
                
                {/* Columna Nivel ELIMINADA */}
                {/* Columna Disponible ELIMINADA */}
                
                <td className="table-td">
                  <div className="table-actions">
                    <button
                      className="table-btn table-btn-edit"
                      title="Editar"
                      onClick={() => handleEditClick(evaluador)}
                    >
                      <PencilIcon size={16} />
                    </button>
                    <button
                      className="table-btn table-btn-delete"
                      title="Eliminar"
                      onClick={() => handleDelete(evaluador.id_usuario)}
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

      {currentEvaluador && (
        <EditEvaluadorModal
          evaluador={currentEvaluador}
          onSave={handleEditSave}
          onCancel={handleEditCancel}
          isOpen={isEditModalOpen}
        />
      )}
    </>
  );
}