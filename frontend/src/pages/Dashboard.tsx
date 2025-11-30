// src/pages/Dashboard.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
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

  // Obtener fecha actual formateada
  useEffect(() => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    // Capitalizar primera letra
    const fechaFormateada = date.toLocaleDateString('es-ES', options);
    setFecha(fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1));
  }, []);

  // --- DATOS MOCKUP (Simulados) SEGÚN ROL ---
  
  const getStats = () => {
    const role = user?.rol.nombre_rol;

    if (role === 'administrador') {
      return [
        { label: 'Olimpistas', value: '245', icon: <Users size={32} />, color: 'bg-blue', sub: 'Registrados' },
        { label: 'Responsables', value: '12', icon: <Users size={32} />, color: 'bg-blue', sub: 'Activos' },
        { label: 'Evaluadores', value: '28', icon: <ClipboardCheck size={32} />, color: 'bg-blue', sub: 'Asignados' },
        { label: 'Áreas', value: '8', icon: <Layers size={32} />, color: 'bg-blue', sub: 'Habilitadas' },
        { label: 'Fases Activas', value: '3', icon: <Calendar size={32} />, color: 'bg-blue', sub: 'En curso' },
        { label: 'Estado', value: 'En Proceso', icon: <Clock size={32} />, color: 'bg-blue', sub: 'Olimpiada 2025' },
      ];
    } 
    
    if (role === 'evaluador') {
      return [
        { label: 'Mis Niveles', value: '2', icon: <Layers size={32} />, color: 'bg-blue', sub: 'Asignados' },
        { label: 'Por Calificar', value: '15', icon: <ClipboardCheck size={32} />, color: 'bg-orange', sub: 'Pendientes' },
        { label: 'Calificados', value: '48', icon: <Trophy size={32} />, color: 'bg-green', sub: 'Completados' },
      ];
    }

    if (role === 'responsable') {
      return [
        { label: 'Olimpistas', value: '120', icon: <Users size={32} />, color: 'bg-blue', sub: 'En mi área' },
        { label: 'Fases', value: '2/3', icon: <Calendar size={32} />, color: 'bg-purple', sub: 'Completadas' },
        { label: 'Evaluadores', value: '5', icon: <ClipboardCheck size={32} />, color: 'bg-blue', sub: 'En mi equipo' },
      ];
    }

    return [];
  };

  const getActions = () => {
    const role = user?.rol.nombre_rol;

    if (role === 'administrador') {
      return [
        { 
          title: 'Registrar nuevo CSV', 
          desc: 'Carga un archivo CSV con los datos de los olimpistas para iniciar el proceso.', 
          icon: <Upload size={40} />, 
          btnText: 'SUBIR ARCHIVO',
          path: '/administrador/registro' 
        },
        
        
        { 
          title: 'Gestionar Listas', 
          desc: 'Visualiza y administra las listas de competidores, evaluadores y responsables.', 
          icon: <Users size={40} />, // Icono de usuarios
          btnText: 'VER LISTAS',
          path: '/administrador/listas' // Redirección a listas
        },
        

        { 
          title: 'Generar Reportes Finales', 
          desc: 'Crea certificados, listas de premiación y reportes para publicación oficial.', 
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
          desc: 'Accede a las listas de participantes para calificar su desempeño en la fase actual.', 
          icon: <ClipboardCheck size={40} />, 
          btnText: 'IR A EVALUACIÓN',
          path: '/evaluador/evaluacion'
        },
        { 
          title: 'Mis Asignaciones', 
          desc: 'Revisa los niveles y áreas que tienes asignados para esta gestión.', 
          icon: <Layers size={40} />, 
          btnText: 'VER ASIGNACIONES',
          path: '/evaluador/inicio'
        },
      ];
    }

    if (role === 'responsable') {
      return [
        { 
          title: 'Validar Listas', 
          desc: 'Revisa y aprueba las listas de clasificados de tu área.', 
          icon: <Users size={40} />, 
          btnText: 'VER LISTAS',
          path: '/responsable/listas'
        },
        { 
          title: 'Ver Informes', 
          desc: 'Consulta el estado general y estadísticas de tu área.', 
          icon: <FileText size={40} />, 
          btnText: 'VER INFORMES',
          path: '/responsable/informes'
        },
      ];
    }

    return [];
  };

  const stats = getStats();
  const actions = getActions();

  return (
    <div className="dashboard-container">
      
      {/* Header - Mantiene el estilo de bienvenida */}
      <div className="dashboard-header">
        <div className="dashboard-title-group">
          <h1>Bienvenido al Sistema Oh! SanSi</h1>
          <p className="dashboard-subtitle">Sistema de gestión para olimpiadas académicas</p>
        </div>
        <div className="dashboard-date">
          <Calendar size={18} className="text-blue-600" />
          {fecha}
        </div>
      </div>

      {/* Stats Grid (Dashboard) */}
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

      {/* Quick Actions */}
      <h2 className="section-title">Acceso Rápido</h2>
      <div className="actions-grid">
        {actions.map((action, index) => (
          <div key={index} className="action-card">
            <div className="action-icon-large">
              {action.icon}
            </div>
            <h3 className="action-title">{action.title}</h3>
            <p className="action-desc">{action.desc}</p>
            <button className="action-btn" onClick={() => navigate(action.path)}>
              {action.btnText}
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Dashboard;