import { Asignacion, Expediente, RuleConfig } from '../types';

export const distribuirExpedientes = (
  expedientes: Expediente[], 
  config: RuleConfig
): Asignacion[] => {
  return expedientes.map((exp) => {
    const numeroLimpio = exp.numero.trim();
    
    // Si no hay número valido
    if (!numeroLimpio || numeroLimpio.length === 0) {
      return { ...exp, responsable: "ERROR_DATO", reglaAplicada: "Sin número" };
    }

    // 1. Intentar coincidencia por 2 dígitos
    // Normalizamos a minimo 2 digitos para que "8" se evalúe como "08" si es necesario
    const numeroNormalizado = numeroLimpio.length < 2 ? numeroLimpio.padStart(2, '0') : numeroLimpio;
    const ultimosDos = numeroNormalizado.slice(-2);
    const responsableDos = config.reglas.dosDigitos[ultimosDos];
    
    if (responsableDos) {
      return {
        ...exp,
        responsable: responsableDos,
        reglaAplicada: `Terminación ${ultimosDos} (Regla 2 dígitos)`
      };
    }

    // 2. Intentar coincidencia por 1 dígito (usando el último caracter real)
    const ultimoDigito = numeroLimpio.slice(-1);
    const responsableUno = config.reglas.unDigito[ultimoDigito];

    if (responsableUno) {
      return {
        ...exp,
        responsable: responsableUno,
        reglaAplicada: `Terminación ${ultimoDigito} (Regla 1 dígito)`
      };
    }

    // 3. Sin coincidencia
    return {
      ...exp,
      responsable: "SIN_ASIGNAR",
      reglaAplicada: "Ninguna regla coincidió"
    };
  });
};