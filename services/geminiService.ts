
import { GoogleGenAI, Type } from "@google/genai";
import { MentorAdvice } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const getMentorAdvice = async (
  fen: string,
  history: string[],
  bestMove: string,
  lastMove: string | null
): Promise<MentorAdvice> => {
  const prompt = `
    Você é o ChessMater Mentor, um Grande Mestre de xadrez especialista em estratégia.
    O usuário está jogando uma partida.
    
    Estado atual (FEN): ${fen}
    Histórico de lances: ${history.join(', ')}
    Último lance feito: ${lastMove || 'Nenhum'}
    Melhor lance sugerido pela engine (Stockfish): ${bestMove}

    Analise a posição e forneça um conselho estratégico em Português do Brasil.
    Se o último lance do usuário foi abaixo do ideal, explique o porquê comparando com a sugestão da engine.
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
            strategicExplanation: { type: Type.STRING, description: "Explicação detalhada da estratégia por trás do lance." },
            isCheckmateSequence: { type: Type.BOOLEAN, description: "Se este lance faz parte de uma sequência forçada de mate." }
          },
          required: ["text", "bestMoveSan", "strategicExplanation", "isCheckmateSequence"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      text: "Desculpe, tive um problema ao analisar a posição. Tente novamente em breve.",
      bestMoveSan: bestMove,
      strategicExplanation: "Houve um erro na comunicação com a IA.",
      isCheckmateSequence: false
    };
  }
};
