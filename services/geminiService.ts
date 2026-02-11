import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeProxyList = async (proxyListString: string): Promise<AnalysisResult> => {
  const model = "gemini-3-flash-preview";

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: `Analyze the following list of Proxy IP addresses. 
      Identify the countries they likely belong to based on standard IP ranges.
      Return a summary count of countries.
      Important: Write the 'summary' field in Persian (Farsi) language.
      
      Proxy List Snippet:
      ${proxyListString.slice(0, 5000)} // Limit length to avoid token limits
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            countries: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  country: { type: Type.STRING },
                  count: { type: Type.NUMBER },
                }
              }
            },
            summary: {
              type: Type.STRING,
              description: "A brief text summary of the proxy list quality and locations in Persian."
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return { countries: [], summary: "هیچ تحلیلی در دسترس نیست." };

    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      countries: [],
      summary: "تحلیل لیست با خطا مواجه شد. لطفاً کلید API را بررسی کنید."
    };
  }
};