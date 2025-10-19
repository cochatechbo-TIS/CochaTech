// src/components/evaluadores/EvaluadorTable.tsx
import { useState } from "react";
import { PencilIcon, TrashIcon, CheckCircleIcon, XCircleIcon } from "lucide-react";
// CORRECCIÓN: Importa el tipo específico 'Evaluador'
import type { Evaluador } from "../../types/User.types";
import { EditEvaluadorModal } from "./EditEvaluadorModal";

interface EvaluadorTableProps {
  // CORRECCIÓN: Usa el tipo 'Evaluador' y renombra prop
  usuarios: Evaluador[]; // Prop debería llamarse 'evaluadores'
  onEdit: (evaluador: Evaluador) => void;
  onDelete: (id_usuario: number) => void;
}

export function EvaluadorTable({
  usuarios: evaluadores, // Destructura y renombra
  onEdit,
  onDelete,
}: EvaluadorTableProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // CORRECCIÓN: Usa el tipo 'Evaluador'
  const [currentEvaluador, setCurrentEvaluador] =
    useState<Evaluador | null>(null);

  // CORRECCIÓN: Recibe 'Evaluador'
  const handleEditClick = (evaluador: Evaluador) => {
    setCurrentEvaluador(evaluador);
    setIsEditModalOpen(true);
  };

  // CORRECCIÓN: Recibe 'Evaluador'
  const handleEditSave = (editedEvaluador: Evaluador) => {
    onEdit(editedEvaluador);
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
            <tr>
              <th className="table-th">NOMBRE</th>
              <th className="table-th">APELLIDOS</th>
              <th className="table-th">CI</th>
              <th className="table-th">EMAIL</th>
              <th className="table-th">ÁREA</th>
              {/* AÑADIDO: Columnas de Evaluador */}
              <th className="table-th">NIVEL</th>
              <th className="table-th">DISPONIBLE</th>
              <th className="table-th">ACCIONES</th>
            </tr>
          </thead>

          <tbody className="table-body">
            {/* CORRECCIÓN: Itera sobre 'evaluadores' */}
            {evaluadores.map((evaluador) => (
              // CORRECCIÓN: Usa 'evaluador.id_usuario'
              <tr key={evaluador.id_usuario} className="table-row">
                <td className="table-td table-td-name">
                  {evaluador.nombre}
                </td>
                <td className="table-td">{evaluador.apellidos}</td>
                <td className="table-td">{evaluador.ci}</td>
                <td className="table-td">{evaluador.email}</td>
                <td className="table-td">{evaluador.area}</td>
                {/* AÑADIDO: Datos de Evaluador */}
                <td className="table-td">{evaluador.nivel || 'N/A'}</td>
                <td className="table-td text-center"> {/* Centrado para ícono */}
                  {evaluador.disponible ? (
                    <CheckCircleIcon size={18} className="text-green-500 inline-block" title="Sí" />
                  ) : (
                    <XCircleIcon size={18} className="text-red-500 inline-block" title="No" />
                  )}
                </td>
                <td className="table-td">
                  <div className="table-actions">
                    <button
                      className="table-btn table-btn-edit"
                      title="Editar"
                      // CORRECCIÓN: Pasa 'evaluador'
                      onClick={() => handleEditClick(evaluador)}
                    >
                      <PencilIcon size={16} />
                    </button>
                    <button
                      className="table-btn table-btn-delete"
                      title="Eliminar"
                      // CORRECCIÓN: Pasa 'evaluador.id_usuario'
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

      {/* Renderiza modal si hay evaluador actual */}
      {/* CORRECCIÓN: Pasa 'currentEvaluador' */}
      {currentEvaluador && (
        <EditEvaluadorModal
          // CORRECCIÓN: Prop renombrada a 'evaluador'
          evaluador={currentEvaluador}
          onSave={handleEditSave}
          onCancel={handleEditCancel}
          isOpen={isEditModalOpen}
        />
      )}
    </>
  );
}
