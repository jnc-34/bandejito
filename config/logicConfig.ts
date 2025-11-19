import { RuleConfig } from '../types';

/**
 * CONFIGURACIÓN DE LÓGICA DE NEGOCIO
 * 
 * Este archivo contiene las reglas de distribución.
 * Puede ser modificado para alterar a quién se asignan las tareas
 * sin necesidad de tocar el código fuente de la aplicación.
 */

export const CONFIGURACION_DISTRIBUCION: RuleConfig = {
  // Lista maestra de responsables (para validaciones o UI futura)
  responsables: [
    "CATERINA", 
    "ROMINA", 
    "CLARISA", 
    "MARISA", 
    "SUSANA", 
    "FRANCISCO", 
    "LUCIANA", 
    "JUAN"
  ],

  reglas: {
    // PRIORIDAD 1: Reglas basadas en los últimos DOS dígitos
    // Formato: "Dígitos": "Nombre Responsable"
    dosDigitos: {
      "00": "MARISA",
      "10": "MARISA",
      "20": "MARISA",
      "30": "MARISA",
      "40": "MARISA",
      
      "50": "SUSANA",
      "60": "SUSANA",
      "70": "SUSANA",
      "80": "SUSANA",

      "90": "JUAN",

      "08": "FRANCISCO",
      "18": "FRANCISCO",
      "28": "FRANCISCO",

      "38": "LUCIANA",
      "48": "LUCIANA",
      "58": "LUCIANA",

      "68": "JUAN",
      "78": "JUAN",
      "88": "JUAN",
      "98": "JUAN"
    },

    // PRIORIDAD 2: Reglas basadas en el ÚLTIMO dígito
    // Se ejecutan solo si no hubo coincidencia en las reglas de dos dígitos
    unDigito: {
      "1": "CATERINA",
      "2": "ROMINA",
      "3": "CLARISA",
      "4": "MARISA",
      "5": "SUSANA",
      "6": "FRANCISCO",
      "7": "LUCIANA",
      "9": "JUAN"
      // Nota: El 8 no está aquí porque todos los casos de 8 están cubiertos arriba (08, 18, etc)
      // Si llegara un número terminando en 8 que no esté arriba, quedará "SIN ASIGNAR"
    }
  }
};