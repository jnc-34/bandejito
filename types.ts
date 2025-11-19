export interface Expediente {
  numero: string;
  anio: string;
  fullString: string; // numero/anio
}

export interface Asignacion extends Expediente {
  responsable: string;
  reglaAplicada: string; // Para depuración/transparencia
}

export interface RuleConfig {
  responsables: string[];
  reglas: {
    dosDigitos: Record<string, string>;
    unDigito: Record<string, string>;
  };
}

export enum ProcessStatus {
  IDLE = 'IDLE',
  READING = 'READING', // Reading file
  EXTRACTING = 'EXTRACTING', // Calling Gemini
  DISTRIBUTING = 'DISTRIBUTING', // Applying logic
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}