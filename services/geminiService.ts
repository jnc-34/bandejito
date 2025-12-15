import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Expediente } from "../types";

// Inicializamos el cliente.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Función auxiliar para reintentar operaciones automáticamente cuando la API está saturada.
 * Implementa "Exponential Backoff": espera 1s, luego 2s, luego 4s.
 */
async function retryOperation<T>(operation: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    const errorMsg = error.toString();
    // Detectar errores de sobrecarga (503) o problemas temporales de servidor
    if ((errorMsg.includes("503") || errorMsg.includes("overloaded") || errorMsg.includes("UNAVAILABLE")) && retries > 0) {
      console.warn(`Gemini sobrecargado. Reintentando en ${delay/1000} segundos... Quedan ${retries} intentos.`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryOperation(operation, retries - 1, delay * 2);
    }
    throw error;
  }
}

export const extraerDatosDePDF = async (base64File: string, mimeType: string = 'application/pdf'): Promise<Expediente[]> => {
  try {
    const model = 'gemini-2.5-flash'; 
    
    const prompt = `
      ANÁLISIS PDF: Ignora texto, solo procesa datos tabulados de 6 columnas.
      
      OBJETIVO DE PRIVACIDAD: 
      IGNORA COMPLETAMENTE nombres, direcciones, datos personales sensibles y TODAS las columnas excepto "año" y "numero".

      TAREA DE EXTRACCIÓN: 
      Por cada fila, extrae SOLO los valores de las columnas "año" y "numero".

      SALIDA: 
      Devuelve un JSON Array limpio de objetos {"numero": string, "anio": string}.
    `;

    // Envolvemos la llamada en la función de reintento
    const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64File
            }
          },
          {
            text: prompt
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              numero: { type: Type.STRING, description: "Solo dígitos del número de expediente" },
              anio: { type: Type.STRING, description: "Año en formato YYYY" }
            },
            required: ["numero", "anio"]
          }
        }
      }
    }));

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("La IA no devolvió texto. Es posible que el documento no sea legible.");
    }

    const rawData = JSON.parse(jsonText) as { numero: string, anio: string }[];
    
    // Transformamos al formato interno
    return rawData.map(item => ({
      numero: item.numero,
      anio: item.anio,
      fullString: `${item.numero}/${item.anio}`
    }));

  } catch (error: any) {
    console.error("Error en Gemini Service:", error);
    
    const errorMsg = error.toString();
    
    if (errorMsg.includes("403") || errorMsg.includes("PERMISSION_DENIED")) {
      throw new Error("Acceso denegado (403). Verifica tu API Key.");
    }
    
    if (errorMsg.includes("429") || errorMsg.includes("RESOURCE_EXHAUSTED")) {
      throw new Error("Has superado tu cuota de uso diaria de la IA.");
    }

    if (errorMsg.includes("503") || errorMsg.includes("overloaded")) {
      throw new Error("Los servidores de Google están muy ocupados en este momento. Por favor, intenta de nuevo en 1 minuto.");
    }

    throw error;
  }
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error("Error procesando archivo"));
      }
    };
    reader.onerror = error => reject(error);
  });
};
