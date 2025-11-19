import { GoogleGenAI, Type } from "@google/genai";
import { Expediente } from "../types";

// Inicializamos el cliente.
// SEGURIDAD: Al estar en el cliente (navegador), esta API KEY es visible en la red.
// ESTRATEGIA DE DEFENSA:
// 1. Restricciones HTTP en Google Cloud Console (filtra navegadores no autorizados).
// 2. CUOTAS Y PRESUPUESTOS (evita sorpresas de facturación si hay spoofing).
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const extraerDatosDePDF = async (base64File: string, mimeType: string = 'application/pdf'): Promise<Expediente[]> => {
  try {
    const model = 'gemini-2.5-flash'; // Modelo eficiente para tareas de extracción
    
    const prompt = `
      ANÁLISIS PDF: Ignora texto, solo procesa datos tabulados de 6 columnas.
      
      OBJETIVO DE PRIVACIDAD: 
      IGNORA COMPLETAMENTE nombres, direcciones, datos personales sensibles y TODAS las columnas excepto "año" y "numero".

      TAREA DE EXTRACCIÓN: 
      Por cada fila, extrae SOLO los valores de las columnas "año" y "numero".

      SALIDA: 
      Devuelve un JSON Array limpio de objetos {"numero": string, "anio": string}.
    `;

    const response = await ai.models.generateContent({
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
    });

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
    
    // Manejo de errores específicos de la API
    const errorMsg = error.toString();
    
    if (errorMsg.includes("403") || errorMsg.includes("PERMISSION_DENIED")) {
      throw new Error("Acceso denegado (403). Verifica que la 'API Key' tenga restricciones HTTP correctas para este dominio o que no haya expirado.");
    }
    
    if (errorMsg.includes("429") || errorMsg.includes("RESOURCE_EXHAUSTED")) {
      throw new Error("Límite de cuota excedido (429). Se han realizado demasiadas peticiones hoy. Intenta más tarde.");
    }

    if (errorMsg.includes("500") || errorMsg.includes("503")) {
      throw new Error("Error en los servidores de Google (5xx). Por favor intenta de nuevo en unos segundos.");
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
        // Remover el prefijo "data:application/pdf;base64,"
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error("Error procesando archivo"));
      }
    };
    reader.onerror = error => reject(error);
  });
};
