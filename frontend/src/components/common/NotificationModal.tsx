// src/components/common/NotificationModal.tsx

import React, { useEffect } from 'react';
import './ModalStyle.css';
import { CircleCheckBig, CircleX, CircleAlert, AlertTriangle } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info' | 'confirm';

interface NotificationModalProps {
  isVisible: boolean;
  message: string;
  type: NotificationType;
  title?: string;
  onClose: () => void; // Para cerrar el Toast o el Modal simple
  onConfirm?: () => void; // Solo para el Modal de Confirmación
}

const typeMap = {
  success: { Icon: CircleCheckBig, title: 'Éxito', className: 'toast-success', isToast: true },
  error: { Icon: CircleX, title: 'Error', className: 'toast-error', isToast: true },
  info: { Icon: CircleAlert, title: 'Información', className: 'toast-info', isToast: true },
  confirm: { Icon: AlertTriangle, title: 'Confirmar', className: 'modal-error', isToast: false },
};

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isVisible,
  message,
  type,
  title,
  onClose,
  onConfirm,
}) => {
  const DURATION = 9000; // 9 segundos para Toast

  const { Icon, title: defaultTitle, className, isToast } = typeMap[type];
  const modalTitle = title || defaultTitle;

  // Lógica para que el Toast se cierre automáticamente
  useEffect(() => {
    if (isVisible && isToast) {
      const timer = setTimeout(() => {
        onClose();
      }, DURATION);
      return () => clearTimeout(timer);
    }
  }, [isVisible, isToast, onClose]);

  if (!isVisible) return null;

  // Estilos de contenedores
  const containerClass = isToast ? 'toast-container' : 'custom-modal-backdrop visible';
  const contentClass = isToast ? `toast ${className} show` : `custom-modal-content ${className}`;

  // --- Renderizado del contenido ---

  if (isToast) {
    // Escenario 1: TOAST (rectángulo superior que desaparece)
    return (
      <div className={containerClass}>
        <div className={contentClass}>
          <div className="toast-message">{message}</div>
          <div className="toast-icon">
            <Icon size={24} strokeWidth={2} />
          </div>
        </div>
      </div>
    );
  }

  // Escenario 2: MODAL (centrado que requiere acción)
  return (
    <div className={containerClass}>
      <div className={contentClass}>
        
        <div className="modal-header">
          <h3 className="modal-title">{modalTitle}</h3>
        </div>
        
        <p className="modal-message">{message}</p>

        {/* Botones de Confirmación/Aceptar */}
        <div className="modal-actions">
          {type === 'confirm' ? (
            <>
              <button onClick={onClose} className="modal-btn modal-btn-secondary">
                Cancelar
              </button>
              <button onClick={onConfirm} className="modal-btn modal-btn-primary">
                Sí, Confirmar
              </button>
            </>
          ) : (
            <button onClick={onClose} className="modal-btn modal-accept-btn">
                Aceptar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};