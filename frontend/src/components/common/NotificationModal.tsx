// src/components/common/NotificationModal.tsx

import React, { useEffect } from 'react';
import './ModalStyle.css';
import { CircleCheckBig, CircleX, CircleAlert, AlertTriangle, MessageSquareText } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info' | 'confirm' | 'input';

interface NotificationModalProps {
  isVisible: boolean;
  message: string;
  type: NotificationType;
  title?: string;
  onClose: () => void;
  onConfirm?: (value?: string) => void; // Acepta un valor opcional (para el input)
  isConfirmDisabled?: boolean;
}

// Mapa de configuración para cada tipo de notificación
const typeMap = {
  success: { Icon: CircleCheckBig, title: 'Éxito', className: 'toast-success', isToast: true },
  error: { Icon: CircleX, title: 'Error', className: 'toast-error', isToast: true },
  info: { Icon: CircleAlert, title: 'Información', className: 'toast-info', isToast: true },
  confirm: { Icon: AlertTriangle, title: 'Confirmar', className: 'modal-error', isToast: false },
  input: { Icon: MessageSquareText, title: 'Entrada Requerida', className: 'modal-info', isToast: false },
};

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isVisible,
  message,
  type,
  title,
  onClose,
  onConfirm,
  isConfirmDisabled = false, // Valor por defecto
}) => {
  const DURATION = 5000; // 5 segundos para Toast
  const [inputValue, setInputValue] = React.useState('');

  const { Icon, title: defaultTitle, className, isToast } = typeMap[type];
  const finalTitle = title || defaultTitle;

  // Lógica para que el Toast se cierre automáticamente
  useEffect(() => {
    if (isVisible && isToast) {
      const timer = setTimeout(() => {
        onClose();
      }, DURATION);
      return () => clearTimeout(timer);
    }
  }, [isVisible, isToast, onClose]);

  // Limpiar el input cuando el modal se hace visible
  useEffect(() => {
    if (isVisible && type === 'input') {
      setInputValue('');
    }
  }, [isVisible, type]);

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
          <h3 className="modal-title">{finalTitle}</h3>
        </div>
        
        <p className="modal-message">{message}</p>

        {/* Área de texto para el tipo 'input' */}
        {type === 'input' && (
          <div className="modal-input-container">
            <textarea
              className="modal-textarea"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Escriba aquí..."
              rows={4}
            />
          </div>
        )}

        {/* Botones de Confirmación/Aceptar */}
        <div className="modal-actions">
          {type === 'confirm' || type === 'input' ? (
            <>
              <button onClick={onClose} className="modal-btn modal-btn-secondary">
                Cancelar
              </button>
              <button 
                onClick={() => onConfirm?.(inputValue)}
                className={`modal-btn modal-btn-primary ${isConfirmDisabled ? 'modal-btn-disabled' : ''}`}
                disabled={isConfirmDisabled}
              >
                {type === 'confirm' ? 'Sí, Confirmar' : 'Rechazar lista'}
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