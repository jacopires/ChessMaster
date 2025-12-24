
import React from 'react';

interface SidebarProps {
  history: string[];
}

const Sidebar: React.FC<SidebarProps> = ({ history }) => {
  // Group history in pairs
  const movePairs = [];
  for (let i = 0; i < history.length; i += 2) {
    movePairs.push({
      white: history[i],
      black: history[i + 1] || null
    });
  }

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 flex flex-col h-[400px] shadow-xl">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center">
        <h2 className="font-bold text-slate-300 uppercase tracking-wider text-xs">Histórico de Lances</h2>
        <span className="text-xs text-slate-500">{history.length} lances</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        <div className="grid grid-cols-1 gap-1">
          {movePairs.map((pair, index) => (
            <div key={index} className="flex items-center gap-2 text-sm p-2 hover:bg-slate-800 rounded transition-colors group">
              <span className="w-8 text-slate-600 font-mono text-xs">{index + 1}.</span>
              <div className="flex-1 grid grid-cols-2 gap-2">
                <span className="bg-slate-800 px-2 py-1 rounded border border-slate-700 font-medium group-hover:border-slate-600">
                  {pair.white}
                </span>
                {pair.black && (
                  <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800 font-medium group-hover:border-slate-700">
                    {pair.black}
                  </span>
                )}
              </div>
            </div>
          ))}
          {history.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-slate-600 italic py-10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Aguardando o primeiro lance...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
