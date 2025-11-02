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

// Se eliminó la constante 'cargos'

export function EditEvaluadorModal({ 
    usuario, 
    onSave, 
    onCancel, 
    isOpen
}: EditEvaluadorModalProps) {
    
    // Inicialización del estado
    const [editedUsuario, setEditedUsuario] = useState<Usuario>(
        usuario || {
            id_usuario: 0, // Valor por defecto
            nombre: '',
            apellidos: '', // <-- Inicializado
            ci: '',        // <-- Usamos CI
            email: '',
            telefono: null, // Debe ser null para nulo
            area: '',
            id_rol: 2,     // Rol por defecto
            documento: '', // Alias para inicialización, usaremos 'ci' en la lógica
        }
    );

    // Sincronizar estado cuando se abre el modal o cambia el responsable
    React.useEffect(() => {
        if (usuario) {
            setEditedUsuario(usuario);
        } else {
            setEditedUsuario({
                id_usuario: 0,
                nombre: '',
                apellidos: '', // <-- Inicializado
                ci: '',        // <-- Usamos CI
                email: '',
                telefono: null,
                area: '',
                id_rol: 2,
                documento: '', // Alias
            });
        }
    }, [usuario]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        // Manejamos null para telefono si el campo se deja vacío
        const finalValue = name === 'telefono' && value === '' ? null : value;
        setEditedUsuario(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
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
                        onClick={onCancel}
                        className="modal-close-btn"
                        type="button"
                    >
                        <XIcon size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit}>
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
                                className="modal-input"
                                placeholder="Ingrese nombre de pila"
                                required
                            />
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
                                className="modal-input"
                                placeholder="Ingrese apellidos"
                                required
                            />
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
                                className="modal-input"
                                placeholder="Número de documento"
                                required
                            />
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
                                className="modal-input"
                                placeholder="correo@ejemplo.com"
                                required
                            />
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
                                className="modal-input"
                                placeholder="555-1234"
                            />
                        </div>
                        
                        <div className="modal-form-group">
                            <label className="modal-label">
                                Área *
                            </label>
                            <select
                                name="area"
                                value={editedUsuario.area}
                                onChange={handleChange}
                                className="modal-input"
                                required
                            >
                                <option value="">Seleccione un área</option>
                                {areas.map(area => (
                                    <option key={area} value={area}>{area}</option>
                                ))}
                            </select>
                        </div>
                        
                        {/* ELIMINADO: Se quita el campo Cargo */}
                    </div>
                    
                    <div className="modal-footer">
                        <button
                            type="button"
                            onClick={onCancel}
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