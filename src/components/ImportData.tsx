import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import DateSelector from './DateSelector';
import { Upload, Eye, Check, AlertCircle } from 'lucide-react';
import { ImportedData } from '../types';

const ImportData: React.FC = () => {
  const { selectedDate, setSelectedDate, importData } = useApp();
  const [pastedData, setPastedData] = useState('');
  const [previewData, setPreviewData] = useState<ImportedData[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  const parseData = (text: string): ImportedData[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const header = lines[0].split('\t');
    const data: ImportedData[] = [];

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split('\t');
      if (row.length >= 4) {
        data.push({
          transportSAP: row[0] || '',
          routes: row[1] || '',
          weight: parseFloat(row[2]?.replace(/[^\d,]/g, '').replace(',', '.')) || 0,
          boxes: parseInt(row[3]?.replace(/[^\d]/g, '')) || 0,
          date: selectedDate
        });
      }
    }

    return data;
  };

  const handlePaste = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setPastedData(text);
    
    if (text.trim()) {
      const parsed = parseData(text);
      setPreviewData(parsed);
      setShowPreview(true);
    } else {
      setPreviewData([]);
      setShowPreview(false);
    }
    setImportSuccess(false);
  };

  const handleImport = async () => {
    if (previewData.length === 0) return;

    setIsImporting(true);
    
    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    importData(previewData, selectedDate);
    setImportSuccess(true);
    setIsImporting(false);
    
    // Reset after success
    setTimeout(() => {
      setPastedData('');
      setPreviewData([]);
      setShowPreview(false);
      setImportSuccess(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Importação de Dados</h2>
        <DateSelector 
          selectedDate={selectedDate} 
          onDateChange={setSelectedDate} 
        />
      </div>

      {/* Instructions */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 text-orange-500" />
          Formato Esperado
        </h3>
        <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-300">
          <div className="grid grid-cols-4 gap-4 border-b border-gray-600 pb-2 mb-2">
            <div className="font-semibold text-orange-500">Transporte SAP</div>
            <div className="font-semibold text-orange-500">ROTAS</div>
            <div className="font-semibold text-orange-500">PESO</div>
            <div className="font-semibold text-orange-500">Caixas</div>
          </div>
          <div className="grid grid-cols-4 gap-4 text-xs">
            <div>52736285</div>
            <div>RAH8604-SC / BOA MESA</div>
            <div>4.965,30</div>
            <div>1.295</div>
          </div>
        </div>
      </div>

      {/* Paste Area */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Upload className="w-5 h-5 mr-2 text-orange-500" />
          Área de Colagem
        </h3>
        <textarea
          value={pastedData}
          onChange={handlePaste}
          placeholder="Cole aqui os dados do Excel (com cabeçalho)..."
          className="w-full h-32 bg-gray-700 text-white p-4 rounded-md border border-gray-600 focus:border-orange-500 focus:outline-none resize-none"
        />
      </div>

      {/* Preview */}
      {showPreview && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Eye className="w-5 h-5 mr-2 text-orange-500" />
            Pré-visualização ({previewData.length} registros)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-300">
              <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                <tr>
                  <th className="px-4 py-3">Transporte SAP</th>
                  <th className="px-4 py-3">Rotas</th>
                  <th className="px-4 py-3">Peso</th>
                  <th className="px-4 py-3">Caixas</th>
                </tr>
              </thead>
              <tbody>
                {previewData.slice(0, 10).map((item, index) => (
                  <tr key={index} className="bg-gray-800 border-b border-gray-700">
                    <td className="px-4 py-3 font-medium text-white">{item.transportSAP}</td>
                    <td className="px-4 py-3">{item.routes}</td>
                    <td className="px-4 py-3">{item.weight.toLocaleString('pt-BR')}</td>
                    <td className="px-4 py-3">{item.boxes.toLocaleString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {previewData.length > 10 && (
              <div className="text-center py-4 text-gray-400">
                ... e mais {previewData.length - 10} registros
              </div>
            )}
          </div>
        </div>
      )}

      {/* Import Button */}
      {showPreview && (
        <div className="flex justify-center">
          <button
            onClick={handleImport}
            disabled={isImporting || importSuccess}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
              importSuccess
                ? 'bg-green-600 text-white cursor-not-allowed'
                : isImporting
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-orange-600 text-white hover:bg-orange-700'
            }`}
          >
            {importSuccess ? (
              <>
                <Check className="w-5 h-5" />
                <span>Importado com Sucesso!</span>
              </>
            ) : isImporting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                <span>Importando...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>Confirmar Importação</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ImportData;