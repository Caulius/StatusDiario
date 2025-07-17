import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import DateSelector from './DateSelector';
import { Truck, Clock, CheckCircle, FileText, BarChart3, Eye } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { selectedDate, setSelectedDate, dailyPrograms, dailyStatus, updateDailyProgram } = useApp();
  const [showTransitVehicles, setShowTransitVehicles] = React.useState(false);

  const dashboardData = useMemo(() => {
    const dayPrograms = dailyPrograms.filter(p => p.date === selectedDate);
    const dayStatus = dailyStatus.filter(s => s.date === selectedDate);
    
    let scheduledVehicles = 0;
    let transitVehicles = 0;
    let completedPrograms = 0;
    
    dayPrograms.forEach(program => {
      scheduledVehicles += program.vehicles.length;
      transitVehicles += program.vehicles.filter(v => v.status === 'Em Trânsito').length;
      if (program.vehicles.every(v => v.status === 'Concluído')) {
        completedPrograms++;
      }
    });

    return {
      scheduledVehicles,
      transitVehicles,
      completedPrograms,
      totalPrograms: dayPrograms.length,
      pendingStatus: dayStatus.filter(s => s.status === 'Pendente').length,
      completedStatus: dayStatus.filter(s => s.status === 'Concluído').length
    };
  }, [selectedDate, dailyPrograms, dailyStatus]);

  const transitVehicles = useMemo(() => {
    const dayPrograms = dailyPrograms.filter(p => p.date === selectedDate);
    const vehicles: Array<{
      programId: string;
      programName: string;
      vehicleId: string;
      plate: string;
      driver: string;
      origin: string;
      destinations: string[];
    }> = [];

    dayPrograms.forEach(program => {
      program.vehicles.forEach(vehicle => {
        if (vehicle.status === 'Em Trânsito') {
          vehicles.push({
            programId: program.id,
            programName: program.name,
            vehicleId: vehicle.id,
            plate: vehicle.plate,
            driver: vehicle.driver,
            origin: vehicle.origin,
            destinations: vehicle.destinations.map(d => d.destination)
          });
        }
      });
    });

    return vehicles;
  }, [selectedDate, dailyPrograms]);

  const handleCompleteVehicle = (programId: string, vehicleId: string) => {
    const program = dailyPrograms.find(p => p.id === programId);
    if (program) {
      const updatedProgram = {
        ...program,
        vehicles: program.vehicles.map(v => 
          v.id === vehicleId ? { ...v, status: 'Concluído' as const } : v
        )
      };
      updateDailyProgram(programId, updatedProgram);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
  };

  const cards = [
    {
      title: 'Veículos Programados',
      value: dashboardData.scheduledVehicles,
      icon: Truck,
      color: 'bg-blue-600',
    },
    {
      title: 'Veículos em Trânsito',
      value: dashboardData.transitVehicles,
      icon: Clock,
      color: 'bg-yellow-600',
      onClick: () => setShowTransitVehicles(true),
    },
    {
      title: 'Programações Finalizadas',
      value: dashboardData.completedPrograms,
      icon: CheckCircle,
      color: 'bg-green-600',
    },
    {
      title: 'Total de Programações',
      value: dashboardData.totalPrograms,
      icon: BarChart3,
      color: 'bg-purple-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <DateSelector 
          selectedDate={selectedDate} 
          onDateChange={setSelectedDate} 
        />
      </div>

      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-300 mb-6">
          Dados do dia {formatDate(selectedDate)}
        </h3>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-orange-500 transition-colors ${
                card.onClick ? 'cursor-pointer' : ''
              }`}
              onClick={card.onClick}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">{card.title}</p>
                  <p className="text-3xl font-bold text-white mt-2">{card.value}</p>
                </div>
                <div className={`${card.color} rounded-full p-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              {card.onClick && (
                <div className="mt-2 text-xs text-gray-400 flex items-center">
                  <Eye className="w-3 h-3 mr-1" />
                  Clique para visualizar
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Status Overview */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h4 className="text-xl font-semibold text-white mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-orange-500" />
          Status Diário
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-700">
            <div className="flex items-center justify-between">
              <span className="text-yellow-400 font-medium">Operações Pendentes</span>
              <span className="text-2xl font-bold text-yellow-400">
                {dashboardData.pendingStatus}
              </span>
            </div>
          </div>
          <div className="bg-green-900/20 rounded-lg p-4 border border-green-700">
            <div className="flex items-center justify-between">
              <span className="text-green-400 font-medium">Operações Concluídas</span>
              <span className="text-2xl font-bold text-green-400">
                {dashboardData.completedStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h4 className="text-xl font-semibold text-white mb-4">Progresso do Dia</h4>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-gray-400 mb-1">
              <span>Programações Concluídas</span>
              <span>{dashboardData.completedPrograms}/{dashboardData.totalPrograms}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: dashboardData.totalPrograms > 0 
                    ? `${(dashboardData.completedPrograms / dashboardData.totalPrograms) * 100}%` 
                    : '0%'
                }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm text-gray-400 mb-1">
              <span>Status Diário Concluído</span>
              <span>{dashboardData.completedStatus}/{dashboardData.pendingStatus + dashboardData.completedStatus}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: (dashboardData.pendingStatus + dashboardData.completedStatus) > 0 
                    ? `${(dashboardData.completedStatus / (dashboardData.pendingStatus + dashboardData.completedStatus)) * 100}%` 
                    : '0%'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Transit Vehicles Modal */}
      {showTransitVehicles && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center">
                <Clock className="w-5 h-5 mr-2 text-yellow-500" />
                Veículos em Trânsito ({transitVehicles.length})
              </h3>
              <button
                onClick={() => setShowTransitVehicles(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {transitVehicles.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p>Nenhum veículo em trânsito no momento</p>
                </div>
              ) : (
                transitVehicles.map((vehicle) => (
                  <div key={`${vehicle.programId}-${vehicle.vehicleId}`} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-white">{vehicle.plate}</h4>
                        <p className="text-sm text-gray-400">{vehicle.programName}</p>
                      </div>
                      <button
                        onClick={() => handleCompleteVehicle(vehicle.programId, vehicle.vehicleId)}
                        className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                      >
                        Marcar como Concluído
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-300">
                          <strong>Motorista:</strong> {vehicle.driver}
                        </p>
                        <p className="text-gray-300">
                          <strong>Origem:</strong> {vehicle.origin}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-300">
                          <strong>Destinos:</strong>
                        </p>
                        <ul className="ml-4 text-gray-400">
                          {vehicle.destinations.map((dest, index) => (
                            <li key={index}>• {dest}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowTransitVehicles(false)}
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

export default Dashboard;