import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const useFiltrosAreaNivel = () => {
  const [areas, setAreas] = useState<string[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [niveles, setNiveles] = useState<string[]>([]);
  const [selectedNivel, setSelectedNivel] = useState<string>('');

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
        const nivelesData = Array.isArray(response.data) ? response.data : response.data?.data || [];
        
        const nombresNiveles = nivelesData.map((nivel: any) => nivel.nombre);
        setNiveles(nombresNiveles);
      } catch (error) {
        console.error('Error al cargar niveles:', error);
        setNiveles([]);
      }
    };

    fetchNivelesPorArea();
  }, [selectedArea]);

  const handleAreaChange = useCallback((area: string) => {
    setSelectedArea(area);
    setSelectedNivel(''); // Resetear nivel al cambiar área
  }, []);

  const handleNivelChange = useCallback((nivel: string) => {
    setSelectedNivel(nivel);
  }, []);

  const resetFiltros = useCallback(() => {
    setSelectedArea('');
    setSelectedNivel('');
  }, []);

  return {
    areas,
    niveles,
    selectedArea,
    selectedNivel,
    handleAreaChange,
    handleNivelChange,
    resetFiltros
  };
};