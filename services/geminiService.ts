
import { GoogleGenAI, Type } from "@google/genai";
import { ProcessedData, FileData, Individual } from "../types.ts";

const MAX_RETRIES = 3;
const BASE_RETRY_DELAY = 10000;
const QUOTA_RETRY_DELAY = 62000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const processDocumentBatch = async (
  files: FileData[],
  attempt = 1
): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const contentParts = files.map(file => ({
    inlineData: { mimeType: file.mimeType, data: file.data }
  }));

  const prompt = `Você é um perito em transcrição de genealogia para o formulário MZ11. 
O documento possui 3 páginas com 25 linhas cada (Total 75 registros).
Retorne JSON estrito com o campo 'individuals'.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { 
        parts: [{ text: prompt }, ...contentParts] 
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            individuals: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  rin: { type: Type.NUMBER },
                  fullName: { type: Type.STRING },
                  relation: { type: Type.STRING },
                  sex: { type: Type.STRING },
                  birthDate: { type: Type.STRING },
                  birthPlace: { type: Type.STRING },
                  deathDate: { type: Type.STRING },
                  deathPlace: { type: Type.STRING },
                  page: { type: Type.NUMBER }
                },
                required: ["fullName"]
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("A IA não retornou resposta.");
    return JSON.parse(text);

  } catch (e: any) {
    if (attempt < MAX_RETRIES) {
      const delay = e.message?.includes("429") ? QUOTA_RETRY_DELAY : BASE_RETRY_DELAY;
      await sleep(delay);
      return processDocumentBatch(files, attempt + 1);
    }
    throw e;
  }
};

export const extractDataFromImages = async (
  files: FileData[]
): Promise<ProcessedData> => {
  try {
    const result = await processDocumentBatch(files);
    
    if (!result.individuals || result.individuals.length === 0) {
      throw new Error("Nenhum dado encontrado.");
    }

    const processed = result.individuals.map((ind: any, idx: number) => ({
      id: `ind-${idx}-${Date.now()}`,
      rin: ind.rin || (idx + 1),
      fullName: (ind.fullName || "").trim(),
      relation: (ind.relation || "").trim(),
      birthDate: (ind.birthDate || "").trim(),
      birthPlace: (ind.birthPlace || "").trim(),
      deathDate: (ind.deathDate || "").trim(),
      deathPlace: (ind.deathPlace || "").trim(),
      sex: (ind.sex || "").trim(), 
      page: ind.page || (Math.floor(idx / 25) + 1),
      row: (idx % 25) + 1,
      confidence: 0.99
    }));

    return {
      metadata: {
        interviewId: `MZ11-${Date.now().toString().slice(-4)}`,
        intervieweeName: processed[0]?.fullName || "",
        interviewDate: new Date().toLocaleDateString(),
        interviewPlace: "",
        intervieweeRin: "1",
        totalNames: processed.length
      },
      individuals: processed.sort((a: any, b: any) => a.rin - b.rin)
    };
  } catch (err: any) {
    throw new Error(`Erro na extração: ${err.message}`);
  }
};
