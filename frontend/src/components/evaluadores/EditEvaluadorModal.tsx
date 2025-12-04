// src/components/evaluaddres/EditEvaluadorModal.tsx
import React, { useState } from 'react';
import { XIcon } from 'lucide-react';
import type { Usuario } from '../../interfaces/Usuario';

interface EditEvaluadorModalProps {
    usuario: Usuario | null;
    onSave: (responsable: Usuario) => void;
    onCancel: () => void;
    isOpen: boolean;
}

const areas = [
    'Matemáticas',
    'Física', 
    'Química',
    'Biología',
    'Astronomía',
    'Geografía',
    'Informática'
];

export function EditEvaluadorModal({ 
    usuario, 
    onSave, 
    onCancel, 
    isOpen
}: EditEvaluadorModalProps) {

    const emptyForm: Usuario = {
        id_usuario: 0,
        nombre: "",
        apellidos: "",
        ci: "",
        email: "",
        telefono: null,
        area: "",
        id_rol: 3,      // Evaluador = 3
        documento: "",
    };
    
    // Inicialización del estado
    const [editedUsuario, setEditedUsuario] = useState<Usuario>(usuario || emptyForm);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Sincronizar estado cuando se abre el modal o cambia el responsable
    React.useEffect(() => {
        if (usuario) {
            setEditedUsuario(usuario);
        } else {
            setEditedUsuario(emptyForm);
        }
    }, [usuario]);

    const resetForm = () => {
        setEditedUsuario(emptyForm);
        setErrors({});
    };

    // ===================== VALIDACIONES =====================
    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!editedUsuario.nombre.trim()) {
            newErrors.nombre = "El nombre es obligatorio.";
        }

        if (!editedUsuario.apellidos.trim()) {
            newErrors.apellidos = "Los apellidos son obligatorios.";
        }

        if (!editedUsuario.ci.trim()) {
            newErrors.ci = "El CI es obligatorio.";
        } else if (
            editedUsuario.ci.length < 7 ||
            editedUsuario.ci.length > 8
        ) {
            newErrors.ci = "El CI debe tener entre 7 y 8 dígitos.";
        }

        if (!editedUsuario.email.trim()) {
            newErrors.email = "El email es obligatorio.";
        } else if (
            !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/.test(
                editedUsuario.email
            )
        ) {
            newErrors.email =
                "Formato de correo inválido. Ej: usuario@dominio.com";
        }

        if (editedUsuario.telefono && editedUsuario.telefono.length !== 8) {
            newErrors.telefono = "El teléfono debe tener exactamente 8 dígitos.";
        }

        if (!editedUsuario.area.trim()) {
            newErrors.area = "Debe seleccionar un área.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ===================== MANEJO DE INPUTS =====================
    const limits: Record<string, number> = {
        nombre: 50,
        apellidos: 50,
        email: 50,
    };

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
            else if (value.length < 7 || value.length > 8)
                newErrors.ci = "El CI debe tener entre 7 y 8 dígitos.";
            else delete newErrors.ci;
            break;

        case "email":
            if (!value.trim()) newErrors.email = "El email es obligatorio.";
            else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/.test(value))
                newErrors.email = "Formato de correo inválido. Ej: usuario@dominio.com";
            else delete newErrors.email;
            break;

        case "telefono":
            if (value && value.length !== 8)
                newErrors.telefono = "El teléfono debe tener exactamente 8 dígitos.";
            else delete newErrors.telefono;
            break;

        case "area":
            if (!value.trim()) newErrors.area = "Debe seleccionar un área.";
            else delete newErrors.area;
            break;
    }

    setErrors(newErrors);
};

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        // Bloquear EMOJIS
        let sanitized = value.replace(
            /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu,
            ""
        );

        // CI → SOLO números, máx 8
        if (name === "ci") {
            const numeric = sanitized.replace(/[^0-9]/g, "").slice(0, 8);
            setEditedUsuario((prev) => ({ ...prev, ci: numeric }));
            validateField("ci", numeric);
            return;
        }

        // Teléfono → SOLO números, máx 8
        if (name === "telefono") {
            const numeric = sanitized.replace(/[^0-9]/g, "").slice(0, 8);
            setEditedUsuario((prev) => ({
                ...prev,
                telefono: numeric === "" ? null : numeric,
            }));
            validateField("telefono", numeric);
            return;
        }

        // Nombre y Apellidos → Solo letras y espacios
        if (name === "nombre" || name === "apellidos") {
            sanitized = sanitized.replace(
                /[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g,
                ""
            );
        }

        // Limitar longitud (50)
        if (limits[name]) {
            sanitized = sanitized.slice(0, limits[name]);
        }

        setEditedUsuario(prev => ({ ...prev, [name]: sanitized }));
        validateField(name, sanitized);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            return; // No enviar al backend
            }
        onSave(editedUsuario);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h3 className="modal-title">
                        {usuario ? 'Editar Evaluador' : 'Nuevo Evaluador'}
                    </h3>
                    <button
                        onClick={() => {
                            resetForm();
                            onCancel();
                        }}
                        className="modal-close-btn"
                        type="button"
                    >
                        <XIcon size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} noValidate>
                    <div className="modal-form-grid">
                        <div className="modal-form-group">
                            <label className="modal-label">
                                Nombre *
                            </label>
                            <input
                                type="text"
                                name="nombre"
                                value={editedUsuario.nombre}
                                onChange={handleChange}
                                className={`modal-input ${errors.nombre ? "input-error" : ""}`}
                                placeholder="Ingrese nombre de pila"
                                required
                            />
                            {errors.nombre && (
                                <p className="input-error-message">{errors.nombre}</p>
                            )}
                        </div>

                        {/* AGREGADO: Campo Apellidos */}
                        <div className="modal-form-group">
                            <label className="modal-label">
                                Apellidos *
                            </label>
                            <input
                                type="text"
                                name="apellidos"
                                value={editedUsuario.apellidos}
                                onChange={handleChange}
                                className={`modal-input ${errors.apellidos ? "input-error" : ""}`}
                                placeholder="Ingrese apellidos"
                                required
                            />
                            {errors.apellidos && (
                                <p className="input-error-message">{errors.apellidos}</p>
                            )}
                        </div>
                        
                        <div className="modal-form-group">
                            <label className="modal-label">
                                Documento (CI) *
                            </label>
                            {/* CORREGIDO: Usamos name="ci" */}
                            <input
                                type="text"
                                name="ci" 
                                value={editedUsuario.ci}
                                onChange={handleChange}
                                className={`modal-input ${errors.ci ? "input-error" : ""}`}
                                placeholder="Número de documento"
                                required
                            />
                            {errors.ci && (
                                <p className="input-error-message">{errors.ci}</p>
                            )}
                        </div>
                        
                        <div className="modal-form-group">
                            <label className="modal-label">
                                Email *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={editedUsuario.email}
                                onChange={handleChange}
                                className={`modal-input ${errors.email ? "input-error" : ""}`}
                                placeholder="correo@ejemplo.com"
                                required
                            />
                            {errors.email && (
                                <p className="input-error-message">{errors.email}</p>
                            )}
                        </div>
                        
                        <div className="modal-form-group">
                            <label className="modal-label">
                                Teléfono
                            </label>
                            {/* Manejamos `telefono` que puede ser null */}
                            <input
                                type="tel"
                                name="telefono"
                                value={editedUsuario.telefono || ''}
                                onChange={handleChange}
                                className={`modal-input ${errors.telefono ? "input-error" : ""}`}
                                placeholder="Ej: 77788999"
                            />
                            {errors.telefono && (
                                <p className="input-error-message">{errors.telefono}</p>
                            )}
                        </div>
                        
                        <div className="modal-form-group">
                            <label className="modal-label">
                                Área *
                            </label>
                            <select
                                name="area"
                                value={editedUsuario.area}
                                onChange={handleChange}
                                className={`modal-input ${errors.area ? "input-error" : ""}`}
                                required
                            >
                                <option value="">Seleccione un área</option>
                                {areas.map(area => (
                                    <option key={area} value={area}>{area}</option>
                                ))}
                            </select>
                            {errors.area && (
                                <p className="input-error-message">{errors.area}</p>
                            )}
                        </div>
                        
                        {/* ELIMINADO: Se quita el campo Cargo */}
                    </div>
                    
                    <div className="modal-footer">
                        <button
                            type="button"
                            onClick={() => {
                                resetForm();
                                onCancel();
                            }}
                            className="modal-btn modal-btn-cancel"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="modal-btn modal-btn-primary"
                        >
                            {usuario ? 'Actualizar' : 'Crear'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}