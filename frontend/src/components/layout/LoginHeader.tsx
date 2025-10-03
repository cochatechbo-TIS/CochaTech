// src/components/layout/LoginHeader.tsx
import React from 'react';
import { User } from 'lucide-react';

const LoginHeader: React.FC = () => {
  return (
    <header className="w-full bg-blue-600 text-white py-4 flex justify-between items-center px-4"> {/* Agregado w-full, cambiado px-6 a px-4 para menos margen */}
      <h1 className="text-2xl font-bold">Oh! SanSi</h1>
      <button className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-full flex items-center gap-2"> {/* Más padding en botón */}
        <User size={18} />
        Iniciar sesión
      </button>
    </header>
  );
};

export default LoginHeader;