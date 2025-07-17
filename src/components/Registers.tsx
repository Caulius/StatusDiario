import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Edit2, Trash2, Save, X, User, Truck, Settings, Building, MapPin } from 'lucide-react';

const Registers: React.FC = () => {
  const { 
    drivers, vehicles, operations, industries, origins, destinations,
    addDriver, updateDriver, deleteDriver,
    addVehicle, updateVehicle, deleteVehicle,
    addOperation, updateOperation, deleteOperation,
    addIndustry, updateIndustry, deleteIndustry,
    addOrigin, updateOrigin, deleteOrigin,
    addDestination, updateDestination, deleteDestination
  } = useApp();

  const [activeTab, setActiveTab] = useState('drivers');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<any>(null);

  const tabs = [
    { id: 'drivers', label: 'Motoristas', icon: User },
    { id: 'vehicles', label: 'Veículos', icon: Truck },
    { id: 'operations', label: 'Operações', icon: Settings },
    { id: 'industries', label: 'Indústrias', icon: Building },
    { id: 'origins', label: 'Origens', icon: MapPin },
    { id: 'destinations', label: 'Destinos', icon: MapPin },
  ];

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setEditingData({ ...item });
  };

  const handleSave = () => {
    if (!editingData) return;

    const { id, ...data } = editingData;

    switch (activeTab) {
      case 'drivers':
        if (id) {
          updateDriver(id, data);
        } else {
          addDriver(data);
        }
        break;
      case 'vehicles':
        if (id) {
          updateVehicle(id, data);
        } else {
          addVehicle(data);
        }
        break;
      case 'operations':
        if (id) {
          updateOperation(id, data);
        } else {
          addOperation(data);
        }
        break;
      case 'industries':
        if (id) {
          updateIndustry(id, data);
        } else {
          addIndustry(data);
        }
        break;
      case 'origins':
        if (id) {
          updateOrigin(id, data);
        } else {
          addOrigin(data);
        }
        break;
      case 'destinations':
        if (id) {
          updateDestination(id, data);
        } else {
          addDestination(data);
        }
        break;
    }

    setEditingId(null);
    setEditingData(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingData(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este registro?')) return;

    switch (activeTab) {
      case 'drivers':
        deleteDriver(id);
        break;
      case 'vehicles':
        deleteVehicle(id);
        break;
      case 'operations':
        deleteOperation(id);
        break;
      case 'industries':
        deleteIndustry(id);
        break;
      case 'origins':
        deleteOrigin(id);
        break;
      case 'destinations':
        deleteDestination(id);
        break;
    }
  };

  const handleAddNew = () => {
    let newItem: any = { id: '' };
    
    switch (activeTab) {
      case 'drivers':
        newItem = { id: '', name: '', phone: '' };
        break;
      case 'vehicles':
        newItem = { id: '', plate: '', model: '' };
        break;
      case 'operations':
      case 'industries':
      case 'origins':
      case 'destinations':
        newItem = { id: '', name: '' };
        break;
    }

    setEditingId('new');
    setEditingData(newItem);
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'drivers':
        return drivers;
      case 'vehicles':
        return vehicles;
      case 'operations':
        return operations;
      case 'industries':
        return industries;
      case 'origins':
        return origins;
      case 'destinations':
        return destinations;
      default:
        return [];
    }
  };

  const getColumns = () => {
    switch (activeTab) {
      case 'drivers':
        return [
          { key: 'name', label: 'Nome', type: 'text' },
          { key: 'phone', label: 'Telefone', type: 'text' },
        ];
      case 'vehicles':
        return [
          { key: 'plate', label: 'Placa', type: 'text' },
          { key: 'model', label: 'Modelo', type: 'text' },
        ];
      case 'operations':
      case 'industries':
      case 'origins':
      case 'destinations':
        return [
          { key: 'name', label: 'Nome', type: 'text' },
        ];
      default:
        return [];
    }
  };

  const data = getCurrentData();
  const columns = getColumns();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Cadastros</h2>
        <button
          onClick={handleAddNew}
          className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="border-b border-gray-700">
          <nav className="flex space-x-8 overflow-x-auto p-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-500'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Add New Form */}
          {editingId === 'new' && (
            <div className="bg-gray-700 rounded-lg p-4 mb-6 border border-gray-600">
              <h3 className="text-lg font-semibold text-white mb-4">
                Adicionar {tabs.find(t => t.id === activeTab)?.label.slice(0, -1)}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {columns.map((column) => (
                  <div key={column.key}>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      {column.label}
                    </label>
                    <input
                      type={column.type}
                      value={editingData?.[column.key] || ''}
                      onChange={(e) => setEditingData({
                        ...editingData,
                        [column.key]: e.target.value
                      })}
                      className="w-full bg-gray-600 text-white px-3 py-2 rounded-md border border-gray-500 focus:border-orange-500 focus:outline-none"
                      placeholder={`Digite ${column.label.toLowerCase()}`}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-end space-x-4 mt-4">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                >
                  Salvar
                </button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-300">
              <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                <tr>
                  {columns.map((column) => (
                    <th key={column.key} className="px-6 py-3">
                      {column.label}
                    </th>
                  ))}
                  <th className="px-6 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-750">
                    {columns.map((column) => (
                      <td key={column.key} className="px-6 py-4">
                        {editingId === item.id ? (
                          <input
                            type={column.type}
                            value={editingData?.[column.key] || ''}
                            onChange={(e) => setEditingData({
                              ...editingData,
                              [column.key]: e.target.value
                            })}
                            className="w-full bg-gray-600 text-white px-3 py-2 rounded-md border border-gray-500 focus:border-orange-500 focus:outline-none"
                          />
                        ) : (
                          <span className="text-sm">{item[column.key]}</span>
                        )}
                      </td>
                    ))}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {editingId === item.id ? (
                          <>
                            <button
                              onClick={handleSave}
                              className="text-green-400 hover:text-green-300 transition-colors"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleCancel}
                              className="text-gray-400 hover:text-gray-300 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEdit(item)}
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <p>Nenhum registro encontrado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Registers;