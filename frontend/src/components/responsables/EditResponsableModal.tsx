// src/components/responsables/EditResponsableModal.tsx
import React, { useState } from 'react';
import { XIcon } from 'lucide-react';
import type { Usuario } from '../../interfaces/Usuario';

interface EditResponsableModalProps {
    usuario: Usuario | null;
    onSave: (usuario: Usuario) => void;
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
    isOpen
}: EditResponsableModalProps) {
    
    // Inicialización del estado
    const [editedResponsable, setEditedResponsable] = useState<Usuario>(
        usuario || emptyForm
    );
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Sincronizar estado cuando se abre el modal o cambia el responsable
    React.useEffect(() => {
        setEditedResponsable(usuario || emptyForm);
        }, [usuario]);

    const resetForm = () => {
        setEditedResponsable(emptyForm);
        setErrors({});
    };

// ========================= VALIDACIÓN GENERAL =========================
    const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!editedResponsable.nombre.trim()) {
        newErrors.nombre = "El nombre es obligatorio.";
    }

    if (!editedResponsable.apellidos.trim()) {
        newErrors.apellidos = "Los apellidos son obligatorios.";
    }

    if (!editedResponsable.ci.trim()) {
        newErrors.ci = "El CI es obligatorio.";
    } else if (editedResponsable.ci.length < 7 || editedResponsable.ci.length > 8) {
        newErrors.ci = "El CI debe tener entre 7 y 8 dígitos.";
    }

    if (!editedResponsable.email.trim()) {
        newErrors.email = "El email es obligatorio.";
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/.test(editedResponsable.email)) {
        newErrors.email = "Formato de correo inválido. Ej: usuario@dominio.com";
    }

    if (editedResponsable.telefono && editedResponsable.telefono.length !== 8) {
        newErrors.telefono = "El teléfono debe tener exactamente 8 dígitos.";
    }

    if (!editedResponsable.area.trim()) {
        newErrors.area = "Debe seleccionar un área.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
};

// ========================= VALIDACIÓN INDIVIDUAL =========================
    
// Validar un campo individual
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

// ========================= MANEJO DE INPUTS =========================
const limits: Record<string, number> = {
    nombre: 50,
    apellidos: 50,
    email: 50
};  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // 1. Quitar emojis
    let cleaned = value.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "");

    // 2. CI → solo números máx 8
    if (name === "ci") {
        cleaned = cleaned.replace(/[^0-9]/g, "").slice(0, 8);
        setEditedResponsable(prev => ({ ...prev, ci: cleaned }));
        validateField(name, cleaned);
        return;
    }

    // 3. Teléfono → solo números máx 8
    if (name === "telefono") {
        cleaned = cleaned.replace(/[^0-9]/g, "").slice(0, 8);
        setEditedResponsable(prev => ({
            ...prev,
            telefono: cleaned === "" ? null : cleaned
        }));
        validateField(name, cleaned);
        return;
    }

    // 4. Nombre y apellidos → solo letras + límite
    if (name === "nombre" || name === "apellidos") {
        cleaned = cleaned
            .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "") // solo letras
            .slice(0, limits[name]);                // límite
    }

    if (limits[name]) {
            cleaned = cleaned.slice(0, limits[name]);
        }

    // Guardar valor limpio
    setEditedResponsable(prev => ({ ...prev, [name]: cleaned }));

    // Validar en tiempo real!!
    validateField(name, cleaned);
};

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
  if (!validate()) {
        return; // No enviar al backend
    }
    onSave(editedResponsable);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h3 className="modal-title">
                        {usuario ? 'Editar Responsable' : 'Nuevo Responsable'}
                    </h3>
                    <button
                        onClick={() => { resetForm(); onCancel(); }}
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
                                value={editedResponsable.nombre}
                                onChange={handleChange}
                                className={`modal-input ${errors.nombre ? 'input-error' : ''}`}
                                placeholder="Ingrese nombre de pila"
                                required
                            />
                            {errors.nombre && <p className="input-error-message">{errors.nombre}</p>}
                        </div>

                        {/* AGREGADO: Campo Apellidos */}
                        <div className="modal-form-group">
                            <label className="modal-label">
                                Apellidos *
                            </label>
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
                        
                        <div className="modal-form-group">
                            <label className="modal-label">
                                Documento (CI) *
                            </label>
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
                        
                        <div className="modal-form-group">
                            <label className="modal-label">
                                Email *
                            </label>
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
                        
                        <div className="modal-form-group">
                            <label className="modal-label">
                                Teléfono
                            </label>
                            {/* Manejamos `telefono` que puede ser null */}
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
                        
                        <div className="modal-form-group">
                            <label className="modal-label">
                                Área *
                            </label>
                            <select
                                name="area"
                                value={editedResponsable.area}
                                onChange={handleChange}
                                className={`modal-input ${errors.area ? 'input-error' : ''}`}
                                required
                            >
                                <option value="">Seleccione un área</option>
                                {areas.map(area => (
                                    <option key={area} value={area}>{area}</option>
                                ))}
                            </select>
                            {errors.area && <p className="input-error-message">{errors.area}</p>}
                        </div>
                        
                        {/* ELIMINADO: Se quita el campo Cargo */}
                    </div>
                    
                    <div className="modal-footer">
                        <button
                            type="button"
                            onClick={() => { resetForm(); onCancel(); }}
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