import React, { useCallback } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';

interface FileUploaderProps {
  onFileSelected: (file: File) => void;
  isProcessing: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelected, isProcessing }) => {
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
  }, [onFileSelected]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <label 
        htmlFor="file-upload" 
        className={`
          relative flex flex-col items-center justify-center w-full h-64 
          border-2 border-dashed rounded-xl cursor-pointer 
          transition-all duration-300 ease-in-out
          ${isProcessing 
            ? "bg-slate-50 border-slate-300 cursor-not-allowed opacity-70" 
            : "bg-white border-slate-300 hover:bg-indigo-50 hover:border-indigo-400 shadow-sm hover:shadow-md"}
        `}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {isProcessing ? (
            <Loader2 className="w-12 h-12 mb-4 text-indigo-600 animate-spin" />
          ) : (
            <UploadCloud className="w-12 h-12 mb-4 text-indigo-500" />
          )}
          
          <p className="mb-2 text-lg font-semibold text-slate-700">
            {isProcessing ? "Procesando Documento..." : "Cargar Listado PDF"}
          </p>
          <p className="text-sm text-slate-500">
            {isProcessing ? "La IA está leyendo el archivo" : "Click para buscar o arrastra el archivo aquí"}
          </p>
        </div>
        <input 
          id="file-upload" 
          type="file" 
          accept="application/pdf" 
          className="hidden" 
          onChange={handleFileChange}
          disabled={isProcessing}
        />
      </label>
    </div>
  );
};
