
import React from 'react';
import { MentorAdvice, GameState } from '../types';

interface MentorPanelProps {
  advice: MentorAdvice | null;
  isAnalyzing: boolean;
  gameState: GameState;
}

const MentorPanel: React.FC<MentorPanelProps> = ({ advice, isAnalyzing, gameState }) => {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl flex flex-col">
      <div className="bg-blue-600 p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div>
          <h2 className="font-bold text-white text-sm">Mentor IA</h2>
          <p className="text-[10px] text-blue-100 uppercase tracking-widest font-semibold">Análise Estratégica</p>
        </div>
      </div>

      <div className="p-5 flex-1 min-h-[200px]">
        {gameState.isCheckmate ? (
          <div className="text-center py-4">
             <div className="text-4xl mb-4">🏆</div>
             <h3 className="text-xl font-bold text-yellow-500 mb-2">Fim de Jogo!</h3>
             <p className="text-slate-400">Temos um xeque-mate no tabuleiro. Excelente partida!</p>
          </div>
        ) : isAnalyzing ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-.1s]"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-.2s]"></div>
            </div>
            <p className="text-sm text-slate-500 font-medium">Analisando sua posição...</p>
          </div>
        ) : advice ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
              <p className="text-slate-200 text-sm leading-relaxed italic">
                "{advice.text}"
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Lance Recomendado</span>
                {advice.isCheckmateSequence && (
                  <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded border border-red-500/30 font-bold uppercase">Sequência de Mate!</span>
                )}
              </div>
              <div className="text-2xl font-mono font-bold text-blue-400 bg-slate-950 p-2 rounded border border-blue-900/30 text-center">
                {advice.bestMoveSan}
              </div>
            </div>

            <div className="space-y-2">
               <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Por que este lance?</span>
               <p className="text-sm text-slate-300 leading-relaxed">
                 {advice.strategicExplanation}
               </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 py-10 text-center">
             <p className="text-sm">Faça um lance para receber a orientação do mentor.</p>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-800/30 border-t border-slate-800 flex justify-center gap-4">
        <div className="text-center">
          <p className="text-[10px] text-slate-500 uppercase font-bold">Turno</p>
          <p className="text-sm font-bold">{gameState.turn === 'w' ? 'Brancas' : 'Pretas'}</p>
        </div>
        <div className="w-px h-8 bg-slate-700"></div>
        <div className="text-center">
          <p className="text-[10px] text-slate-500 uppercase font-bold">Estado</p>
          <p className={`text-sm font-bold ${gameState.isCheck ? 'text-red-500' : 'text-green-500'}`}>
            {gameState.isCheck ? 'Xeque!' : 'Normal'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MentorPanel;
