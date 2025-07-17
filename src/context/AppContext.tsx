import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Driver, 
  Vehicle, 
  Operation, 
  Industry, 
  Origin, 
  Destination, 
  ImportedData, 
  DailyStatus, 
  DailyProgram 
} from '../types';
import {
  driversService,
  vehiclesService,
  operationsService,
  industriesService,
  originsService,
  destinationsService,
  importedDataService,
  dailyStatusService,
  dailyProgramsService,
  importDataToFirebase
} from '../services/firebaseService';

interface AppContextType {
  drivers: Driver[];
  vehicles: Vehicle[];
  operations: Operation[];
  industries: Industry[];
  origins: Origin[];
  destinations: Destination[];
  importedData: ImportedData[];
  dailyStatus: DailyStatus[];
  dailyPrograms: DailyProgram[];
  selectedDate: string;
  loading: boolean;
  setSelectedDate: (date: string) => void;
  addDriver: (driver: Omit<Driver, 'id'>) => Promise<void>;
  updateDriver: (id: string, driver: Omit<Driver, 'id'>) => Promise<void>;
  deleteDriver: (id: string) => Promise<void>;
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Promise<void>;
  updateVehicle: (id: string, vehicle: Omit<Vehicle, 'id'>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  addOperation: (operation: Omit<Operation, 'id'>) => Promise<void>;
  updateOperation: (id: string, operation: Omit<Operation, 'id'>) => Promise<void>;
  deleteOperation: (id: string) => Promise<void>;
  addIndustry: (industry: Omit<Industry, 'id'>) => Promise<void>;
  updateIndustry: (id: string, industry: Omit<Industry, 'id'>) => Promise<void>;
  deleteIndustry: (id: string) => Promise<void>;
  addOrigin: (origin: Omit<Origin, 'id'>) => Promise<void>;
  updateOrigin: (id: string, origin: Omit<Origin, 'id'>) => Promise<void>;
  deleteOrigin: (id: string) => Promise<void>;
  addDestination: (destination: Omit<Destination, 'id'>) => Promise<void>;
  updateDestination: (id: string, destination: Omit<Destination, 'id'>) => Promise<void>;
  deleteDestination: (id: string) => Promise<void>;
  importData: (data: ImportedData[], date: string) => Promise<{ imported: number; duplicates: number; errors: string[] }>;
  addDailyStatus: (status: Omit<DailyStatus, 'id'>) => Promise<void>;
  updateDailyStatus: (id: string, status: Partial<DailyStatus>) => Promise<void>;
  deleteDailyStatus: (id: string) => Promise<void>;
  addDailyProgram: (program: Omit<DailyProgram, 'id'>) => Promise<void>;
  updateDailyProgram: (id: string, program: Omit<DailyProgram, 'id'>) => Promise<void>;
  deleteDailyProgram: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [origins, setOrigins] = useState<Origin[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [importedData, setImportedData] = useState<ImportedData[]>([]);
  const [dailyStatus, setDailyStatus] = useState<DailyStatus[]>([]);
  const [dailyPrograms, setDailyPrograms] = useState<DailyProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // Load initial data from Firebase
  const loadData = async () => {
    try {
      setLoading(true);
      const [
        driversData,
        vehiclesData,
        operationsData,
        industriesData,
        originsData,
        destinationsData,
        importedDataData,
        dailyStatusData,
        dailyProgramsData
      ] = await Promise.all([
        driversService.getAll(),
        vehiclesService.getAll(),
        operationsService.getAll(),
        industriesService.getAll(),
        originsService.getAll(),
        destinationsService.getAll(),
        importedDataService.getAll(),
        dailyStatusService.getAll(),
        dailyProgramsService.getAll()
      ]);

      setDrivers(driversData);
      setVehicles(vehiclesData);
      setOperations(operationsData);
      setIndustries(industriesData);
      setOrigins(originsData);
      setDestinations(destinationsData);
      setImportedData(importedDataData);
      setDailyStatus(dailyStatusData);
      setDailyPrograms(dailyProgramsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Refresh data function
  const refreshData = async () => {
    await loadData();
  };

  // Função para verificar se um registro já existe
  const isDuplicateRecord = (newRecord: ImportedData, existingData: ImportedData[]): boolean => {
    return existingData.some(existing => {
      // Verifica duplicatas baseado em campos únicos
      // Ajuste estes campos conforme a estrutura do seu ImportedData
      return (
        existing.transporteSAP === newRecord.transporteSAP &&
        existing.rota === newRecord.rota &&
        existing.date === newRecord.date
      );
    });
  };

  // Função para gerar uma chave única para identificar duplicatas
  const generateRecordKey = (record: ImportedData): string => {
    // Ajuste conforme os campos disponíveis no seu ImportedData
    return `${record.transporteSAP || ''}-${record.rota || ''}-${record.date || ''}`;
  };

  // Driver functions
  const addDriver = async (driver: Omit<Driver, 'id'>) => {
    try {
      const id = await driversService.add(driver);
      setDrivers(prev => [...prev, { ...driver, id }]);
    } catch (error) {
      console.error('Error adding driver:', error);
      throw error;
    }
  };

  const updateDriver = async (id: string, driver: Omit<Driver, 'id'>) => {
    try {
      await driversService.update(id, driver);
      setDrivers(prev => prev.map(d => d.id === id ? { ...driver, id } : d));
    } catch (error) {
      console.error('Error updating driver:', error);
      throw error;
    }
  };

  const deleteDriver = async (id: string) => {
    try {
      await driversService.delete(id);
      setDrivers(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      console.error('Error deleting driver:', error);
      throw error;
    }
  };

  // Vehicle functions
  const addVehicle = async (vehicle: Omit<Vehicle, 'id'>) => {
    try {
      const id = await vehiclesService.add(vehicle);
      setVehicles(prev => [...prev, { ...vehicle, id }]);
    } catch (error) {
      console.error('Error adding vehicle:', error);
      throw error;
    }
  };

  const updateVehicle = async (id: string, vehicle: Omit<Vehicle, 'id'>) => {
    try {
      await vehiclesService.update(id, vehicle);
      setVehicles(prev => prev.map(v => v.id === id ? { ...vehicle, id } : v));
    } catch (error) {
      console.error('Error updating vehicle:', error);
      throw error;
    }
  };

  const deleteVehicle = async (id: string) => {
    try {
      await vehiclesService.delete(id);
      setVehicles(prev => prev.filter(v => v.id !== id));
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      throw error;
    }
  };

  // Operation functions
  const addOperation = async (operation: Omit<Operation, 'id'>) => {
    try {
      const id = await operationsService.add(operation);
      setOperations(prev => [...prev, { ...operation, id }]);
    } catch (error) {
      console.error('Error adding operation:', error);
      throw error;
    }
  };

  const updateOperation = async (id: string, operation: Omit<Operation, 'id'>) => {
    try {
      await operationsService.update(id, operation);
      setOperations(prev => prev.map(o => o.id === id ? { ...operation, id } : o));
    } catch (error) {
      console.error('Error updating operation:', error);
      throw error;
    }
  };

  const deleteOperation = async (id: string) => {
    try {
      await operationsService.delete(id);
      setOperations(prev => prev.filter(o => o.id !== id));
    } catch (error) {
      console.error('Error deleting operation:', error);
      throw error;
    }
  };

  // Industry functions
  const addIndustry = async (industry: Omit<Industry, 'id'>) => {
    try {
      const id = await industriesService.add(industry);
      setIndustries(prev => [...prev, { ...industry, id }]);
    } catch (error) {
      console.error('Error adding industry:', error);
      throw error;
    }
  };

  const updateIndustry = async (id: string, industry: Omit<Industry, 'id'>) => {
    try {
      await industriesService.update(id, industry);
      setIndustries(prev => prev.map(i => i.id === id ? { ...industry, id } : i));
    } catch (error) {
      console.error('Error updating industry:', error);
      throw error;
    }
  };

  const deleteIndustry = async (id: string) => {
    try {
      await industriesService.delete(id);
      setIndustries(prev => prev.filter(i => i.id !== id));
    } catch (error) {
      console.error('Error deleting industry:', error);
      throw error;
    }
  };

  // Origin functions
  const addOrigin = async (origin: Omit<Origin, 'id'>) => {
    try {
      const id = await originsService.add(origin);
      setOrigins(prev => [...prev, { ...origin, id }]);
    } catch (error) {
      console.error('Error adding origin:', error);
      throw error;
    }
  };

  const updateOrigin = async (id: string, origin: Omit<Origin, 'id'>) => {
    try {
      await originsService.update(id, origin);
      setOrigins(prev => prev.map(o => o.id === id ? { ...origin, id } : o));
    } catch (error) {
      console.error('Error updating origin:', error);
      throw error;
    }
  };

  const deleteOrigin = async (id: string) => {
    try {
      await originsService.delete(id);
      setOrigins(prev => prev.filter(o => o.id !== id));
    } catch (error) {
      console.error('Error deleting origin:', error);
      throw error;
    }
  };

  // Destination functions
  const addDestination = async (destination: Omit<Destination, 'id'>) => {
    try {
      const id = await destinationsService.add(destination);
      setDestinations(prev => [...prev, { ...destination, id }]);
    } catch (error) {
      console.error('Error adding destination:', error);
      throw error;
    }
  };

  const updateDestination = async (id: string, destination: Omit<Destination, 'id'>) => {
    try {
      await destinationsService.update(id, destination);
      setDestinations(prev => prev.map(d => d.id === id ? { ...destination, id } : d));
    } catch (error) {
      console.error('Error updating destination:', error);
      throw error;
    }
  };

  const deleteDestination = async (id: string) => {
    try {
      await destinationsService.delete(id);
      setDestinations(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      console.error('Error deleting destination:', error);
      throw error;
    }
  };

  // Import data function - VERSÃO CORRIGIDA
  const importData = async (data: ImportedData[], date: string): Promise<{ imported: number; duplicates: number; errors: string[] }> => {
    try {
      // Buscar dados existentes do Firebase
      const existingData = await importedDataService.getAll();
      
      // Filtrar dados para remover duplicatas
      const uniqueData: ImportedData[] = [];
      const duplicates: string[] = [];
      const errors: string[] = [];
      
      for (const record of data) {
        try {
          // Adicionar a data ao registro se não existir
          const recordWithDate = { ...record, date };
          
          // Verificar se é duplicata
          if (!isDuplicateRecord(recordWithDate, existingData) && 
              !isDuplicateRecord(recordWithDate, uniqueData)) {
            uniqueData.push(recordWithDate);
          } else {
            duplicates.push(generateRecordKey(recordWithDate));
          }
        } catch (error) {
          errors.push(`Erro ao processar registro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
      }

      // Importar apenas dados únicos
      if (uniqueData.length > 0) {
        await importDataToFirebase(uniqueData, date);
      }
      
      // Atualizar estado local
      const updatedImportedData = await importedDataService.getAll();
      setImportedData(updatedImportedData);

      return {
        imported: uniqueData.length,
        duplicates: duplicates.length,
        errors
      };
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  };

  // Daily status functions
  const addDailyStatus = async (status: Omit<DailyStatus, 'id'>) => {
    try {
      const id = await dailyStatusService.add(status);
      setDailyStatus(prev => [...prev, { ...status, id }]);
    } catch (error) {
      console.error('Error adding daily status:', error);
      throw error;
    }
  };

  const updateDailyStatus = async (id: string, status: Partial<DailyStatus>) => {
    try {
      await dailyStatusService.update(id, status);
      setDailyStatus(prev => prev.map(s => s.id === id ? { ...s, ...status } : s));
    } catch (error) {
      console.error('Error updating daily status:', error);
      throw error;
    }
  };

  const deleteDailyStatus = async (id: string) => {
    try {
      await dailyStatusService.delete(id);
      setDailyStatus(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting daily status:', error);
      throw error;
    }
  };

  // Daily program functions
  const addDailyProgram = async (program: Omit<DailyProgram, 'id'>) => {
    try {
      const id = await dailyProgramsService.add(program);
      setDailyPrograms(prev => [...prev, { ...program, id }]);
    } catch (error) {
      console.error('Error adding daily program:', error);
      throw error;
    }
  };

  const updateDailyProgram = async (id: string, program: Omit<DailyProgram, 'id'>) => {
    try {
      await dailyProgramsService.update(id, program);
      setDailyPrograms(prev => prev.map(p => p.id === id ? { ...program, id } : p));
    } catch (error) {
      console.error('Error updating daily program:', error);
      throw error;
    }
  };

  const deleteDailyProgram = async (id: string) => {
    try {
      await dailyProgramsService.delete(id);
      setDailyPrograms(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting daily program:', error);
      throw error;
    }
  };

  return (
    <AppContext.Provider value={{
      drivers,
      vehicles,
      operations,
      industries,
      origins,
      destinations,
      importedData,
      dailyStatus,
      dailyPrograms,
      selectedDate,
      loading,
      setSelectedDate,
      addDriver,
      updateDriver,
      deleteDriver,
      addVehicle,
      updateVehicle,
      deleteVehicle,
      addOperation,
      updateOperation,
      deleteOperation,
      addIndustry,
      updateIndustry,
      deleteIndustry,
      addOrigin,
      updateOrigin,
      deleteOrigin,
      addDestination,
      updateDestination,
      deleteDestination,
      importData,
      addDailyStatus,
      updateDailyStatus,
      deleteDailyStatus,
      addDailyProgram,
      updateDailyProgram,
      deleteDailyProgram,
      refreshData,
    }}>
      {children}
    </AppContext.Provider>
  );
};
