
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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

  // Sync game state to simplified object for UI
  const getGameState = useCallback((): GameState => ({
    fen: game.fen(),
    history: game.history(),
    turn: game.turn(),
    isCheck: game.inCheck(),
    isCheckmate: game.isCheckmate(),
    isDraw: game.isDraw(),
  }), [game]);

  const updateAnalysis = useCallback(async (currentGame: Chess, currentDifficulty: Difficulty) => {
    setIsAnalyzing(true);
    const depth = DIFFICULTY_DEPTHS[currentDifficulty];
    const result = await stockfish.analyze(currentGame.fen(), depth);
    
    // Get AI Mentor advice passing the difficulty level
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
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q", // always promote to queen for simplicity
    });
    return move;
  }

  const resetGame = () => {
    if (confirm('Tem certeza que deseja reiniciar a partida?')) {
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
    setMentorAdvice(null); // Clear advice when undoing
  };

  const saveGame = () => {
    const saveData = {
      fen: game.fen(),
      history: history,
      difficulty: difficulty
    };
    localStorage.setItem('chessmater_saved_game', JSON.stringify(saveData));
    alert('Jogo salvo com sucesso no navegador!');
  };

  const loadGame = () => {
    const savedString = localStorage.getItem('chessmater_saved_game');
    if (!savedString) {
      alert('Nenhum jogo salvo encontrado.');
      return;
    }

    try {
      const { fen, history: savedHistory, difficulty: savedDifficulty } = JSON.parse(savedString);
      const newGame = new Chess(fen);
      setGame(newGame);
      setHistory(savedHistory);
      if (savedDifficulty) setDifficulty(savedDifficulty);
      const last = savedHistory.length > 0 ? savedHistory[savedHistory.length - 1] : null;
      setLastMove(last);
      updateAnalysis(newGame, savedDifficulty || difficulty);
      alert('Jogo carregado com sucesso!');
    } catch (error) {
      console.error('Erro ao carregar o jogo:', error);
      alert('Houve um erro ao tentar carregar o jogo salvo.');
    }
  };

  // Move highlights based on mentor advice
  const boardStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};
    if (mentorAdvice && mentorAdvice.fromSquare && mentorAdvice.toSquare) {
      styles[mentorAdvice.fromSquare] = {
        boxShadow: 'inset 0 0 0 6px rgba(59, 130, 246, 0.5)',
        borderRadius: '4px'
      };
      styles[mentorAdvice.toSquare] = {
        boxShadow: 'inset 0 0 0 6px rgba(59, 130, 246, 0.7)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderRadius: '4px'
      };
    }
    return styles;
  }, [mentorAdvice]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Header />
      
      <main className="flex-1 container mx-auto p-4 flex flex-col lg:flex-row gap-6">
        {/* Left Side: Board and Main Controls */}
        <div className="flex-1 flex flex-col items-center">
          
          {/* Difficulty Selector */}
          <div className="w-full max-w-[600px] mb-4 bg-slate-900/50 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Nível do Mentor</span>
            <div className="flex bg-slate-950 rounded-md p-1 border border-slate-800">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${
                    difficulty === level 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {level === 'easy' ? 'Fácil' : level === 'medium' ? 'Médio' : 'Difícil'}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full max-w-[600px] aspect-square shadow-2xl shadow-blue-900/20 rounded-lg overflow-hidden border-4 border-slate-800">
            <Chessboard 
              position={game.fen()} 
              onPieceDrop={onDrop}
              boardOrientation={game.turn() === 'b' ? 'black' : 'white'}
              customDarkSquareStyle={{ backgroundColor: '#262626' }}
              customLightSquareStyle={{ backgroundColor: '#525252' }}
              customSquareStyles={boardStyles}
            />
          </div>
          
          <div className="mt-6 w-full max-w-[600px] space-y-3">
            <div className="flex gap-4">
              <button 
                onClick={resetGame}
                className="flex-1 bg-red-600 hover:bg-red-700 transition-colors py-3 rounded-lg font-bold shadow-lg flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reiniciar Partida
              </button>
              <button 
                onClick={undoMove}
                className="flex-1 bg-slate-700 hover:bg-slate-600 transition-colors py-3 rounded-lg font-bold shadow-lg flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Desfazer Lance
              </button>
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={saveGame}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 transition-colors py-3 rounded-lg font-bold shadow-lg flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Salvar Jogo
              </button>
              <button 
                onClick={loadGame}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 transition-colors py-3 rounded-lg font-bold shadow-lg flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Carregar Jogo
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Analysis and History */}
        <div className="w-full lg:w-96 flex flex-col gap-6">
          <MentorPanel 
            advice={mentorAdvice} 
            isAnalyzing={isAnalyzing} 
            gameState={getGameState()}
          />
          <Sidebar history={history} />
        </div>
      </main>

      <footer className="p-4 text-center text-slate-500 text-sm">
        ChessMater © 2024 - Potencializado por Stockfish & Gemini IA
      </footer>
    </div>
  );
};

export default App;
