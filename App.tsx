
import React, { useState, useCallback, useMemo } from 'react';
import { Chess, Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { stockfish } from './services/stockfishService';
import { getMentorAdvice } from './services/geminiService';
import { GameState, MentorAdvice } from './types';

// Components
import Sidebar from './components/Sidebar';
import MentorPanel from './components/MentorPanel';
import Header from './components/Header';

type Difficulty = 'easy' | 'medium' | 'hard';

const DIFFICULTY_DEPTHS: Record<Difficulty, number> = {
  easy: 5,
  medium: 12,
  hard: 18
};

const App: React.FC = () => {
  const [game, setGame] = useState(new Chess());
  const [mentorAdvice, setMentorAdvice] = useState<MentorAdvice | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  const getGameState = useCallback((): GameState => ({
    fen: game.fen(),
    history: game.history(),
    turn: game.turn(),
    isCheck: game.inCheck(),
    isCheckmate: game.isCheckmate(),
    isDraw: game.isDraw(),
  }), [game]);

  const updateAnalysis = useCallback(async (currentGame: Chess, currentDifficulty: Difficulty) => {
    if (currentGame.isCheckmate() || currentGame.isDraw()) return;
    
    setIsAnalyzing(true);
    const depth = DIFFICULTY_DEPTHS[currentDifficulty];
    const result = await stockfish.analyze(currentGame.fen(), depth);
    
    const advice = await getMentorAdvice(
      currentGame.fen(),
      currentGame.history(),
      result.bestMove,
      lastMove,
      currentDifficulty
    );
    
    setMentorAdvice(advice);
    setIsAnalyzing(false);
  }, [lastMove]);

  function makeAMove(move: any) {
    const gameCopy = new Chess(game.fen());
    try {
      const result = gameCopy.move(move);
      if (result) {
        setGame(gameCopy);
        setHistory(gameCopy.history());
        setLastMove(result.san);
        updateAnalysis(gameCopy, difficulty);
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  }

  function onDrop(sourceSquare: Square, targetSquare: Square) {
    return makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });
  }

  const resetGame = () => {
    if (window.confirm('Reiniciar a partida? Todo o progresso atual será perdido.')) {
      const newGame = new Chess();
      setGame(newGame);
      setHistory([]);
      setMentorAdvice(null);
      setLastMove(null);
    }
  };

  const undoMove = () => {
    const gameCopy = new Chess(game.fen());
    gameCopy.undo();
    setGame(gameCopy);
    setHistory(gameCopy.history());
    setMentorAdvice(null);
  };

  const saveGame = () => {
    const saveData = {
      fen: game.fen(),
      history: history,
      difficulty: difficulty
    };
    localStorage.setItem('chessmater_save', JSON.stringify(saveData));
    alert('Jogo salvo com sucesso!');
  };

  const loadGame = () => {
    const saved = localStorage.getItem('chessmater_save');
    if (!saved) return alert('Nenhum jogo salvo encontrado.');

    try {
      const { fen, history: savedHistory, difficulty: savedDifficulty } = JSON.parse(saved);
      const newGame = new Chess(fen);
      setGame(newGame);
      setHistory(savedHistory);
      if (savedDifficulty) setDifficulty(savedDifficulty);
      setLastMove(savedHistory[savedHistory.length - 1] || null);
      updateAnalysis(newGame, savedDifficulty || difficulty);
    } catch (e) {
      alert('Erro ao carregar o arquivo de salvamento.');
    }
  };

  const boardStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};
    if (mentorAdvice?.fromSquare && mentorAdvice?.toSquare) {
      styles[mentorAdvice.fromSquare] = {
        boxShadow: 'inset 0 0 0 6px rgba(59, 130, 246, 0.4)',
        borderRadius: '4px'
      };
      styles[mentorAdvice.toSquare] = {
        boxShadow: 'inset 0 0 0 6px rgba(59, 130, 246, 0.6)',
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        borderRadius: '4px'
      };
    }
    return styles;
  }, [mentorAdvice]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Header />
      
      <main className="flex-1 container mx-auto p-4 flex flex-col lg:flex-row gap-8">
        <div className="flex-1 flex flex-col items-center">
          
          {/* Dificuldade */}
          <div className="w-full max-w-[550px] mb-6 flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800 backdrop-blur-sm">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Nível do Mentor</span>
            <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all duration-300 ${
                    difficulty === level 
                      ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {level === 'easy' ? 'Fácil' : level === 'medium' ? 'Médio' : 'Difícil'}
                </button>
              ))}
            </div>
          </div>

          {/* Tabuleiro */}
          <div className="w-full max-w-[550px] aspect-square shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-xl overflow-hidden border-[6px] border-slate-800">
            <Chessboard 
              position={game.fen()} 
              onPieceDrop={onDrop}
              boardOrientation={game.turn() === 'b' ? 'black' : 'white'}
              customDarkSquareStyle={{ backgroundColor: '#262626' }}
              customLightSquareStyle={{ backgroundColor: '#525252' }}
              customSquareStyles={boardStyles}
              animationDuration={300}
            />
          </div>
          
          {/* Controles */}
          <div className="mt-8 w-full max-w-[550px] grid grid-cols-2 gap-4">
            <button onClick={resetGame} className="bg-slate-800 hover:bg-red-900/40 hover:text-red-400 hover:border-red-900/50 transition-all py-3 rounded-xl font-bold border border-slate-700 flex items-center justify-center gap-2 group">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reiniciar
            </button>
            <button onClick={undoMove} className="bg-slate-800 hover:bg-slate-700 transition-all py-3 rounded-xl font-bold border border-slate-700 flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Desfazer
            </button>
            <button onClick={saveGame} className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-600/30 transition-all py-3 rounded-xl font-bold flex items-center justify-center gap-2">
              Salvar
            </button>
            <button onClick={loadGame} className="bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 transition-all py-3 rounded-xl font-bold flex items-center justify-center gap-2">
              Carregar
            </button>
          </div>
        </div>

        {/* Sidebar e Mentor */}
        <div className="w-full lg:w-[400px] flex flex-col gap-6">
          <MentorPanel 
            advice={mentorAdvice} 
            isAnalyzing={isAnalyzing} 
            gameState={getGameState()}
          />
          <Sidebar history={history} />
        </div>
      </main>

      <footer className="p-6 text-center text-slate-600 text-[10px] uppercase tracking-widest font-bold">
        ChessMater © 2024 • Engine Stockfish 10 • Mentor Gemini Flash 2.5
      </footer>
    </div>
  );
};

export default App;
