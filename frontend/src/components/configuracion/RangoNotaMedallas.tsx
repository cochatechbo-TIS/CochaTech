import { useState, useEffect, useRef } from 'react';
import { PencilIcon, Save } from 'lucide-react';
import './RangoNotaMedallas.css';
import './RangoNotaMedallas.css';
import api from '../../services/api';
import { NotificationModal } from '../common/NotificationModal';

export type GradeRange = {
  id_tipo_premio?: number;
  medal: string;
  emoji: string;
  min: number;
  max: number;
  color: string;
};

export function RangoNotaMedallas() {
  const [ranges, setRanges] = useState<GradeRange[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [activeHandle, setActiveHandle] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [bloqueado, setBloqueado] = useState(true); // empieza bloqueado
  const [verificando, setVerificando] = useState(true);


  const segmentColors = ['#60A5FA', '#F97316', '#9CA3AF', '#FACC15'];
  const segmentLightColors = ['#DBEAFE', '#FFEDD5', '#F3F4F6', '#FEF9C3'];

  const [notification, setNotification] = useState({
  isVisible: false,
  message: '',
  type: 'info' as 'success' | 'error' | 'info',
  title: '',
});
  
  const showNotification = (
  message: string,
  type: 'success' | 'error' | 'info',
  title?: string
) => {
  setNotification({
    isVisible: true,
    message,
    type,
    title: title || '',
  });
};

const closeNotification = () => {
  setNotification(prev => ({ ...prev, isVisible: false }));
};
  useEffect(() => {
  const verificarFases = async () => {
    try {
      const res = await api.get('/fases/existen');
      setBloqueado(res.data?.existen === true);
    } catch (e) {
      console.error('Error verificando fases', e);
      setBloqueado(true); // por seguridad
    } finally {
      setVerificando(false);
    }
  };

  verificarFases();
}, []);

  // ----------------------------
  // 1. CARGAR + ORDENAR RANGOS
  // ----------------------------
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await api.get('/tipo-premio');

        const data: GradeRange[] = response.data.map((p: any) => ({
          id_tipo_premio: p.id_tipo_premio,
          medal: p.nombre,
          emoji:
            p.nombre === 'Oro'
              ? '🥇'
              : p.nombre === 'Plata'
              ? '🥈'
              : p.nombre === 'Bronce'
              ? '🥉'
              : '🎖️',
          min: p.nota_minima,
          max: p.nota_maxima,
          color:
            p.nombre === 'Oro'
              ? 'yellow'
              : p.nombre === 'Plata'
              ? 'gray'
              : p.nombre === 'Bronce'
              ? 'orange'
              : 'blue',
        }));

        // ORDENAR POR MIN
        data.sort((a, b) => a.min - b.min);

        setRanges(data);
      } catch (error) {
        console.error('Error cargando premios:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ----------------------------
  // 2. GENERAR HANDLES CORRECTOS
  // ----------------------------
  const boundaries = ranges.length
    ? [
        ranges[0].min,
        ranges[0].max,
        ranges[1].max,
        ranges[2].max,
        ranges[3].max,
      ]
    : [0, 0, 0, 0, 0];

  const handleMouseDown = (index: number) => {
    if (!isEditing) return;
    setActiveHandle(index);
  };

  const handleEdit = () => {
  if (bloqueado) {
    showNotification(
      'Las fases ya han iniciado. No es posible modificar los rangos de notas.',
      'info',
      'Edición no permitida'
    );
    return;
  }

  setIsEditing(true);
};

  // ----------------------------
  // 3. MOVIMIENTO EXACTO DE HANDLES
  // ----------------------------
  useEffect(() => {
    if (activeHandle === null) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!sliderRef.current) return;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const rect = sliderRef.current.getBoundingClientRect();

      const value = Math.round(
        Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1) * 100
      );

      const newRanges = [...ranges];

      switch (activeHandle) {
        case 0: // Primer rango (min)
          newRanges[0].min = Math.min(value, newRanges[0].max - 1);
          break;
        case 1: // Rango 0 max / Rango 1 min
          newRanges[0].max = Math.min(value, newRanges[1].max - 1);
          newRanges[1].min = newRanges[0].max + 1;
          break;
        case 2: // Rango 1 max / Rango 2 min
          newRanges[1].max = Math.min(value, newRanges[2].max - 1);
          newRanges[2].min = newRanges[1].max + 1;
          break;
        case 3: // Rango 2 max / Rango 3 min
          newRanges[2].max = Math.min(value, newRanges[3].max - 1);
          newRanges[3].min = newRanges[2].max + 1;
          break;
        case 4: // Último rango max
          newRanges[3].max = Math.max(value, newRanges[3].min + 1);
          break;
      }

      setRanges(newRanges);
    };

    const handleUp = () => setActiveHandle(null);

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleUp);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [activeHandle, ranges]);

  // ----------------------------
  // 4. GUARDAR CAMBIOS
  // ----------------------------
  const handleSave = async () => {
    try {
      await api.put('/tipo-premio', {
        premios: ranges.map(r => ({
          id_tipo_premio: r.id_tipo_premio,
          nota_minima: r.min,
          nota_maxima: r.max,
        })),
      });

      setIsEditing(false);
      showNotification(
      'Los rangos de notas se guardaron correctamente.',
      'success',
      'Guardado exitoso'
    );
    } catch (error: any) {
      showNotification(
      error.response?.data?.message || 'Error al guardar los rangos.',
      'error',
      'Error'
    );
    }
  };

  if (loading) {
    return (
      <div className="rnm-loading">
        <p>Cargando rangos...</p>
      </div>
    );
  }

  return (
    <div className="rnm-container">
      <div className="rnm-header">
        <h3 className='rnm-title'>Rangos de Notas por Medalla</h3>

        <div className="edit-button-container">
          {!isEditing ? (
            <button className={`btn-primary ${bloqueado ? 'btn-disabled' : 'btn-primary-enabled'}`}
            onClick={handleEdit}>
              <PencilIcon size={16} /> Editar
            </button>
          ) : (
            <div className='edit-actions'>
              <button className="btn-primary" onClick={handleSave}>
                <Save size={16} /> Guardar
              </button>
              <button
                className="btn-secondary"
                onClick={() => setIsEditing(false)}
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SLIDER */}
      <div ref={sliderRef} className="rnm-slider">
        {ranges.map((range, idx) => (
          <div
            key={idx}
            className="rnm-segment"
            style={{
              left: `${range.min}%`,
              width: `${range.max - range.min}%`,
              backgroundColor: segmentColors[idx],
            }}
          />
        ))}

        {[0, 1, 2, 3, 4].map(idx => (
          <div
            key={idx}
            className={`rnm-handle ${isEditing ? 'editable' : 'readonly'}`}
            style={{ left: `${boundaries[idx]}%` }}
            onMouseDown={() => handleMouseDown(idx)}
            onTouchStart={() => handleMouseDown(idx)}
          >
            <div className="rnm-handle-dot" />
            <div className="rnm-handle-label">{boundaries[idx]}</div>
          </div>
        ))}

        <div className="rnm-marker left">0</div>
        <div className="rnm-marker right">100</div>
      </div>

      <div className="rnm-legend">
        {ranges.map((r, idx) => (
          <div
            key={idx}
            className="rnm-card"
            style={{ backgroundColor: segmentLightColors[idx] }}
          >
            <div className="rnm-card-emoji">{r.emoji}</div>
            <div className="rnm-card-label">{r.medal}</div>
            <div className="rnm-card-range">
              {r.min} - {r.max}
            </div>
          </div>
        ))}
      </div>
      <NotificationModal
        isVisible={notification.isVisible}
        message={notification.message}
        type={notification.type}
        title={notification.title}
        onClose={closeNotification}
/>

    </div>
  );
}
