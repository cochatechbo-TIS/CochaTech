// src/components/layout/MenuDesplegable.tsx
import React, { useState, useEffect, useRef } from 'react';
import { User2} from 'lucide-react';

interface MenuDesplegableProps {
  onLogout: () => void;
  onProfile: () => void;
}

const MenuDesplegable: React.FC<MenuDesplegableProps> = ({ onLogout, onProfile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="user-dropdown-container" ref={dropdownRef}>
      <button 
        className="user-icon-button"
        onClick={() => setIsOpen(!isOpen)} 
      >
        <User2 size={20} className="user-icon" />
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          <button onClick={onLogout} className="dropdown-item">
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );
};

export default MenuDesplegable;