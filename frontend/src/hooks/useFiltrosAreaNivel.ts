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

export const useFiltrosAreaNivel = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);
  const [niveles, setNiveles] = useState<Nivel[]>([]);
  const [selectedNivel, setSelectedNivel] = useState<string>('');
  const [selectedNivelId, setSelectedNivelId] = useState<number | null>(null);

  // Cargar áreas
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const response = await api.get('/areas/nombres');
        setAreas(response.data);
      } catch (error) {
        console.error('Error al cargar áreas:', error);
      }
    };
    fetchAreas();
  }, []);

  // Cargar niveles cuando se selecciona un área
  useEffect(() => {
    const fetchNivelesPorArea = async () => {
      if (!selectedArea) {
        setNiveles([]);
        return;
      }

      try {
        const response = await api.get(`/niveles/area/${selectedArea}`);
        const data = response.data?.data || [];
        
        const nivelesData = data.map((nivel: any) => ({
          id: nivel.id,
          nombre: nivel.nombre,
        }));
        setNiveles(nivelesData);
      } catch (error) {
        console.error('Error al cargar niveles:', error);
        setNiveles([]);
      }
    };

    fetchNivelesPorArea();
  }, [selectedArea]);

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