// src/components/certificados/GeneradorCertificados.tsx

import { pdf } from '@react-pdf/renderer';
import CertificadoPDF from './CertificadoPDF';
import CertificadosPDF from './CertificadosPDF'; 
interface Participante {
  id: number;
  nombre: string;
  ci: string;
  institucion: string;
  departamento: string;
  area: string;
  nivel: string;
  notaFinal: number;
  posicion: string;
  profesor: string;
  responsableArea: string;
  esGrupal: boolean;
}

const obtenerFechaActual = (): string => {
  const fecha = new Date();
  const dia = fecha.getDate();
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  const mes = meses[fecha.getMonth()];
  const año = fecha.getFullYear();

  return `${dia} días del mes de ${mes} de ${año}`;
};

export const generarCertificadoIndividual = async (
  participante: Participante
) => {
  try {
    const data = {
      nombreEstudiante: participante.nombre,
      medalla: participante.posicion,
      unidadEducativa: participante.institucion,
      area: participante.area,
      nivel: participante.nivel,
      responsableArea: participante.responsableArea,
      fecha: obtenerFechaActual(),
    };

    const blob = await pdf(<CertificadoPDF data={data} />).toBlob();

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Certificado_${participante.nombre.replace(/\s+/g, '_')}.pdf`;
    link.click();

    return true;
  } catch (error) {
    console.error('Error generando certificado:', error);
    return false;
  }
};
// ← NUEVA FUNCIÓN: Un solo PDF con todos
export const generarCertificadosMasivosUnido = async (
  participantes: Participante[],
  onProgress?: (actual: number, total: number) => void
) => {
  try {
    const total = participantes.length;

    if (onProgress) {
      onProgress(total, total);
    }

    // Generar UN SOLO PDF con todas las páginas
    const blob = await pdf(
  <CertificadosPDF participantes={participantes} />).toBlob();

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Certificados_Masivos_${new Date().getTime()}.pdf`;
    link.click();

    return {
      exitosos: total,
      total,
      mensaje: `Se generó 1 PDF con ${total} certificados exitosamente.`
    };
  } catch (error) {
    console.error('Error generando certificados masivos:', error);
    return {
      exitosos: 0,
      total: participantes.length,
      mensaje: 'Error al generar certificados.'
    };
  }
};
