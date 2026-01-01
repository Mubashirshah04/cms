
import { GoogleGenAI, Type } from "@google/genai";

// Fix: Use process.env.API_KEY directly in the named parameter object
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const summarizeAppointmentNotes = async (notes: string, serviceType: string) => {
  // Fix: Removed the manual check for process.env.API_KEY as per guidelines assuming it's pre-configured
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Summarize the following client notes for a ${serviceType} massage session. 
                 Extract key focus areas and any health concerns. 
                 Keep it professional and concise for a therapist.
                 
                 Notes: ${notes}`,
      config: {
        temperature: 0.7,
        topP: 0.95,
      }
    });
    
    // Fix: Access response.text directly (it is a property, not a method)
    return response.text || "No summary generated.";
  } catch (error) {
    console.error("AI Summary Error:", error);
    return "Error generating summary.";
  }
};

export const getRecoveryTips = async (serviceType: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide 3 brief post-care recovery tips for a client who just had a ${serviceType} session.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });
    
    // Fix: Access response.text property directly
    return JSON.parse(response.text || "[]") as string[];
  } catch (error) {
    return ["Stay hydrated", "Avoid heavy lifting", "Rest well"];
  }
};
