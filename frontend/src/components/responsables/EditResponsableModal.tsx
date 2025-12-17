// src/components/responsables/EditResponsableModal.tsx
import React, { useState, useEffect } from 'react';
import { XIcon } from 'lucide-react';
import type { Usuario } from '../../interfaces/Usuario';
import api from '../../services/api';
interface EditResponsableModalProps {
    usuario: Usuario | null;
    onSave: (usuario: Usuario) => void;
    onCancel: () => void;
    isOpen: boolean;
    backendError?: Record<string, string[]>;
    isSaving?: boolean;
}

// Form vacío estándar
const emptyForm: Usuario = {
    id_usuario: 0,
    nombre: "",
    apellidos: "",
    ci: "",
    email: "",
    telefono: null,
    area: "",
    id_rol: 2, // Responsable
    documento: "",
};

export function EditResponsableModal({ 
    usuario, 
    onSave, 
    onCancel, 
    isOpen,
    backendError,
    isSaving = false
}: EditResponsableModalProps) {
    const [areas, setAreas] = useState<{ id_area: number; nombre: string }[]>([]);
    const [editedResponsable, setEditedResponsable] = useState<Usuario>(emptyForm);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Sincronizar estado cuando se abre el modal o cambia el responsable
    useEffect(() => {
        if (!isOpen) return;
        setEditedResponsable(usuario ? { ...usuario } : { ...emptyForm });
        setErrors({});
    }, [isOpen, usuario]);

    useEffect(() => {
  if (!isOpen) return;

  const fetchAreas = async () => {
    try {
      const response = await api.get('/areas/nombres');
      setAreas(response.data);
    } catch (error) {
      console.error('Error al cargar áreas:', error);
    }
  };

  fetchAreas();
}, [isOpen]);

    // Mapear errores del backend a errores internos
    useEffect(() => {
        if (!backendError || Object.keys(backendError).length === 0) return;

        const mappedErrors: Record<string, string> = {};
        Object.keys(backendError).forEach((field) => {
            mappedErrors[field] = backendError[field][0];
        });

        setErrors(mappedErrors);
    }, [backendError]);

    const resetForm = () => {
        setEditedResponsable(emptyForm);
        setErrors({});
    };

    // ========================= VALIDACIÓN GENERAL =========================
    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!editedResponsable.nombre.trim()) newErrors.nombre = "El nombre es obligatorio.";
        if (!editedResponsable.apellidos.trim()) newErrors.apellidos = "Los apellidos son obligatorios.";
        if (!editedResponsable.ci.trim()) newErrors.ci = "El CI es obligatorio.";
        else if (editedResponsable.ci.length < 7 || editedResponsable.ci.length > 8) newErrors.ci = "El CI debe tener entre 7 y 8 dígitos.";
        if (!editedResponsable.email.trim()) newErrors.email = "El email es obligatorio.";
        else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/.test(editedResponsable.email)) newErrors.email = "Formato de correo inválido. Ej: usuario@dominio.com";
if (editedResponsable.telefono) {
        if (editedResponsable.telefono.length !== 8) {
            newErrors.telefono = "El teléfono debe tener exactamente 8 dígitos.";
        } else if (!editedResponsable.telefono.startsWith('6') && !editedResponsable.telefono.startsWith('7')) {
            newErrors.telefono = "El teléfono debe iniciar con 6 o 7.";
        }
    }        if (!editedResponsable.area.trim()) newErrors.area = "Debe seleccionar un área.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ========================= VALIDACIÓN INDIVIDUAL =========================
    const validateField = (name: string, value: string) => {
        const newErrors = { ...errors };
        switch (name) {
            case "nombre":
                if (!value.trim()) newErrors.nombre = "El nombre es obligatorio.";
                else delete newErrors.nombre;
                break;
            case "apellidos":
                if (!value.trim()) newErrors.apellidos = "Los apellidos son obligatorios.";
                else delete newErrors.apellidos;
                break;
            case "ci":
                if (!value.trim()) newErrors.ci = "El CI es obligatorio.";
                else if (value.length < 7 || value.length > 8) newErrors.ci = "El CI debe tener entre 7 y 8 dígitos.";
                else delete newErrors.ci;
                break;
            case "email":
                if (!value.trim()) newErrors.email = "El email es obligatorio.";
                else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/.test(value)) newErrors.email = "Formato de correo inválido. Ej: usuario@dominio.com";
                else delete newErrors.email;
                break;
            case "telefono":
            if (value) {
                if (value.length !== 8) {
                    newErrors.telefono = "El teléfono debe tener exactamente 8 dígitos.";
                } else if (!value.startsWith('6') && !value.startsWith('7')) {
                    newErrors.telefono = "El teléfono debe iniciar con 6 o 7.";
                } else {
                    delete newErrors.telefono;
                }
            } else {
                delete newErrors.telefono;
            }
            break;
            case "area":
                if (!value.trim()) newErrors.area = "Debe seleccionar un área.";
                else delete newErrors.area;
                break;
        }
        setErrors(newErrors);
    };

    // ========================= MANEJO DE INPUTS =========================
    const limits: Record<string, number> = { nombre: 50, apellidos: 50, email: 50 };
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let cleaned = value.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "");

        if (name === "ci") {
            cleaned = cleaned.replace(/[^0-9]/g, "").slice(0, 8);
            setEditedResponsable(prev => ({ ...prev, ci: cleaned }));
            validateField(name, cleaned);
            return;
        }
        if (name === "telefono") {
            cleaned = cleaned.replace(/[^0-9]/g, "").slice(0, 8);
            setEditedResponsable(prev => ({ ...prev, telefono: cleaned === "" ? null : cleaned }));
            validateField(name, cleaned);
            return;
        }
        if (name === "nombre" || name === "apellidos") {
            cleaned = cleaned.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "").slice(0, limits[name]);
        }
        if (limits[name]) cleaned = cleaned.slice(0, limits[name]);
        setEditedResponsable(prev => ({ ...prev, [name]: cleaned }));
        validateField(name, cleaned);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        onSave(editedResponsable);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h3 className="modal-title">{usuario ? 'Editar Responsable' : 'Nuevo Responsable'}</h3>
                    <button onClick={() => { resetForm(); onCancel(); }} className="modal-close-btn" type="button">
                        <XIcon size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="modal-form-grid">
                        {/** Nombre **/}
                        <div className="modal-form-group">
                            <label className="modal-label">Nombre *</label>
                            <input
                                type="text"
                                name="nombre"
                                value={editedResponsable.nombre}
                                onChange={handleChange}
                                className={`modal-input ${errors.nombre ? 'input-error' : ''}`}
                                placeholder="Ingrese nombre de pila"
                                required
                            />
                            {errors.nombre && <p className="input-error-message">{errors.nombre}</p>}
                        </div>

                        {/** Apellidos **/}
                        <div className="modal-form-group">
                            <label className="modal-label">Apellidos *</label>
                            <input
                                type="text"
                                name="apellidos"
                                value={editedResponsable.apellidos}
                                onChange={handleChange}
                                className={`modal-input ${errors.apellidos ? 'input-error' : ''}`}
                                placeholder="Ingrese apellidos"
                                required
                            />
                            {errors.apellidos && <p className="input-error-message">{errors.apellidos}</p>}
                        </div>

                        {/** CI **/}
                        <div className="modal-form-group">
                            <label className="modal-label">Documento (CI) *</label>
                            <input
                                type="text"
                                name="ci"
                                value={editedResponsable.ci}
                                onChange={handleChange}
                                className={`modal-input ${errors.ci ? 'input-error' : ''}`}
                                placeholder="Número de documento"
                                required
                            />
                            {errors.ci && <p className="input-error-message">{errors.ci}</p>}
                        </div>

                        {/** Email **/}
                        <div className="modal-form-group">
                            <label className="modal-label">Email *</label>
                            <input
                                type="email"
                                name="email"
                                value={editedResponsable.email}
                                onChange={handleChange}
                                className={`modal-input ${errors.email ? 'input-error' : ''}`}
                                placeholder="correo@ejemplo.com"
                                required
                            />
                            {errors.email && <p className="input-error-message">{errors.email}</p>}
                        </div>

                        {/** Teléfono **/}
                        <div className="modal-form-group">
                            <label className="modal-label">Teléfono</label>
                            <input
                                type="tel"
                                name="telefono"
                                value={editedResponsable.telefono || ''}
                                onChange={handleChange}
                                className={`modal-input ${errors.telefono ? 'input-error' : ''}`}
                                placeholder="Ej: 77788999"
                            />
                            {errors.telefono && <p className="input-error-message">{errors.telefono}</p>}
                        </div>

                        {/** Área **/}
                        <div className="modal-form-group">
                            <label className="modal-label">Área *</label>
                            <select
                                name="area"
                                value={editedResponsable.area}
                                onChange={handleChange}
                                className={`modal-input ${errors.area ? 'input-error' : ''}`}
                                required
                            >
                                <option value="">Seleccione un área</option>
                                {areas.map(area => <option key={area.id_area} value={area.nombre}>{area.nombre}</option>)}
                            </select>
                            {errors.area && <p className="input-error-message">{errors.area}</p>}
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" onClick={() => { resetForm(); onCancel(); }} className="modal-btn modal-btn-cancel">Cancelar</button>
                        <button type="submit" className="modal-btn modal-btn-primary" disabled={isSaving}>
                            {isSaving ? 'Guardando...' : (usuario ? 'Actualizar' : 'Crear')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}