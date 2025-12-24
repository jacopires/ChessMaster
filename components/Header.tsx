
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Chess<span className="text-blue-500">Mater</span></h1>
        </div>
        
        <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-400">
          <a href="#" className="hover:text-white transition-colors">Jogar</a>
          <a href="#" className="hover:text-white transition-colors">Análise</a>
          <a href="#" className="hover:text-white transition-colors">Problemas</a>
          <a href="#" className="hover:text-white transition-colors">Aprender</a>
        </nav>

        <div className="flex items-center gap-4">
          <div className="px-3 py-1 bg-slate-800 rounded-full text-xs font-semibold text-green-400 border border-green-500/30 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Stockfish Ativo
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
