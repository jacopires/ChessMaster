
import { AnalysisResult } from '../types';

class StockfishService {
  private worker: Worker | null = null;
  private onMessageCallback: ((result: AnalysisResult) => void) | null = null;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.initPromise = this.init();
  }

  private async init() {
    // To fix CORS/Origin issues with Web Workers, we fetch the script and create a Blob URL
    try {
      const response = await fetch('https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js');
      const scriptText = await response.text();
      const blob = new Blob([scriptText], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      
      this.worker = new Worker(workerUrl);
      
      this.worker.onmessage = (e) => {
        const line = e.data;
        if (typeof line !== 'string') return;

        if (line.includes('bestmove')) {
          const parts = line.split(' ');
          const bestMove = parts[1];
          if (this.onMessageCallback) {
            this.onMessageCallback({ bestMove, score: 0, depth: 15 });
          }
        }
      };

      this.worker.postMessage('uci');
      this.worker.postMessage('isready');
    } catch (error) {
      console.error('Failed to initialize Stockfish worker:', error);
    }
  }

  public async analyze(fen: string, depth: number = 15): Promise<AnalysisResult> {
    // Ensure the worker is initialized before attempting to use it
    if (this.initPromise) {
      await this.initPromise;
    }

    return new Promise((resolve) => {
      if (!this.worker) {
        console.warn('Stockfish worker not available.');
        resolve({ bestMove: '', score: 0, depth: 0 });
        return;
      }

      this.onMessageCallback = resolve;
      this.worker.postMessage(`position fen ${fen}`);
      this.worker.postMessage(`go depth ${depth}`);
    });
  }

  public terminate() {
    this.worker?.terminate();
    this.worker = null;
  }
}

export const stockfish = new StockfishService();
