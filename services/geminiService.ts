
// Gemini AI is optional - only used if API key is available
export const summarizeAppointmentNotes = async (notes: string, serviceType: string) => {
  // Check if API key is available
  const apiKey = import.meta.env?.VITE_GEMINI_API_KEY;

  // If no API key, return a simple formatted version of notes
  if (!apiKey) {
    return `Client notes for ${serviceType} session: ${notes.substring(0, 200)}${notes.length > 200 ? '...' : ''}`;
  }

  try {
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey });

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

    return response.text || "No summary generated.";
  } catch (error) {
    console.error("AI Summary Error:", error);
    return `Client notes: ${notes}`;
  }
};

export const getRecoveryTips = async (serviceType: string) => {
  // Default recovery tips
  const defaultTips = [
    "Stay hydrated - drink plenty of water",
    "Avoid heavy lifting for 24 hours",
    "Rest well and listen to your body"
  ];

  const apiKey = import.meta.env?.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    return defaultTips;
  }

  try {
    const { GoogleGenAI, Type } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey });

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

    return JSON.parse(response.text || "[]") as string[];
  } catch (error) {
    console.log("Using default recovery tips");
    return defaultTips;
  }
};
