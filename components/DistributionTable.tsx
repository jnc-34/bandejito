import React, { useState, useMemo } from 'react';
import { Asignacion } from '../types';
import { Download, UserCheck, AlertCircle, Filter, Briefcase } from 'lucide-react';

interface DistributionTableProps {
  data: Asignacion[];
  onReset: () => void;
}

export const DistributionTable: React.FC<DistributionTableProps> = ({ data, onReset }) => {
  const [filter, setFilter] = useState<string>('TODOS');

  // 1. Obtener responsables únicos para el select de filtro
  const responsablesUnicos = useMemo(() => {
    return Array.from(new Set(data.map(d => d.responsable))).sort();
  }, [data]);

  // 2. Calcular estadísticas (conteo por responsable)
  const estadisticas = useMemo(() => {
    return data.reduce((acc, curr) => {
      acc[curr.responsable] = (acc[curr.responsable] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [data]);

  // 3. Filtrar y Ordenar datos
  // Se ordenan primero por Responsable (agrupamiento implícito) y luego por número de expediente
  const filteredAndSortedData = useMemo(() => {
    let result = filter === 'TODOS' 
      ? [...data] 
      : data.filter(d => d.responsable === filter);

    return result.sort((a, b) => {
      // Primer criterio: Responsable alfabéticamente
      const respCompare = a.responsable.localeCompare(b.responsable);
      if (respCompare !== 0) return respCompare;
      
      // Segundo criterio: Expediente
      return a.fullString.localeCompare(b.fullString);
    });
  }, [data, filter]);

  const downloadCSV = () => {
    const headers = ["Expediente", "Numero", "Año", "Responsable"];
    const rows = filteredAndSortedData.map(row => 
      [`"${row.fullString}"`, `"${row.numero}"`, `"${row.anio}"`, `"${row.responsable}"`].join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "distribucion_bandejito.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-8 animate-fade-in-up pb-20">
      
      {/* Header Stats */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
          <UserCheck className="w-6 h-6 text-emerald-600" />
          Resumen de Asignación
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Object.entries(estadisticas).sort().map(([responsable, count]) => (
            <div key={responsable} className={`
              p-4 rounded-xl border shadow-sm flex flex-col items-center justify-center
              transition-transform hover:scale-105
              ${responsable === 'SIN_ASIGNAR' || responsable === 'ERROR_DATO' 
                ? 'bg-red-50 border-red-100 text-red-700' 
                : 'bg-white border-slate-200 text-slate-700'}
            `}>
              <span className="text-3xl font-bold mb-1">{count}</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-center px-2">{responsable}</span>
            </div>
          ))}
          {/* Total Card */}
          <div className="p-4 rounded-xl bg-indigo-600 text-white shadow-md flex flex-col items-center justify-center">
            <span className="text-3xl font-bold mb-1">{data.length}</span>
            <span className="text-xs font-semibold uppercase tracking-wider opacity-90">Total</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-2 text-slate-700">
            <Briefcase className="w-5 h-5 text-indigo-500" />
            <span className="font-semibold">Detalle de Expedientes</span>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
           <div className="relative flex-1 md:w-48">
             <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full appearance-none pl-9 pr-8 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
             >
                <option value="TODOS">Todos los responsables</option>
                {responsablesUnicos.map(r => (
                    <option key={r} value={r}>{r}</option>
                ))}
             </select>
             <Filter className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
           </div>

          <button 
            onClick={downloadCSV}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-colors shadow-sm text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
          
          <button 
            onClick={onReset}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors text-sm font-medium"
          >
            Nueva Carga
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-4 border-b w-1/2">Expediente</th>
                <th className="px-6 py-4 border-b w-1/2">Responsable Asignado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAndSortedData.map((item, index) => (
                <tr key={index} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-6 py-3 font-medium text-slate-900 group-hover:text-indigo-700 transition-colors">
                    {item.fullString}
                  </td>
                  <td className="px-6 py-3">
                    <span className={`
                      inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm
                      ${item.responsable === 'SIN_ASIGNAR' || item.responsable === 'ERROR_DATO'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-indigo-100 text-indigo-800'}
                    `}>
                      {item.responsable === 'SIN_ASIGNAR' && <AlertCircle className="w-3 h-3 mr-1"/>}
                      {item.responsable}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredAndSortedData.length === 0 && (
                  <tr>
                      <td colSpan={2} className="text-center py-8 text-slate-500">
                          No hay expedientes para este filtro.
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
