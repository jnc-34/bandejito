import React, { useState } from 'react';
import { Asignacion } from '../types';
import { Download, UserCheck, AlertCircle, Filter } from 'lucide-react';

interface DistributionTableProps {
  data: Asignacion[];
  onReset: () => void;
}

export const DistributionTable: React.FC<DistributionTableProps> = ({ data, onReset }) => {
  const [filter, setFilter] = useState<string>('TODOS');

  // Obtener responsables únicos para el filtro
  const responsablesUnicos = Array.from(new Set(data.map(d => d.responsable))).sort();

  const filteredData = filter === 'TODOS' 
    ? data 
    : data.filter(d => d.responsable === filter);

  const downloadCSV = () => {
    const headers = ["Expediente", "Numero", "Año", "Responsable", "Regla Aplicada"];
    const rows = data.map(row => 
      [`"${row.fullString}"`, `"${row.numero}"`, `"${row.anio}"`, `"${row.responsable}"`, `"${row.reglaAplicada}"`].join(',')
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
    <div className="w-full max-w-5xl mx-auto mt-8 animate-fade-in-up">
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-emerald-600" />
            Resultados de Distribución
            </h2>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
                {data.length} Expedientes
            </span>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
           <div className="relative">
             <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="appearance-none pl-9 pr-8 py-2 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
             >
                <option value="TODOS">Ver Todos</option>
                {responsablesUnicos.map(r => (
                    <option key={r} value={r}>{r}</option>
                ))}
             </select>
             <Filter className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
           </div>

          <button 
            onClick={downloadCSV}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
          
          <button 
            onClick={onReset}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Nueva Carga
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-4 border-b">Expediente</th>
                <th className="px-6 py-4 border-b">Responsable Asignado</th>
                <th className="px-6 py-4 border-b">Detalle Regla</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((item, index) => (
                <tr key={index} className="hover:bg-indigo-50/30 transition-colors">
                  <td className="px-6 py-3 font-medium text-slate-900">
                    {item.fullString}
                  </td>
                  <td className="px-6 py-3">
                    <span className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${item.responsable === 'SIN_ASIGNAR' || item.responsable === 'ERROR_DATO'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-indigo-100 text-indigo-800'}
                    `}>
                      {item.responsable === 'SIN_ASIGNAR' && <AlertCircle className="w-3 h-3 mr-1"/>}
                      {item.responsable}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-500 text-xs">
                    {item.reglaAplicada}
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                  <tr>
                      <td colSpan={3} className="text-center py-8 text-slate-500">
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