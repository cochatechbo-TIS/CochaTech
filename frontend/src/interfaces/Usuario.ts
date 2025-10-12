export interface Usuario {
    id_usuario: number; // La clave primaria del usuario
    nombre: string;     // Nombre (como viene del backend)
    apellidos: string;  // Apellidos (como viene del backend)
    ci: string;         // El documento de identidad (como viene del backend)
    email: string;
    telefono: string | null; // Puede ser nulo
    area: string;
    id_rol: number;
    // Campos opcionales del frontend que podemos mantener por retrocompatibilidad 
    // pero idealmente no se usarían en la lógica de datos:
    id_responsable?: number; 
    documento?: string;
    // otros campos opcionales del modelo de la DB
    created_at?: string;
    updated_at?: string;
    // NOTA: 'cargo' se ha eliminado.
}