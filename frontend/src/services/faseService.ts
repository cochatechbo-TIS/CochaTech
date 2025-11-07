import api from "./api";

export const aprobarFase = async (id_nivel_fase: number) => {
  const response = await api.post(`/nivel-fase/aprobar/${id_nivel_fase}`);
  return response.data;
};

export const rechazarFase = async (id_nivel_fase: number, comentario: string) => {
  const response = await api.post(`/nivel-fase/rechazar/${id_nivel_fase}`, {
    comentario,
  });
  return response.data;
};
