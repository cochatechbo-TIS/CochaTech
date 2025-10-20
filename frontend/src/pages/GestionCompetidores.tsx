// src/pages/GestionCompetidores.tsx
import React, { useState, useEffect, useCallback } from 'react';
// CORRECCIÓN: Importa el api centralizado
import api from '../services/api';
// Mantenido SOLO para 'isAxiosError'
import axios from 'axios';
import { CompetitorTable } from '../components/competidores/CompetitorTable';
import CargarCSV from '../components/CargaMasiva/CargarCSV';
// Asegúrate de que la ruta sea correcta y el archivo exista
import type { Competidor } from '../types/Competidor';

// Mapa de departamentos (inverso para mostrar nombres)
const departamentosMapReverse: { [key: number]: string } = {
  1: 'La Paz',
  2: 'Santa Cruz',
  3: 'Cochabamba',
  4: 'Oruro',
  5: 'Potosí',
  6: 'Chuquisaca',
  7: 'Tarija',
  8: 'Beni',
  9: 'Pando'
};

const GestionCompetidores: React.FC = () => {
  const [competidores, setCompetidores] = useState<Competidor[]>([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- ELIMINADO ---
  // Ya no necesitamos API_BASE ni el useMemo para crear 'api' localmente
  // --- FIN ELIMINADO ---

  const fetchCompetidores = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Cargando competidores...');

      // Usamos el 'api' importado directamente
      const response = await api.get('/olimpistas');

      // Mapeo de datos (Asegúrate que coincida con la respuesta real de tu API)
      const competidoresMapeados = response.data.data.map((olimpista: any): Competidor => ({
        id_olimpista: olimpista.id_olimpista,
        ci: olimpista.ci || '',
        nombre: olimpista.nombre || '',
        apellidos: olimpista.apellidos || '',
        institucion: olimpista.institucion || '',
        // El backend ahora envía los nombres directamente
        area: olimpista.area || '',
        nivel: olimpista.nivel || '',
        grado: olimpista.grado || '',
        contacto_tutor: olimpista.contacto_tutor || '',
        id_departamento: olimpista.id_departamento,
        // El backend ahora envía el nombre del departamento
        departamentoNombre: olimpista.departamento || '',
        // Opcional: Mantener el objeto departamento si el backend lo envía y lo necesitas
        departamento: olimpista.departamento ? {
             id_departamento: olimpista.id_departamento,
             nombre_departamento: olimpista.departamento
           } : undefined,
      }));

      console.log('Competidores cargados:', competidoresMapeados.length);
      setCompetidores(competidoresMapeados);

    } catch (err: unknown) {
      console.error('Error fetching competidores:', err);
      let errorMessage = 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.';

      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || err.message || errorMessage;
        // Error específico para token inválido o ausente
        if (err.response?.status === 401) {
            errorMessage = "Error de autorización. Intenta iniciar sesión de nuevo.";
            // Opcional: Podrías llamar a logout() aquí si tienes acceso al contexto
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
    // CORRECCIÓN: 'api' ya no es una dependencia porque viene del import
  }, []);

  useEffect(() => {
    fetchCompetidores();
  }, [fetchCompetidores]);

  const handleEditCompetitor = async (editedCompetitor: Competidor) => {
    const competidoresAnteriores = [...competidores];
    try {
      // Optimistic update (actualización local inmediata)
      const competidoresActualizados = competidores.map(comp =>
        comp.id_olimpista === editedCompetitor.id_olimpista // Usar ID primario para comparación
          ? {
              ...editedCompetitor,
              // Asegura que departamentoNombre se actualice si cambia id_departamento
              departamentoNombre: editedCompetitor.departamentoNombre ||
                                departamentosMapReverse[editedCompetitor.id_departamento] ||
                                ''
            }
          : comp
      );
      setCompetidores(competidoresActualizados);

      // Llamada a la API usando el 'api' importado
      // El backend espera el ID en la URL y los datos en el cuerpo
      await api.put(`/olimpistas/${editedCompetitor.id_olimpista}`, {
      ci: editedCompetitor.ci,
      nombre: editedCompetitor.nombre,
      apellidos: editedCompetitor.apellidos,
      institucion: editedCompetitor.institucion,
      area: editedCompetitor.area,   // ← se envía el nombre
      nivel: editedCompetitor.nivel, // ← se envía el nombre
      grado: editedCompetitor.grado,
      contacto_tutor: editedCompetitor.contacto_tutor,
      id_departamento: editedCompetitor.id_departamento,
    });

      // No es necesario volver a mapear si la API no devuelve datos actualizados
      alert('Competidor actualizado exitosamente');
      // Opcional: Volver a cargar los datos para asegurar consistencia
      // fetchCompetidores();

    } catch (err: unknown) {
      console.error('Error updating competitor:', err);
      // Revertir en caso de error
      setCompetidores(competidoresAnteriores);

      let errorMessage = 'Error al actualizar competidor';
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || err.response?.data?.errors?.ci?.[0] || errorMessage; // Mostrar error de validación de CI si existe
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      alert(errorMessage);
      // No re-lances el error si ya mostraste alerta
      // throw err;
    }
  };

  const handleDeleteCompetitor = async (ci: string) => { // Mantenemos CI como identificador para la UI
    const competidoresAnteriores = [...competidores];
    const competidorAEliminar = competidores.find(comp => comp.ci === ci);

    if (!competidorAEliminar || !competidorAEliminar.id_olimpista) {
      alert('Error: No se encontró el ID interno del competidor para eliminar.');
      console.error('Competidor no encontrado o le falta id_olimpista:', competidorAEliminar);
      return;
    }

    // Confirmación
    if (!window.confirm(`¿Estás seguro de que deseas eliminar a ${competidorAEliminar.nombre} ${competidorAEliminar.apellidos}?`)) {
        return;
    }

    try {
      // Optimistic update
      const competidoresActualizados = competidores.filter(comp =>
        comp.id_olimpista !== competidorAEliminar.id_olimpista
      );
      setCompetidores(competidoresActualizados);

      // Llamada a la API usando el 'api' importado y el ID primario
      await api.delete(`/olimpistas/${competidorAEliminar.id_olimpista}`);
      alert('Competidor eliminado exitosamente');

    } catch (err: unknown) {
      console.error('Error deleting competitor:', err);
      // Revertir en caso de error
      setCompetidores(competidoresAnteriores);

      let errorMessage = 'Error al eliminar competidor. El cambio fue revertido.';
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      alert(errorMessage);
      // No re-lances el error
      // throw err;
    }
  };

  // Funciones placeholder (mantenerlas o implementar)
  const handleVerLista = () => {};
  const handleGenerarListas = () => {
    alert('Función GENERAR LISTAS POR ÁREA Y NIVEL - En desarrollo');
  };

  // Filtrado (basado en los datos disponibles después del mapeo)
  const competidoresFiltrados = competidores.filter(comp =>
    comp.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    (comp.apellidos && comp.apellidos.toLowerCase().includes(filtro.toLowerCase())) ||
    comp.ci.includes(filtro) ||
    (comp.institucion && comp.institucion.toLowerCase().includes(filtro.toLowerCase())) ||
    (comp.area && comp.area.toLowerCase().includes(filtro.toLowerCase())) ||
    (comp.departamentoNombre && comp.departamentoNombre.toLowerCase().includes(filtro.toLowerCase()))
  );

  // --- Renderizado Condicional (Loading/Error) ---
  if (loading) {
    return (
      <div className="gestion-competidores-page">
        <div className="management-container">
          <div className="flex justify-center items-center p-8 text-lg">
            Cargando competidores...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gestion-competidores-page">
        <div className="management-container">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
            <button
              onClick={fetchCompetidores}
              className="mt-2 bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Renderizado Principal ---
  return (
    <div className="gestion-competidores-page">
      {/* Sección Carga CSV */}
      <div className="carga-section">
        <CargarCSV
          onVerLista={handleVerLista} // Podría recargar la lista: onVerLista={fetchCompetidores}
          onGenerarListas={handleGenerarListas}
          // Pasar callback para recargar lista después de importar exitosamente
          onImportSuccess={fetchCompetidores}
        />
      </div>

      {/* Sección Gestión (Búsqueda y Tabla) */}
      <div className="management-container">
        {/* Barra de Búsqueda */}
        <div className="search-section">
          <div className="search-container">
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="Buscar (Nombre, CI, Institución, Área, Depto)..."
                className="search-input"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
              <div className="search-icon">
                 {/* SVG Icon */}
                 <svg className="search-svg h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                 </svg>
              </div>
            </div>
          </div>
          {/* Podrías añadir un botón de "Nuevo Competidor" aquí si lo necesitas */}
        </div>

        {/* Tabla de Competidores */}
        <CompetitorTable
          competitors={competidoresFiltrados}
          onEdit={handleEditCompetitor}
          // onDelete ahora recibe el CI, como espera la tabla
          onDelete={handleDeleteCompetitor}
        />
      </div>

      {/* Paginación (si hay competidores) */}
      {competidores.length > 0 && ( // Mostrar incluso si filtrados es 0
        <div className="pagination-section">
          <span className="pagination-info">
            {/* Información más clara */}
            Mostrando {competidoresFiltrados.length} de {competidores.length} competidores totales.
          </span>
          {/* Controles de paginación (si los implementas) */}
          {/* <div className="pagination-controls"> ... </div> */}
        </div>
      )}

      {/* Si no hay competidores (después de cargar) */}
       {!loading && competidores.length === 0 && (
         <div className="text-center p-8 text-gray-500">
             No hay competidores registrados todavía. Puedes importarlos usando el formulario de arriba.
         </div>
       )}
    </div>
  );
};

export default GestionCompetidores;
