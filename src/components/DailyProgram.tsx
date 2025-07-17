import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import DateSelector from './DateSelector';
import { Calendar, Plus, Edit2, Trash2, MessageSquare, Eye, EyeOff } from 'lucide-react';
import { DailyProgram as DailyProgramType, ProgramVehicle, ProgramDestination } from '../types';

const DailyProgram: React.FC = () => {
  const { 
    selectedDate, 
    setSelectedDate, 
    dailyPrograms, 
    addDailyProgram, 
    updateDailyProgram, 
    deleteDailyProgram,
    drivers,
    vehicles,
    importedData
  } = useApp();
  
  const [editingProgram, setEditingProgram] = useState<DailyProgramType | null>(null);
  const [showWhatsApp, setShowWhatsApp] = useState<string | null>(null);
  const [whatsAppMessage, setWhatsAppMessage] = useState('');

  const dayPrograms = dailyPrograms.filter(p => p.date === selectedDate);

  const generateWhatsAppMessage = (program: DailyProgramType) => {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString + 'T00:00:00');
      return date.toLocaleDateString('pt-BR');
    };

    let message = `🚛 *${program.name.toUpperCase()}*\n📅 Data: ${formatDate(program.date)}\n\n`;

    program.vehicles.forEach((vehicle, index) => {
      message += `🚚 Veículo ${index + 1}:\n`;
      message += `   *Placa: ${vehicle.plate}*\n`;
      message += `   👤 Motorista: ${vehicle.driver}\n`;
      message += `   📍 Origem: ${vehicle.origin}\n`;
      
      if (vehicle.originTime) {
        message += `   🕐 Horário: ${vehicle.originTime}\n`;
      }

      vehicle.destinations.forEach((dest, destIndex) => {
        message += `   🎯 Destino ${destIndex + 1}: ${dest.destination}\n`;
        if (dest.time) {
          message += `   🕐 Horário: ${dest.time}\n`;
        }
        if (dest.observation) {
          message += `   💬 Obs: ${dest.observation}\n`;
        }
      });

      message += '\n';
    });

    message += `📈 Total de veículos: ${program.vehicles.length}`;

    return message;
  };

  const handleEditProgram = (program: DailyProgramType) => {
    setEditingProgram(program);
  };

  const handleSaveProgram = (program: DailyProgramType) => {
    if (program.id) {
      updateDailyProgram(program.id, program);
    } else {
      addDailyProgram(program);
    }
    setEditingProgram(null);
  };

  const handleDeleteProgram = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta programação?')) {
      deleteDailyProgram(id);
    }
  };

  const handleShowWhatsApp = (program: DailyProgramType) => {
    const message = generateWhatsAppMessage(program);
    setWhatsAppMessage(message);
    setShowWhatsApp(program.id);
  };

  const ProgramForm: React.FC<{ program: DailyProgramType | null, onSave: (program: DailyProgramType) => void, onCancel: () => void }> = ({ program, onSave, onCancel }) => {
    const [formData, setFormData] = useState<DailyProgramType>(
      program || {
        id: '',
        name: '',
        date: selectedDate,
        vehicles: [{
          id: Date.now().toString(),
          plate: '',
          driver: '',
          origin: '',
          originTime: '',
          destinations: [{ destination: '', time: '', observation: '' }],
          transportSAPs: [''],
          status: 'Em Trânsito'
        }]
      }
    );

    const addVehicle = () => {
      setFormData({
        ...formData,
        vehicles: [...formData.vehicles, {
          id: Date.now().toString(),
          plate: '',
          driver: '',
          origin: '',
          originTime: '',
          destinations: [{ destination: '', time: '', observation: '' }],
          status: 'Em Trânsito'
        }]
      });
    };

    const removeVehicle = (vehicleId: string) => {
      setFormData({
        ...formData,
        vehicles: formData.vehicles.filter(v => v.id !== vehicleId)
      });
    };

    const updateVehicle = (vehicleId: string, updates: Partial<ProgramVehicle>) => {
      setFormData({
        ...formData,
        vehicles: formData.vehicles.map(v => 
          v.id === vehicleId ? { ...v, ...updates } : v
        )
      });
    };

    const addDestination = (vehicleId: string) => {
      updateVehicle(vehicleId, {
        destinations: [...formData.vehicles.find(v => v.id === vehicleId)!.destinations, {
          destination: '',
          time: '',
          observation: ''
        }]
      });
    };

    const removeDestination = (vehicleId: string, destIndex: number) => {
      const vehicle = formData.vehicles.find(v => v.id === vehicleId)!;
      updateVehicle(vehicleId, {
        destinations: vehicle.destinations.filter((_, index) => index !== destIndex)
      });
    };

    const updateDestination = (vehicleId: string, destIndex: number, updates: Partial<ProgramDestination>) => {
      const vehicle = formData.vehicles.find(v => v.id === vehicleId)!;
      updateVehicle(vehicleId, {
        destinations: vehicle.destinations.map((dest, index) => 
          index === destIndex ? { ...dest, ...updates } : dest
        )
      });
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
    };

    const availableTransports = importedData.filter(data => data.date === selectedDate);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <h3 className="text-xl font-bold text-white mb-4">
            {program ? 'Editar Programação' : 'Nova Programação'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nome da Programação
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-orange-500 focus:outline-none"
                placeholder="Ex: PROGRAMAÇÃO DIÁRIA 1"
                required
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-white">Veículos</h4>
                <button
                  type="button"
                  onClick={addVehicle}
                  className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Veículo</span>
                </button>
              </div>

              {formData.vehicles.map((vehicle, vehicleIndex) => (
                <div key={vehicle.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-md font-semibold text-white">Veículo {vehicleIndex + 1}</h5>
                    {formData.vehicles.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVehicle(vehicle.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Placa</label>
                      <select
                        value={vehicle.plate}
                        onChange={(e) => updateVehicle(vehicle.id, { plate: e.target.value })}
                        className="w-full bg-gray-600 text-white px-3 py-2 rounded-md border border-gray-500 focus:border-orange-500 focus:outline-none"
                        required
                      >
                        <option value="">Selecione a placa</option>
                        {vehicles.map(v => (
                          <option key={v.id} value={v.plate}>{v.plate} - {v.model}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Motorista</label>
                      <select
                        value={vehicle.driver}
                        onChange={(e) => updateVehicle(vehicle.id, { driver: e.target.value })}
                        className="w-full bg-gray-600 text-white px-3 py-2 rounded-md border border-gray-500 focus:border-orange-500 focus:outline-none"
                        required
                      >
                        <option value="">Selecione o motorista</option>
                        {drivers.map(d => (
                          <option key={d.id} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Origem *</label>
                      <input
                        type="text"
                        value={vehicle.origin}
                        onChange={(e) => updateVehicle(vehicle.id, { origin: e.target.value })}
                        className="w-full bg-gray-600 text-white px-3 py-2 rounded-md border border-gray-500 focus:border-orange-500 focus:outline-none"
                        placeholder="Local de partida"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Horário de Partida *</label>
                      <input
                        type="time"
                        value={vehicle.originTime}
                        onChange={(e) => updateVehicle(vehicle.id, { originTime: e.target.value })}
                        className="w-full bg-gray-600 text-white px-3 py-2 rounded-md border border-gray-500 focus:border-orange-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Transporte SAP (Opcional)</label>
                      <div className="space-y-2">
                        {(vehicle.transportSAPs || []).map((transportSAP, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <select
                              value={transportSAP}
                              onChange={(e) => {
                                const newTransportSAPs = [...vehicle.transportSAPs];
                                newTransportSAPs[index] = e.target.value;
                                updateVehicle(vehicle.id, { transportSAPs: newTransportSAPs });
                              }}
                              className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-md border border-gray-500 focus:border-orange-500 focus:outline-none"
                            >
                              <option value="">Selecione um transporte SAP</option>
                              {availableTransports.map(transport => (
                                <option key={transport.transportSAP} value={transport.transportSAP}>
                                  {transport.transportSAP} - {transport.routes}
                                </option>
                              ))}
                            </select>
                            {(vehicle.transportSAPs || []).length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newTransportSAPs = vehicle.transportSAPs.filter((_, i) => i !== index);
                                  updateVehicle(vehicle.id, { transportSAPs: newTransportSAPs });
                                }}
                                className="text-red-400 hover:text-red-300 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            updateVehicle(vehicle.id, { 
                              transportSAPs: [...(vehicle.transportSAPs || []), ''] 
                            });
                          }}
                          className="flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors text-sm"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Adicionar Transporte SAP</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                      <select
                        value={vehicle.status}
                        onChange={(e) => updateVehicle(vehicle.id, { status: e.target.value as 'Em Trânsito' | 'Concluído' })}
                        className="w-full bg-gray-600 text-white px-3 py-2 rounded-md border border-gray-500 focus:border-orange-500 focus:outline-none"
                      >
                        <option value="Em Trânsito">Em Trânsito</option>
                        <option value="Concluído">Concluído</option>
                      </select>
                    </div>
                  </div>

                  {(vehicle.transportSAPs || []).some(t => t) && (
                    <div className="mb-4 p-3 bg-gray-600 rounded-md">
                      <div className="space-y-1">
                        {(vehicle.transportSAPs || []).filter(t => t).map((transportSAP, index) => {
                          const transport = availableTransports.find(t => t.transportSAP === transportSAP);
                          return (
                            <div key={index}>
                              <p className="text-sm text-gray-300">
                                <strong>Transporte {index + 1}:</strong> {transportSAP}
                              </p>
                              {transport && (
                                <p className="text-sm text-gray-400 ml-4">
                                  {transport.routes} - {transport.weight.toLocaleString('pt-BR')} kg
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {vehicle.routes && (
                    <div className="mb-4 p-3 bg-gray-600 rounded-md">
                        <p className="text-sm text-gray-300">
                          <strong>Rota:</strong> {vehicle.routes}
                        </p>
                        {vehicle.weight && (
                          <p className="text-sm text-gray-300">
                            <strong>Peso:</strong> {vehicle.weight.toLocaleString('pt-BR')} kg
                          </p>
                        )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h6 className="text-sm font-semibold text-gray-300">Destinos</h6>
                      <button
                        type="button"
                        onClick={() => addDestination(vehicle.id)}
                        className="flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors text-sm"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Adicionar Destino</span>
                      </button>
                    </div>

                    {vehicle.destinations.map((dest, destIndex) => (
                      <div key={destIndex} className="bg-gray-600 rounded-md p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-300">Destino {destIndex + 1}</span>
                          {vehicle.destinations.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeDestination(vehicle.id, destIndex)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={dest.destination}
                            onChange={(e) => updateDestination(vehicle.id, destIndex, { destination: e.target.value })}
                            className="bg-gray-500 text-white px-3 py-2 rounded-md border border-gray-400 focus:border-orange-500 focus:outline-none text-sm"
                            placeholder="Destino"
                            required
                          />
                          <input
                            type="time"
                            value={dest.time || ''}
                            onChange={(e) => updateDestination(vehicle.id, destIndex, { time: e.target.value })}
                            className="bg-gray-500 text-white px-3 py-2 rounded-md border border-gray-400 focus:border-orange-500 focus:outline-none text-sm"
                            placeholder="Horário (opcional)"
                          />
                          <input
                            type="text"
                            value={dest.observation || ''}
                            onChange={(e) => updateDestination(vehicle.id, destIndex, { observation: e.target.value })}
                            className="bg-gray-500 text-white px-3 py-2 rounded-md border border-gray-400 focus:border-orange-500 focus:outline-none text-sm"
                            placeholder="Observação (opcional)"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
              >
                Salvar Programação
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Programação Diária</h2>
        <div className="flex items-center space-x-4">
          <DateSelector 
            selectedDate={selectedDate} 
            onDateChange={setSelectedDate} 
          />
          <button
            onClick={() => setEditingProgram({
              id: '',
              name: '',
              date: selectedDate,
              vehicles: []
            })}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Programação</span>
          </button>
        </div>
      </div>

      {/* Programs List */}
      <div className="space-y-4">
        {dayPrograms.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">Nenhuma programação encontrada para esta data</p>
          </div>
        ) : (
          dayPrograms.map((program) => (
            <div key={program.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">{program.name}</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleShowWhatsApp(program)}
                    className="flex items-center space-x-2 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={() => handleEditProgram(program)}
                    className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => handleDeleteProgram(program.id)}
                    className="flex items-center space-x-2 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Excluir</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {program.vehicles.map((vehicle, index) => (
                  <div key={vehicle.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white">Veículo {index + 1}</h4>
                      <button
                        onClick={() => {
                          const newStatus = vehicle.status === 'Em Trânsito' ? 'Concluído' : 'Em Trânsito';
                          const updatedProgram = {
                            ...program,
                            vehicles: program.vehicles.map(v => 
                              v.id === vehicle.id ? { ...v, status: newStatus } : v
                            )
                          };
                          updateDailyProgram(program.id, updatedProgram);
                        }}
                        className={`px-2 py-1 rounded-full text-xs font-medium transition-colors hover:opacity-80 ${
                        vehicle.status === 'Concluído' 
                          ? 'bg-green-900 text-green-300' 
                          : 'bg-yellow-900 text-yellow-300'
                        }`}
                      >
                        {vehicle.status}
                      </button>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-300">
                        <strong>Placa:</strong> {vehicle.plate}
                      </p>
                      <p className="text-gray-300">
                        <strong>Motorista:</strong> {vehicle.driver}
                      </p>
                      <p className="text-gray-300">
                        <strong>Origem:</strong> {vehicle.origin} ({vehicle.originTime})
                      </p>
                      
                      {(vehicle.transportSAPs || []).some(t => t) && (
                        <div className="space-y-1">
                          <strong className="text-gray-300">Transportes:</strong>
                          {(vehicle.transportSAPs || []).filter(t => t).map((transportSAP, index) => (
                            <div key={index} className="ml-2 text-gray-400">
                              • {transportSAP}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {vehicle.routes && (
                        <p className="text-gray-300">
                          <strong>Rota:</strong> {vehicle.routes}
                        </p>
                      )}
                      
                      {vehicle.weight && (
                        <p className="text-gray-300">
                          <strong>Peso:</strong> {vehicle.weight.toLocaleString('pt-BR')} kg
                        </p>
                      )}
                      
                      <div className="space-y-1">
                        <strong className="text-gray-300">Destinos:</strong>
                        {vehicle.destinations.map((dest, destIndex) => (
                          <div key={destIndex} className="ml-2 text-gray-400">
                            • {dest.destination}
                            {dest.time && ` (${dest.time})`}
                            {dest.observation && ` - ${dest.observation}`}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Program Modal */}
      {editingProgram && (
        <ProgramForm
          program={editingProgram}
          onSave={handleSaveProgram}
          onCancel={() => setEditingProgram(null)}
        />
      )}

      {/* WhatsApp Modal */}
      {showWhatsApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-green-500" />
                Mensagem WhatsApp
              </h3>
              <button
                onClick={() => setShowWhatsApp(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <EyeOff className="w-5 h-5" />
              </button>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4 mb-4">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                {whatsAppMessage}
              </pre>
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => navigator.clipboard.writeText(whatsAppMessage)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Copiar Mensagem
              </button>
              <button
                onClick={() => setShowWhatsApp(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyProgram;