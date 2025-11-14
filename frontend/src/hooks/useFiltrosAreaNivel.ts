import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

interface Area {
  id_area: number;
  nombre: string;
}

interface Nivel {
  id: number;
  nombre: string;
}

export const useFiltrosAreaNivel = (isAdmin: boolean) => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);
  const [niveles, setNiveles] = useState<Nivel[]>([]);
  const [selectedNivel, setSelectedNivel] = useState<string>('');
  const [selectedNivelId, setSelectedNivelId] = useState<number | null>(null);
  //const [responsibleAreaName, setResponsibleAreaName] = useState<string>('');

  // Cargar áreas
  useEffect(() => {
    const fetchAreas = async () => {
      if (!isAdmin) {
        setAreas([]); // No cargamos áreas si no es admin
        return;
      }
      try {
        const response = await api.get('/areas/nombres');
        setAreas(response.data);
      } catch (error) {
        console.error('Error al cargar áreas:', error);
      }
    };
    fetchAreas();
  }, [isAdmin]);

  // Cargar niveles cuando se selecciona un área
  useEffect(() => {
    const fetchNiveles = async () => {
      let url = '';
      
      if (isAdmin) {
        // ADMIN: usa el área seleccionada
        if (!selectedArea) {
            setNiveles([]);
            setSelectedNivel('');
            setSelectedNivelId(null);
            return;
        }
        url = `/niveles/area/${selectedArea}`;
      } else {
        // RESPONSABLE: usa el endpoint de autenticación
        url = '/niveles/auth';
      }

      try {
        const response = await api.get(url);
        const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
        
        const nivelesData = data.map((nivel: any) => ({
          id: nivel.id,
          nombre: nivel.nombre,
          // Si el responsable está logueado, los niveles vienen con su área
          area: nivel.area || '', 
          id_area: nivel.id_area || null
        }));
        
        setNiveles(nivelesData);
        
        // Si no es admin y hay niveles, extraemos el nombre del área
        if (!isAdmin && nivelesData.length > 0) {
            setSelectedArea(nivelesData[0].area || '');
            // Buscamos el ID del área si está disponible en la respuesta (si el backend lo envía)
            setSelectedAreaId(nivelesData[0].id_area);        // id correcto
        }
      } catch (error) {
        console.error('Error al cargar niveles:', error);
        setNiveles([]);
      }
    };

    fetchNiveles();
  }, [selectedArea, isAdmin]);

  const handleAreaChange = useCallback((areaNombre: string) => {
    setSelectedArea(areaNombre);
    setSelectedNivel(''); // Resetear nivel al cambiar área

    const area = areas.find((a) => a.nombre === areaNombre);
      setSelectedAreaId(area?.id_area ?? null);
    },
    [areas]
  );

  const handleNivelChange = useCallback((nivelNombre: string) => {
    setSelectedNivel(nivelNombre);
    const nivel = niveles.find((n) => n.nombre === nivelNombre);
    setSelectedNivelId(nivel?.id ?? null);
  }, [niveles]);

  return {
    areas: areas.map(a => a.nombre),            // SOLO nombres
    niveles: niveles.map(n => n.nombre),        // SOLO nombres
    selectedArea,
    selectedNivel,
    selectedAreaId,
    selectedNivelId,
    handleAreaChange,
    handleNivelChange,
  };
};