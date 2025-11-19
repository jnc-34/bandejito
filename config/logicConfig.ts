import { RuleConfig } from '../types';
import reglas from './reglas.json';

/**
 * CONFIGURACIÓN DE LÓGICA DE NEGOCIO
 * 
 * Ahora la fuente de la verdad es el archivo 'reglas.json'.
 * Utilizamos importación relativa estricta para evitar problemas de resolución de módulos.
 */

export const CONFIGURACION_DISTRIBUCION: RuleConfig = reglas;
