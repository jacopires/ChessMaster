
import { GoogleGenAI, Type } from "@google/genai";
import { MentorAdvice } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const getMentorAdvice = async (
  fen: string,
  history: string[],
  bestMove: string,
  lastMove: string | null,
  difficulty: 'easy' | 'medium' | 'hard'
): Promise<MentorAdvice> => {
  const difficultyMap = {
    easy: "Básico (fácil e direto, conceitos fundamentais)",
    medium: "Intermediário (estratégia moderada e táticas comuns)",
    hard: "Avançado (análise profunda, linhas complexas e nuances posicionais)"
  };

  const prompt = `
    Você é o ChessMater Mentor, um Grande Mestre de xadrez especialista em estratégia.
    O usuário está jogando uma partida no nível de dificuldade: ${difficultyMap[difficulty]}.
    
    Estado atual (FEN): ${fen}
    Histórico de lances: ${history.join(', ')}
    Último lance feito: ${lastMove || 'Nenhum'}
    Melhor lance sugerido pela engine (Stockfish em formato UCI): ${bestMove}

    Analise a posição e forneça um conselho estratégico em Português do Brasil.
    
    INSTRUÇÕES DE ACORDO COM O NÍVEL (${difficulty}):
    - Se for 'easy': Explique como se estivesse ensinando um iniciante. Use termos simples, foque em segurança das peças e controle do centro.
    - Se for 'medium': Use termos técnicos moderados (ex: garfo, cravada, casas fracas). Foque em planos de médio prazo.
    - Se for 'hard': Forneça uma análise técnica profunda. Fale sobre estrutura de peões, profilaxia e sacrifícios posicionais complexos.

    Extraia as casas de origem e destino do melhor lance (ex: se o bestMove for 'e2e4', fromSquare é 'e2' e toSquare é 'e4').
    Foque em como o usuário pode progredir para um xeque-mate ou ganhar vantagem material significativa.
    Mantenha o tom encorajador e educativo.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING, description: "O conselho geral do mentor." },
            bestMoveSan: { type: Type.STRING, description: "O melhor lance em notação algébrica (ex: e4, Nf3)." },
            fromSquare: { type: Type.STRING, description: "Casa de origem do lance (ex: e2)." },
            toSquare: { type: Type.STRING, description: "Casa de destino do lance (ex: e4)." },
            strategicExplanation: { type: Type.STRING, description: "Explicação detalhada da estratégia por trás do lance, ajustada ao nível de dificuldade." },
            isCheckmateSequence: { type: Type.BOOLEAN, description: "Se este lance faz parte de uma sequência forçada de mate." }
          },
          required: ["text", "bestMoveSan", "fromSquare", "toSquare", "strategicExplanation", "isCheckmateSequence"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      text: "Desculpe, tive um problema ao analisar a posição. Tente novamente em breve.",
      bestMoveSan: bestMove.substring(0, 2), // Fallback simples
      fromSquare: bestMove.substring(0, 2),
      toSquare: bestMove.substring(2, 4),
      strategicExplanation: "Houve um erro na comunicação com a IA.",
      isCheckmateSequence: false
    };
  }
};
