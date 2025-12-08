import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  Users, 
  Trophy, 
  ClipboardCheck, 
  Calendar, 
  FileText, 
  Layers,
  Clock,
  Upload
} from 'lucide-react';
import './dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [fecha, setFecha] = useState('');
  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fecha actual
  useEffect(() => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    const fechaFormateada = date.toLocaleDateString('es-ES', options);
    setFecha(fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1));
  }, []);

  // Consumir endpoint backend
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/logistica');
        setStatsData(response.data);
      } catch (error) {
        console.error('Error cargando dashboard', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // STATS DINÁMICAS
  const getStats = () => {
    const role = user?.rol.nombre_rol;

    if (!statsData) return [];

    if (role === 'administrador') {
      return [
        { label: 'Olimpistas', value: statsData.total_olimpistas, icon: <Users size={32} />, color: 'bg-blue', sub: 'Registrados' },
        { label: 'Responsables', value: statsData.total_responsables, icon: <Users size={32} />, color: 'bg-blue', sub: 'Activos' },
        { label: 'Evaluadores', value: statsData.total_evaluadores, icon: <ClipboardCheck size={32} />, color: 'bg-blue', sub: 'Asignados' },
        { label: 'Áreas', value: statsData.total_areas, icon: <Layers size={32} />, color: 'bg-blue', sub: 'Habilitadas' },
        { label: 'Fases Activas', value: statsData.fases_en_proceso, icon: <Calendar size={32} />, color: 'bg-blue', sub: 'En curso' },
      ];
    }

    if (role === 'responsable') {
      return [
        { label: 'Olimpistas', value: statsData.olimpistas_en_area, icon: <Users size={32} />, color: 'bg-blue', sub: 'En mi área' },
        { 
          label: 'Fases', 
          value: `${statsData.fases_aprobadas_area}/${statsData.total_fases_area}`, 
          icon: <Calendar size={32} />, 
          color: 'bg-purple', 
          sub: 'Completadas' 
        },
        { label: 'Evaluadores', value: statsData.evaluadores_en_area, icon: <ClipboardCheck size={32} />, color: 'bg-blue', sub: 'En mi equipo' },
      ];
    }

    if (role === 'evaluador') {
      return [
        { label: 'Mis Niveles', value: statsData.total_niveles_asignados, icon: <Layers size={32} />, color: 'bg-blue', sub: 'Asignados' },
        { label: 'Fases en Proceso', value: statsData.fases_nivel_en_proceso, icon: <Clock size={32} />, color: 'bg-orange', sub: 'Pendientes' },
        { label: 'Fases Aprobadas', value: statsData.fases_nivel_aprobadas, icon: <Trophy size={32} />, color: 'bg-green', sub: 'Completadas' },
      ];
    }

    return [];
  };

  // ACCIONES (no dependen del backend)
  const getActions = () => {
    const role = user?.rol.nombre_rol;

    if (role === 'administrador') {
      return [
        { 
          title: 'Registrar nuevo CSV',
          desc: 'Carga un archivo CSV con los datos de los olimpistas.',
          icon: <Upload size={40} />,
          btnText: 'SUBIR ARCHIVO',
          path: '/administrador/registro'
        },
        { 
          title: 'Gestionar Listas',
          desc: 'Visualiza y administra listas de competidores.',
          icon: <Users size={40} />,
          btnText: 'VER LISTAS',
          path: '/administrador/listas'
        },
        { 
          title: 'Generar Reportes Finales',
          desc: 'Crea certificados y listas oficiales.',
          icon: <FileText size={40} />,
          btnText: 'GENERAR REPORTES',
          path: '/administrador/reportes'
        },
      ];
    }

    if (role === 'evaluador') {
      return [
        { 
          title: 'Evaluar Olimpistas',
          desc: 'Califica a los participantes asignados.',
          icon: <ClipboardCheck size={40} />,
          btnText: 'IR A EVALUACIÓN',
          path: '/evaluador/evaluacion'
        },
      ];
    }

    if (role === 'responsable') {
      return [
        { 
          title: 'Validar Listas',
          desc: 'Aprueba listas de tu área.',
          icon: <Users size={40} />,
          btnText: 'VER LISTAS',
          path: '/responsable/listas'
        },
        { 
          title: 'Ver Informes',
          desc: 'Consulta estadísticas de tu área.',
          icon: <FileText size={40} />,
          btnText: 'VER INFORMES',
          path: '/responsable/informes'
        },
      ];
    }

    return [];
  };

  if (loading) {
    return <div className="dashboard-container">Cargando dashboard...</div>;
  }

  const stats = getStats();
  const actions = getActions();

  return (
    <div className="dashboard-container">

      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-title-group">
          <h1>Bienvenido al Sistema Oh! SanSi</h1>
          <p className="dashboard-subtitle">
            Sistema de gestión para olimpiadas académicas
          </p>
        </div>
        <div className="dashboard-date">
          <Calendar size={18} />
          {fecha}
        </div>
      </div>

      {/* Stats */}
      <h2 className="section-title">Panel de Control</h2>
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className={`stat-icon-wrapper ${stat.color}`}>
              {stat.icon}
            </div>
            <span className="stat-label">{stat.label}</span>
            <span className="stat-value">{stat.value}</span>
            <span className="stat-subtext">{stat.sub}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <h2 className="section-title">Acceso Rápido</h2>
      <div className="actions-grid">
        {actions.map((action, index) => (
          <div key={index} className="action-card">
            <div className="action-icon-large">{action.icon}</div>
            <h3 className="action-title">{action.title}</h3>
            <p className="action-desc">{action.desc}</p>
            <button 
              className="action-btn" 
              onClick={() => navigate(action.path)}
            >
              {action.btnText}
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Dashboard;
