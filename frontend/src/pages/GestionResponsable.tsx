// src/pages/GestionResponsables.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios'; // Necesitas importar axios
import { ResponsableTable } from '../components/responsables/ResponsableTable';
import { EditResponsableModal } from '../components/responsables/EditResponsableModa';
import type { Responsable } from '../interfaces/Responsable';

const GestionResponsables: React.FC = () => {
    // 1. ESTADOS
    const [responsables, setResponsables] = useState<Responsable[]>([]);
    const [filtro, setFiltro] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const API_BASE = 'http://localhost:8000/api'; // URL base de la API

    // 2. CONFIGURACIÓN AXIOS CON AUTH (REUTILIZADA DE COMPETIDORES)
    const api = useMemo(() => {
        const token = localStorage.getItem('authToken'); 
        
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`; 
        }

        return axios.create({
            baseURL: API_BASE,
            headers: headers, 
        });
    }, []); 

// 3. FUNCIÓN DE CARGA DE DATOS
const fetchResponsables = useCallback(async () => {
    try {
        setLoading(true);
        setError('');
        
        console.log('Cargando responsables...');
        // RUTA DE TU API PARA LISTAR RESPONSABLES
        const response = await api.get('/responsable'); 
        
        /// Mapeo de datos (simplificado para coincidir con la nueva interfaz y tabla)
        const responsablesMapeados: Responsable[] = response.data.data.map((resp: Responsable) => ({
            id_usuario: resp.id_usuario,
            nombre: resp.nombre || '',      // Nombre de pila
            apellidos: resp.apellidos || '', // Apellidos
            ci: resp.ci || '',              // Cédula de Identidad
            email: resp.email || '',
            telefono: resp.telefono || null,
            area: resp.area || '',
            id_rol: resp.id_rol,
        }));
        
        console.log('Responsables cargados:', responsablesMapeados.length);
        setResponsables(responsablesMapeados);
        
    } catch (e: unknown) {
       console.error('Error fetching responsables:', e);
        let errorMessage = 'No se pudo conectar con el servidor o no tienes permisos.';
        
        if (axios.isAxiosError(e)) { // Verificamos si es un error de Axios
            // Accedemos a los datos de la respuesta del error
            errorMessage = e.response?.data?.message || e.message || errorMessage;
        } else if (e instanceof Error) { // Si es una instancia de Error JS estándar
            errorMessage = e.message;
        }
        // Si no es un error de Axios ni una instancia de Error, usamos el mensaje por defecto.
        
        setError(errorMessage);

    } finally {
        setLoading(false);
    }
}, [api]);


// 4. EJECUTAR LA CARGA AL MONTAR
useEffect(() => {
    fetchResponsables();
}, [fetchResponsables]);

    // 5. MANEJADORES DE ACCIONES (Actualizados para usar el estado)
    
    // Función de edición (usaremos el ID del responsable)
    const handleEditResponsable = async (editedResponsable: Responsable) => {
        // Implementación futura: Petición PUT
        console.log('Guardando edición de responsable:', editedResponsable);
        alert('Función de editar implementada en consola');
    };

    // Función de eliminación (usaremos el ID del responsable)
    const handleDeleteResponsable = async (id: number) => {
        // Implementación futura: Petición DELETE
        if (!window.confirm(`¿Estás seguro de que deseas eliminar al responsable ID ${id}?`)) {
            return;
        }
        console.log('Eliminar responsable ID:', id);
        alert('Función de eliminar implementada en consola');
    };

    // Función de creación
    const handleCreateResponsable = async (newResponsable: Responsable) => {
        // Implementación futura: Petición POST
        console.log('Crear responsable:', newResponsable);
        alert('Función de crear implementada en consola');
        setIsCreateModalOpen(false);
    };

    const responsablesFiltrados = responsables.filter(resp =>
    resp.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    resp.apellidos.toLowerCase().includes(filtro.toLowerCase()) ||
    resp.ci.includes(filtro) || // Usamos 'ci'
    resp.email.toLowerCase().includes(filtro.toLowerCase()) ||
    resp.area.toLowerCase().includes(filtro.toLowerCase()) 
);

    // 6. RENDERIZADO CONDICIONAL DE CARGA/ERROR
    if (loading) {
        return (
            <div className="gestion-competidores-page">
                <div className="management-container">
                    <div className="flex justify-center items-center p-8">
                        <div className="text-lg">Cargando responsables...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="gestion-competidores-page">
                <div className="management-container">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        <strong>Error:</strong> {error}
                        <br />
                        <button 
                            onClick={fetchResponsables}
                            className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                        >
                            Reintentar
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    // 7. RENDERIZADO PRINCIPAL
    return (
        <div className="gestion-competidores-page">
          <div className="management-container">
                <div className="search-section">
                    <div className="search-container">
                        <div className="search-input-wrapper">
                            <input
                                type="text"
                                placeholder="Buscar responsable..."
                                className="search-input"
                                value={filtro}
                                onChange={(e) => setFiltro(e.target.value)}
                            />
                            <div className="search-icon">
                                <svg className="search-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="primary-button"
                    >
                        <svg className="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Nuevo Responsable</span>
                    </button>
                </div>

                <ResponsableTable 
                    responsables={responsablesFiltrados}
                    onEdit={handleEditResponsable}
                    onDelete={handleDeleteResponsable}
                />
            </div>

            {responsablesFiltrados.length > 0 && (
                <div className="pagination-section">
                    <span className="pagination-info">
                        Mostrando {responsablesFiltrados.length} de {responsables.length} responsables
                    </span>
                </div>
            )}

            {/* Modal para crear nuevo responsable (o editar, si se usa para ambos) */}
            <EditResponsableModal
                responsable={null} // null para el modo creación
                onSave={handleCreateResponsable}
                onCancel={() => setIsCreateModalOpen(false)}
                isOpen={isCreateModalOpen}
            />
        </div>
    );
};

export default GestionResponsables;