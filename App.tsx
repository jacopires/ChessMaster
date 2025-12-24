
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Chess, Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { stockfish } from './services/stockfishService';
import { getMentorAdvice } from './services/geminiService';
import { GameState, MentorAdvice } from './types';

// Components
import Sidebar from './components/Sidebar';
import MentorPanel from './components/MentorPanel';
import Header from './components/Header';

const App: React.FC = () => {
  const [game, setGame] = useState(new Chess());
  const [mentorAdvice, setMentorAdvice] = useState<MentorAdvice | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<string | null>(null);

  // Sync game state to simplified object for UI
  const getGameState = useCallback((): GameState => ({
    fen: game.fen(),
    history: game.history(),
    turn: game.turn(),
    isCheck: game.inCheck(),
    isCheckmate: game.isCheckmate(),
    isDraw: game.isDraw(),
  }), [game]);

  const updateAnalysis = useCallback(async (currentGame: Chess) => {
    setIsAnalyzing(true);
    const result = await stockfish.analyze(currentGame.fen());
    
    // Get AI Mentor advice
    const advice = await getMentorAdvice(
      currentGame.fen(),
      currentGame.history(),
      result.bestMove,
      lastMove
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
        updateAnalysis(gameCopy);
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
    const newGame = new Chess();
    setGame(newGame);
    setHistory([]);
    setMentorAdvice(null);
    setLastMove(null);
  };

  const undoMove = () => {
    const gameCopy = new Chess(game.fen());
    gameCopy.undo();
    setGame(gameCopy);
    setHistory(gameCopy.history());
    setMentorAdvice(null); // Clear advice when undoing
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Header />
      
      <main className="flex-1 container mx-auto p-4 flex flex-col lg:flex-row gap-6">
        {/* Left Side: Board and Main Controls */}
        <div className="flex-1 flex flex-col items-center">
          <div className="w-full max-w-[600px] aspect-square shadow-2xl shadow-blue-900/20 rounded-lg overflow-hidden border-4 border-slate-800">
            <Chessboard 
              position={game.fen()} 
              onPieceDrop={onDrop}
              boardOrientation={game.turn() === 'b' ? 'black' : 'white'}
              customDarkSquareStyle={{ backgroundColor: '#1e293b' }}
              customLightSquareStyle={{ backgroundColor: '#475569' }}
            />
          </div>
          
          <div className="mt-6 flex gap-4 w-full max-w-[600px]">
            <button 
              onClick={resetGame}
              className="flex-1 bg-red-600 hover:bg-red-700 transition-colors py-3 rounded-lg font-bold shadow-lg"
            >
              Reiniciar Partida
            </button>
            <button 
              onClick={undoMove}
              className="flex-1 bg-slate-700 hover:bg-slate-600 transition-colors py-3 rounded-lg font-bold shadow-lg"
            >
              Desfazer Lance
            </button>
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
