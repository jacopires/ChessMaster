
export interface AnalysisResult {
  bestMove: string;
  score: number; // centipawns
  depth: number;
}

export interface MentorAdvice {
  text: string;
  bestMoveSan: string;
  strategicExplanation: string;
  isCheckmateSequence: boolean;
}

export interface GameState {
  fen: string;
  history: string[];
  turn: 'w' | 'b';
  isCheck: boolean;
  isCheckmate: boolean;
  isDraw: boolean;
}
