import React, { useState, useMemo } from 'react';
import { Asignacion } from '../types';
import { Download, UserCheck, AlertCircle, Filter, Briefcase, Users } from 'lucide-react';

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

  // 3. Agrupamiento de datos para la vista
  const groupedData = useMemo(() => {
    const groups: Record<string, Asignacion[]> = {};
    
    // Filtramos primero si hay selección
    const dataToGroup = filter === 'TODOS' 
      ? data 
      : data.filter(d => d.responsable === filter);

    // Ordenamos los datos base por número de expediente para que queden ordenados dentro del grupo
    const sortedData = [...dataToGroup].sort((a, b) => a.fullString.localeCompare(b.fullString));

    // Agrupamos
    sortedData.forEach(item => {
      if (!groups[item.responsable]) {
        groups[item.responsable] = [];
      }
      groups[item.responsable].push(item);
    });

    return groups;
  }, [data, filter]);

  // Obtener las llaves de grupo ordenadas alfabéticamente
  const sortedGroupKeys = Object.keys(groupedData).sort();

  const downloadCSV = () => {
    // Filtrar y ordenar para el CSV (similar a la vista)
    let dataExport = filter === 'TODOS' ? [...data] : data.filter(d => d.responsable === filter);
    dataExport.sort((a, b) => {
       const respCompare = a.responsable.localeCompare(b.responsable);
       if (respCompare !== 0) return respCompare;
       return a.fullString.localeCompare(b.fullString);
    });

    const headers = ["Expediente", "Numero", "Año", "Responsable"];
    const rows = dataExport.map(row => 
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
      
      {/* Header Stats - Conteo por responsable */}
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

      {/* Data Table Agrupada */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-4 border-b">Expediente</th>
                {/* La columna 'Responsable' es redundante con el agrupamiento, pero la dejamos implícita en el header de grupo */}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedGroupKeys.map(responsable => (
                <React.Fragment key={responsable}>
                  {/* Group Header Row */}
                  <tr className="bg-slate-100/80">
                    <td className="px-6 py-2 border-t border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className={`
                          inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold
                          ${responsable === 'SIN_ASIGNAR' || responsable === 'ERROR_DATO'
                             ? 'bg-red-200 text-red-800' 
                             : 'bg-indigo-200 text-indigo-800'}
                        `}>
                            <Users className="w-3 h-3" />
                        </span>
                        <span className="font-bold text-slate-700">{responsable}</span>
                        <span className="text-xs font-normal text-slate-500 ml-1">
                          ({groupedData[responsable].length} expedientes)
                        </span>
                        {responsable === 'SIN_ASIGNAR' && (
                            <span className="text-xs text-red-600 flex items-center gap-1 ml-2">
                                <AlertCircle className="w-3 h-3" /> Revisar
                            </span>
                        )}
                      </div>
                    </td>
                  </tr>
                  
                  {/* Data Rows for this Group */}
                  {groupedData[responsable].map((item, index) => (
                    <tr key={`${responsable}-${item.fullString}-${index}`} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="px-6 py-3 pl-12 font-medium text-slate-900 group-hover:text-indigo-700 transition-colors">
                        {item.fullString}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
              
              {data.length === 0 && (
                  <tr>
                      <td className="text-center py-8 text-slate-500">
                          No hay datos para mostrar.
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
