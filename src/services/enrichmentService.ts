import { GoogleGenAI, Type } from '@google/genai';
import { Hardware } from '../types';

const getAI = () => {
  const apiKey = localStorage.getItem('bg_gemini_api_key');
  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }
  return new GoogleGenAI({ apiKey });
};

export const enrichHardware = async (items: string[]): Promise<Hardware[]> => {
  if (!items || items.length === 0) return [];

  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `For the following list of musical instruments and hardware, identify the brand (vendor) and type (instrument or hardware) for each. Here is the list: ${items.join(', ')}`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            vendor: { type: Type.STRING },
            type: { type: Type.STRING, enum: ['instrument', 'hardware'] },
          },
          required: ['name', 'vendor', 'type'],
        },
      },
    },
  });

  try {
    const hardware: Hardware[] = JSON.parse(response.text || '[]');
    return hardware;
  } catch (e) {
    console.error("Failed to parse hardware enrichment response:", e);
    return [];
  }
};
