import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import DateSelector from './DateSelector';
import { Plus, Trash2, Download, Calendar, ChevronUp, ChevronDown } from 'lucide-react';
import { DailyStatus as DailyStatusType } from '../types';

const DailyStatus: React.FC = () => {
  const { 
    selectedDate, 
    setSelectedDate, 
    dailyStatus,
    importedData,
    addDailyStatus,
    updateDailyStatus,
    deleteDailyStatus,
    operations,
    industries,
    origins,
    destinations
  } = useApp();

  const [sortConfig, setSortConfig] = useState<{
    key: keyof DailyStatusType | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });

  const [editingCell, setEditingCell] = useState<{
    id: string;
    field: keyof DailyStatusType;
  } | null>(null);

  const [reportType, setReportType] = useState<'daily' | 'monthly'>('daily');
  const [reportMonth, setReportMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  const dayStatus = dailyStatus.filter(s => s.date === selectedDate);
  const dayImportedData = importedData.filter(i => i.date === selectedDate);

  // Auto-populate from imported data
  React.useEffect(() => {
    dayImportedData.forEach(importedItem => {
      const existingStatus = dayStatus.find(s => s.transportSAP === importedItem.transportSAP);
      if (!existingStatus) {
        const newStatus: DailyStatusType = {
          id: '',
          operation: '',
          number: '',
          industry: '',
          scheduledTime: '',
          plate: '',
          driver: '',
          origin: '',
          destination: '',
          transportSAP: importedItem.transportSAP,
          routes: importedItem.routes,
          weight: importedItem.weight,
          boxes: importedItem.boxes,
          responsible: '',
          start: '',
          end: '',
          refrigPallets: 0,
          dryPallets: 0,
          totalPallets: 0,
          separation: '',
          observation: '',
          termoPallet: '',
          cte: '',
          mdfe: '',
          ae: '',
          originDeparture: '',
          destinationArrival: '',
          docRelFin: false,
          docTermoPallet: false,
          docProtoc: false,
          docCanhotos: false,
          status: 'Pendente',
          date: selectedDate
        };
        addDailyStatus(newStatus);
      }
    });
  }, [dayImportedData, selectedDate]);

  const handleSort = (key: keyof DailyStatusType) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return dayStatus;

    return [...dayStatus].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      // Handle empty values - treat as high value for sorting
      const aEmpty = !aValue || aValue === '' || aValue === 0;
      const bEmpty = !bValue || bValue === '' || bValue === 0;

      if (aEmpty && bEmpty) return 0;
      if (aEmpty) return sortConfig.direction === 'asc' ? 1 : -1;
      if (bEmpty) return sortConfig.direction === 'asc' ? -1 : 1;

      // Normal sorting
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }, [dayStatus, sortConfig]);

  const handleCellClick = (id: string, field: keyof DailyStatusType) => {
    setEditingCell({ id, field });
  };

  const handleCellChange = (id: string, field: keyof DailyStatusType, value: any) => {
    const updates: Partial<DailyStatusType> = { [field]: value };
    
    // Auto-calculate total pallets
    if (field === 'refrigPallets' || field === 'dryPallets') {
      const item = dayStatus.find(s => s.id === id);
      if (item) {
        const refrigPallets = field === 'refrigPallets' ? value : item.refrigPallets;
        const dryPallets = field === 'dryPallets' ? value : item.dryPallets;
        updates.totalPallets = refrigPallets + dryPallets;
      }
    }
    
    updateDailyStatus(id, updates);
  };

  const handleCellBlur = () => {
    setEditingCell(null);
  };

  const handleAddNew = () => {
    const newStatus: DailyStatusType = {
      id: '',
      operation: '',
      number: '',
      industry: '',
      scheduledTime: '',
      plate: '',
      driver: '',
      origin: '',
      destination: '',
      transportSAP: '',
      routes: '',
      weight: 0,
      boxes: 0,
      responsible: '',
      start: '',
      end: '',
      refrigPallets: 0,
      dryPallets: 0,
      totalPallets: 0,
      separation: '',
      observation: '',
      termoPallet: '',
      cte: '',
      mdfe: '',
      ae: '',
      originDeparture: '',
      destinationArrival: '',
      docRelFin: false,
      docTermoPallet: false,
      docProtoc: false,
      docCanhotos: false,
      status: 'Pendente',
      date: selectedDate
    };

    addDailyStatus(newStatus);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este registro?')) {
      deleteDailyStatus(id);
    }
  };

  const generateReport = () => {
    let reportData: DailyStatusType[] = [];
    let reportTitle = '';

    if (reportType === 'daily') {
      reportData = dayStatus;
      reportTitle = `Relatório Diário - ${new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR')}`;
    } else {
      const [year, month] = reportMonth.split('-');
      reportData = dailyStatus.filter(s => s.date.startsWith(`${year}-${month}`));
      reportTitle = `Relatório Mensal - ${month}/${year}`;
    }

    // Generate CSV content
    const headers = columns.map(col => col.label).join(',');
    const rows = reportData.map(item => 
      columns.map(col => {
        const value = item[col.key as keyof DailyStatusType];
        if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
        return `"${value || ''}"`;
      }).join(',')
    ).join('\n');

    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${reportTitle.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    { key: 'operation', label: 'OPERAÇÃO', width: 120 },
    { key: 'number', label: 'Nº', width: 80 },
    { key: 'industry', label: 'INDÚSTRIA', width: 120 },
    { key: 'scheduledTime', label: 'HORÁRIO PREV.', width: 120 },
    { key: 'plate', label: 'PLACA', width: 100 },
    { key: 'driver', label: 'MOTORISTA', width: 120 },
    { key: 'origin', label: 'ORIGEM', width: 120 },
    { key: 'destination', label: 'DESTINO', width: 120 },
    { key: 'transportSAP', label: 'TRANSPORTE SAP', width: 140 },
    { key: 'routes', label: 'ROTAS', width: 200 },
    { key: 'weight', label: 'PESO', width: 100 },
    { key: 'boxes', label: 'CAIXAS', width: 80 },
    { key: 'responsible', label: 'RESPONSÁVEL', width: 120 },
    { key: 'start', label: 'INÍCIO', width: 120 },
    { key: 'end', label: 'FIM', width: 120 },
    { key: 'refrigPallets', label: 'PALLETS REFRIG.', width: 120 },
    { key: 'dryPallets', label: 'PALLETS SECOS', width: 120 },
    { key: 'totalPallets', label: 'QTD PALLETS', width: 100 },
    { key: 'separation', label: 'SEPARAÇÃO', width: 120 },
    { key: 'observation', label: 'OBSERVAÇÃO', width: 150 },
    { key: 'termoPallet', label: 'TERMO PALLET', width: 120 },
    { key: 'cte', label: 'CTE', width: 100 },
    { key: 'mdfe', label: 'MDFE', width: 100 },
    { key: 'ae', label: 'AE', width: 100 },
    { key: 'originDeparture', label: 'SAÍDA ORIGEM', width: 120 },
    { key: 'destinationArrival', label: 'CHEGADA DEST.', width: 120 },
    { key: 'docRelFin', label: 'DOC. REL. FIN.', width: 120 },
    { key: 'docTermoPallet', label: 'DOC. TERMO PALLET', width: 140 },
    { key: 'docProtoc', label: 'DOC PROTOC.', width: 120 },
    { key: 'docCanhotos', label: 'DOC CANHOTOS', width: 120 },
    { key: 'status', label: 'STATUS', width: 120 },
  ];

  const renderCell = (item: DailyStatusType, column: typeof columns[0]) => {
    const isEditing = editingCell?.id === item.id && editingCell?.field === column.key;
    
    if (column.key.startsWith('doc')) {
      return (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={item[column.key as keyof DailyStatusType] as boolean}
            onChange={(e) => handleCellChange(item.id, column.key as keyof DailyStatusType, e.target.checked)}
            className="w-4 h-4 text-orange-600 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
          />
        </div>
      );
    }
    
    if (column.key === 'status') {
      if (isEditing) {
        return (
          <select
            value={item.status}
            onChange={(e) => handleCellChange(item.id, 'status', e.target.value)}
            onBlur={handleCellBlur}
            autoFocus
            className="w-full bg-gray-600 text-white px-2 py-1 rounded text-sm border border-gray-500 focus:border-orange-500 focus:outline-none"
          >
            <option value="Pendente">Pendente</option>
            <option value="Concluído">Concluído</option>
          </select>
        );
      }
      
      return (
        <span 
          className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer ${
            item.status === 'Concluído' 
              ? 'bg-green-900 text-green-300' 
              : 'bg-yellow-900 text-yellow-300'
          }`}
          onClick={() => handleCellClick(item.id, 'status')}
        >
          {item.status}
        </span>
      );
    }

    if (column.key === 'totalPallets') {
      return (
        <span className="text-sm font-medium text-orange-400">
          {item.totalPallets}
        </span>
      );
    }

    if (isEditing) {
      if (column.key === 'operation') {
        return (
          <select
            value={item.operation}
            onChange={(e) => handleCellChange(item.id, 'operation', e.target.value)}
            onBlur={handleCellBlur}
            autoFocus
            className="w-full bg-gray-600 text-white px-2 py-1 rounded text-sm border border-gray-500 focus:border-orange-500 focus:outline-none"
          >
            <option value="">Selecione</option>
            {operations.map(op => (
              <option key={op.id} value={op.name}>{op.name}</option>
            ))}
          </select>
        );
      }

      if (column.key === 'industry') {
        return (
          <select
            value={item.industry}
            onChange={(e) => handleCellChange(item.id, 'industry', e.target.value)}
            onBlur={handleCellBlur}
            autoFocus
            className="w-full bg-gray-600 text-white px-2 py-1 rounded text-sm border border-gray-500 focus:border-orange-500 focus:outline-none"
          >
            <option value="">Selecione</option>
            {industries.map(ind => (
              <option key={ind.id} value={ind.name}>{ind.name}</option>
            ))}
          </select>
        );
      }

      if (column.key === 'origin') {
        return (
          <select
            value={item.origin}
            onChange={(e) => handleCellChange(item.id, 'origin', e.target.value)}
            onBlur={handleCellBlur}
            autoFocus
            className="w-full bg-gray-600 text-white px-2 py-1 rounded text-sm border border-gray-500 focus:border-orange-500 focus:outline-none"
          >
            <option value="">Selecione</option>
            {origins.map(orig => (
              <option key={orig.id} value={orig.name}>{orig.name}</option>
            ))}
          </select>
        );
      }

      if (column.key === 'destination') {
        return (
          <select
            value={item.destination}
            onChange={(e) => handleCellChange(item.id, 'destination', e.target.value)}
            onBlur={handleCellBlur}
            autoFocus
            className="w-full bg-gray-600 text-white px-2 py-1 rounded text-sm border border-gray-500 focus:border-orange-500 focus:outline-none"
          >
            <option value="">Selecione</option>
            {destinations.map(dest => (
              <option key={dest.id} value={dest.name}>{dest.name}</option>
            ))}
          </select>
        );
      }

      if (column.key === 'transportSAP') {
        return (
          <select
            value={item.transportSAP}
            onChange={(e) => {
              const selectedTransport = dayImportedData.find(t => t.transportSAP === e.target.value);
              handleCellChange(item.id, 'transportSAP', e.target.value);
              if (selectedTransport) {
                handleCellChange(item.id, 'routes', selectedTransport.routes);
                handleCellChange(item.id, 'weight', selectedTransport.weight);
                handleCellChange(item.id, 'boxes', selectedTransport.boxes);
              }
            }}
            onBlur={handleCellBlur}
            autoFocus
            className="w-full bg-gray-600 text-white px-2 py-1 rounded text-sm border border-gray-500 focus:border-orange-500 focus:outline-none"
          >
            <option value="">Selecione</option>
            {dayImportedData.map(transport => (
              <option key={transport.transportSAP} value={transport.transportSAP}>
                {transport.transportSAP}
              </option>
            ))}
          </select>
        );
      }

      if (column.key === 'scheduledTime' || column.key === 'start' || column.key === 'end') {
        return (
          <input
            type="time"
            value={item[column.key as keyof DailyStatusType]?.toString() || ''}
            onChange={(e) => handleCellChange(item.id, column.key as keyof DailyStatusType, e.target.value)}
            onBlur={handleCellBlur}
            autoFocus
            className="w-full bg-gray-600 text-white px-2 py-1 rounded text-sm border border-gray-500 focus:border-orange-500 focus:outline-none"
          />
        );
      }

      if (column.key === 'originDeparture' || column.key === 'destinationArrival') {
        return (
          <input
            type="datetime-local"
            value={item[column.key as keyof DailyStatusType]?.toString() || ''}
            onChange={(e) => handleCellChange(item.id, column.key as keyof DailyStatusType, e.target.value)}
            onBlur={handleCellBlur}
            autoFocus
            className="w-full bg-gray-600 text-white px-2 py-1 rounded text-sm border border-gray-500 focus:border-orange-500 focus:outline-none"
          />
        );
      }

      if (column.key === 'weight' || column.key === 'boxes' || column.key === 'refrigPallets' || column.key === 'dryPallets') {
        return (
          <input
            type="number"
            value={item[column.key as keyof DailyStatusType]?.toString() || ''}
            onChange={(e) => handleCellChange(item.id, column.key as keyof DailyStatusType, parseFloat(e.target.value) || 0)}
            onBlur={handleCellBlur}
            autoFocus
            className="w-full bg-gray-600 text-white px-2 py-1 rounded text-sm border border-gray-500 focus:border-orange-500 focus:outline-none"
          />
        );
      }

      return (
        <input
          type="text"
          value={item[column.key as keyof DailyStatusType]?.toString() || ''}
          onChange={(e) => handleCellChange(item.id, column.key as keyof DailyStatusType, e.target.value)}
          onBlur={handleCellBlur}
          autoFocus
          className="w-full bg-gray-600 text-white px-2 py-1 rounded text-sm border border-gray-500 focus:border-orange-500 focus:outline-none"
        />
      );
    }

    const value = item[column.key as keyof DailyStatusType];
    return (
      <span 
        className="text-sm cursor-pointer hover:bg-gray-700 px-1 py-1 rounded"
        onClick={() => handleCellClick(item.id, column.key as keyof DailyStatusType)}
      >
        {value?.toString() || ''}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Status Diário</h2>
        <div className="flex items-center space-x-4">
          <DateSelector 
            selectedDate={selectedDate} 
            onDateChange={setSelectedDate} 
          />
          <button
            onClick={handleAddNew}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar</span>
          </button>
        </div>
      </div>

      {/* Report Controls */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-300">Relatórios:</span>
            </div>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as 'daily' | 'monthly')}
              className="bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-orange-500 focus:outline-none text-sm"
            >
              <option value="daily">Diário</option>
              <option value="monthly">Mensal</option>
            </select>
            {reportType === 'monthly' && (
              <input
                type="month"
                value={reportMonth}
                onChange={(e) => setReportMonth(e.target.value)}
                className="bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-orange-500 focus:outline-none text-sm"
              />
            )}
          </div>
          <button
            onClick={generateReport}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-200px)]">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-gray-700 sticky top-0 z-10">
              <tr>
                {columns.map((column) => (
                  <th 
                    key={column.key} 
                    className="px-4 py-3 font-medium cursor-pointer hover:bg-gray-600 transition-colors"
                    style={{ minWidth: column.width }}
                    onClick={() => handleSort(column.key as keyof DailyStatusType)}
                  >
                    <div className="flex items-center justify-between">
                      <span>{column.label}</span>
                      <div className="flex flex-col">
                        <ChevronUp 
                          className={`w-3 h-3 ${
                            sortConfig.key === column.key && sortConfig.direction === 'asc' 
                              ? 'text-orange-500' 
                              : 'text-gray-500'
                          }`} 
                        />
                        <ChevronDown 
                          className={`w-3 h-3 ${
                            sortConfig.key === column.key && sortConfig.direction === 'desc' 
                              ? 'text-orange-500' 
                              : 'text-gray-500'
                          }`} 
                        />
                      </div>
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 font-medium w-32">AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((item) => (
                <tr key={item.id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-750">
                  {columns.map((column) => (
                    <td 
                      key={column.key} 
                      className="px-4 py-3"
                      style={{ minWidth: column.width }}
                    >
                      {renderCell(item, column)}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {sortedData.length === 0 && (
        <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
          <p className="text-gray-400">Nenhum registro encontrado para esta data</p>
        </div>
      )}
    </div>
  );
};

export default DailyStatus;