import React from 'react';
import { useNavigate } from 'react-router-dom';

function Header({ disableNavigation }) {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    if (!disableNavigation) {
      navigate('/');
    }
  };

  return (
    <header className="bg-black shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <button 
            onClick={handleLogoClick}
            disabled={disableNavigation}
            className="flex items-center space-x-2 focus:outline-none"
          >
            <span className="text-4xl font-extrabold bg-clip-text">
            💼 
            </span>
            <span className="text-4xl font-extrabold bg-white text-transparent bg-clip-text">
            Agent Mock
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header; 
