
import { GoogleGenAI, Type } from "@google/genai";
import { ProcessedData } from "../types";

export const extractDataFromImages = async (base64Images: string[]): Promise<ProcessedData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Analyze these images of a genealogical interview form. 
    The form contains a table with columns: RIN #, Relation (C/F/P), Sex (M/F), Name (First and Last), Birth Date/Place, Death Date/Place.
    
    IMPORTANT RULES:
    1. Look for "//" or empty spaces in the Name column - these are ditto marks indicating the same surname as the row above.
    2. Extract metadata from the header: Interview ID, Date, Place, Interviewee Name, and Total Names (should be around 73).
    3. Normalize Sex to 'M' or 'F'.
    4. For dates/places, try to extract as much as possible from the icons and handwritten lines.
    5. Return the data in the specified JSON format.
  `;

  const imageParts = base64Images.map(img => ({
    inlineData: {
      mimeType: "image/jpeg",
      data: img.split(',')[1] || img
    }
  }));

  // Upgrade to gemini-3-pro-preview for complex handwriting and reasoning tasks
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: { parts: [{ text: prompt }, ...imageParts] },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          metadata: {
            type: Type.OBJECT,
            properties: {
              interviewId: { type: Type.STRING },
              interviewDate: { type: Type.STRING },
              interviewPlace: { type: Type.STRING },
              intervieweeName: { type: Type.STRING },
              intervieweeRin: { type: Type.STRING },
              totalNames: { type: Type.NUMBER }
            },
            required: ["interviewId", "intervieweeName"]
          },
          individuals: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                rin: { type: Type.NUMBER },
                relation: { type: Type.STRING },
                sex: { type: Type.STRING },
                fullName: { type: Type.STRING },
                birthDate: { type: Type.STRING },
                birthPlace: { type: Type.STRING },
                deathDate: { type: Type.STRING },
                deathPlace: { type: Type.STRING },
                page: { type: Type.NUMBER },
                row: { type: Type.NUMBER },
                confidence: { type: Type.NUMBER }
              }
            }
          }
        }
      }
    }
  });

  try {
    // Correctly access response.text property
    const rawResult = JSON.parse(response.text || '{}');
    
    // Ensure unique IDs for React keys and provide defaults
    if (rawResult.individuals && Array.isArray(rawResult.individuals)) {
      rawResult.individuals = rawResult.individuals.map((ind: any, idx: number) => ({
        ...ind,
        id: `ind-${idx}-${Date.now()}`
      }));
    } else {
      rawResult.individuals = [];
    }
    
    return rawResult as ProcessedData;
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Failed to process document data.");
  }
};
