import React, { useState } from 'react';
import { FileUploader } from './components/FileUploader';
import { DistributionTable } from './components/DistributionTable';
import { extraerDatosDePDF, fileToBase64 } from './services/geminiService';
import { distribuirExpedientes } from './utils/distributor';
import { CONFIGURACION_DISTRIBUCION } from './config/logicConfig';
import { Asignacion, ProcessStatus } from './types';
import { Bot, ShieldCheck, LayoutDashboard, Settings, X, Lock } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<ProcessStatus>(ProcessStatus.IDLE);
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showRules, setShowRules] = useState(false);

  const processFile = async (file: File) => {
    try {
      setStatus(ProcessStatus.READING);
      setErrorMsg(null);

      // 1. Convertir a Base64
      const base64 = await fileToBase64(file);

      // 2. Extraer datos con Gemini
      setStatus(ProcessStatus.EXTRACTING);
      const expedientesExtraidos = await extraerDatosDePDF(base64);

      if (expedientesExtraidos.length === 0) {
        throw new Error("No se encontraron expedientes validos en el documento.");
      }

      // 3. Distribuir según lógica local
      setStatus(ProcessStatus.DISTRIBUTING);
      // Pequeño delay artificial para que se note el cambio de paso en UI (UX)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const resultado = distribuirExpedientes(expedientesExtraidos, CONFIGURACION_DISTRIBUCION);
      setAsignaciones(resultado);
      
      setStatus(ProcessStatus.COMPLETED);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Ocurrió un error inesperado.");
      setStatus(ProcessStatus.ERROR);
    }
  };

  const handleReset = () => {
    setAsignaciones([]);
    setStatus(ProcessStatus.IDLE);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
                <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Bandejito</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-1 hidden sm:flex" title="La API Key se maneja de forma segura mediante variables de entorno">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="hidden sm:inline">Seguridad Activa</span>
            </div>
            <button 
              onClick={() => setShowRules(true)}
              className="flex items-center gap-1 hover:bg-slate-100 px-2 py-1 rounded-md transition-colors"
              title="Ver reglas configuradas"
            >
                <Settings className="w-4 h-4 text-slate-600" />
                <span className="hidden sm:inline">Reglas</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-start p-4 sm:p-8">
        
        {/* Intro / Hero */}
        {status === ProcessStatus.IDLE && (
          <div className="text-center mb-10 max-w-xl animate-fade-in">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Distribución Automática de Expedientes</h2>
            <p className="text-slate-600">
              Sube tu listado en PDF. La IA extraerá los números de expediente y asignará automáticamente el responsable según las reglas configuradas en <code>reglas.json</code>.
            </p>
          </div>
        )}

        {/* Uploader Area */}
        {(status === ProcessStatus.IDLE || status === ProcessStatus.READING || status === ProcessStatus.EXTRACTING || status === ProcessStatus.DISTRIBUTING) && (
          <div className="w-full flex flex-col items-center gap-6">
            <FileUploader 
              onFileSelected={processFile} 
              isProcessing={status !== ProcessStatus.IDLE} 
            />
            
            {/* Progress Indicators */}
            {status !== ProcessStatus.IDLE && (
                <div className="w-full max-w-md space-y-2">
                    <div className="flex justify-between text-xs font-medium text-slate-500 uppercase tracking-wide">
                        <span>Progreso</span>
                        <span>
                            {status === ProcessStatus.READING && "Leyendo archivo..."}
                            {status === ProcessStatus.EXTRACTING && "Analizando con Gemini AI..."}
                            {status === ProcessStatus.DISTRIBUTING && "Aplicando reglas..."}
                        </span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                            className={`h-full bg-indigo-600 transition-all duration-1000 ease-out ${
                                status === ProcessStatus.READING ? "w-1/3" :
                                status === ProcessStatus.EXTRACTING ? "w-2/3" :
                                "w-full"
                            }`}
                        />
                    </div>
                </div>
            )}
          </div>
        )}

        {/* Error State */}
        {status === ProcessStatus.ERROR && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-lg text-center animate-shake">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bot className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-red-800 mb-2">Algo salió mal</h3>
                <p className="text-red-600 mb-6">{errorMsg}</p>
                <button 
                    onClick={handleReset}
                    className="px-6 py-2 bg-white border border-red-300 text-red-700 font-medium rounded-lg hover:bg-red-50 transition-colors"
                >
                    Intentar de nuevo
                </button>
            </div>
        )}

        {/* Results */}
        {status === ProcessStatus.COMPLETED && (
          <DistributionTable data={asignaciones} onReset={handleReset} />
        )}

      </main>
      
      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-500" />
                Configuración Actual
              </h3>
              <button onClick={() => setShowRules(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                 <div className="flex items-start gap-3">
                   <Lock className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                   <div>
                     <h4 className="font-semibold text-amber-800 text-sm">Seguridad de API Key</h4>
                     <p className="text-sm text-amber-700 mt-1">
                       Esta aplicación se ejecuta en el navegador. Para evitar el uso no autorizado de tu API Key:
                     </p>
                     <ul className="list-disc list-inside text-sm text-amber-700 mt-2 space-y-1">
                       <li>Ve a <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="underline font-medium">Google Cloud Console &gt; Credenciales</a>.</li>
                       <li>Edita tu API Key y selecciona <strong>"Restricciones de sitio web"</strong>.</li>
                       <li>Añade tu dominio de GitHub Pages (ej. <code>https://usuario.github.io/*</code>).</li>
                       <li>Configura <strong>Cuotas</strong> para limitar el gasto máximo mensual.</li>
                     </ul>
                   </div>
                 </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-600">Reglas cargadas desde <code>config/reglas.json</code>:</p>
                <div className="bg-slate-800 rounded-lg p-4 text-xs font-mono text-indigo-100 overflow-auto max-h-64 shadow-inner">
                  <pre>{JSON.stringify(CONFIGURACION_DISTRIBUCION, null, 2)}</pre>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 text-right">
              <button 
                onClick={() => setShowRules(false)}
                className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-6 text-center text-slate-400 text-sm border-t border-slate-100">
        <p>Bandejito v1.0 &copy; {new Date().getFullYear()} | Powered by Gemini 2.5</p>
      </footer>
    </div>
  );
};

export default App;
