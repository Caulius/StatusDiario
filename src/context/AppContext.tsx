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
  importData: (data: ImportedData[] | string, date: string) => Promise<void>;
  addDailyStatus: (status: Omit<DailyStatus, 'id'>) => Promise<void>;
  updateDailyStatus: (id: string, status: Partial<DailyStatus>) => Promise<void>;
  deleteDailyStatus: (id: string) => Promise<void>;
  addDailyProgram: (program: Omit<DailyProgram, 'id'>) => Promise<void>;
  updateDailyProgram: (id: string, program: Omit<DailyProgram, 'id'>) => Promise<void>;
  deleteDailyProgram: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

// Criar o contexto
const AppContext = createContext<AppContextType | undefined>(undefined);

// Hook useApp - DEVE estar FORA do componente AppProvider
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
  // ... resto do código do AppProvider permanece igual
  
  // Estados
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

  // Funções auxiliares
  const checkForDuplicates = (newData: ImportedData[], existingData: ImportedData[]): ImportedData[] => {
    const uniqueData: ImportedData[] = [];
    
    const existingKeysMap = new Map<string, boolean>();
    
    existingData.forEach(item => {
      const key1 = `${item.date}-${item.id}`;
      const key2 = `${item.date}-${item.route}-${item.weight}-${item.boxes}`;
      
      existingKeysMap.set(key1, true);
      existingKeysMap.set(key2, true);
    });

    for (const item of newData) {
      const key1 = `${item.date}-${item.id}`;
      const key2 = `${item.date}-${item.route}-${item.weight}-${item.boxes}`;
      
      const isDuplicate = existingKeysMap.has(key1) && existingKeysMap.has(key2);
      
      if (!isDuplicate) {
        uniqueData.push(item);
        existingKeysMap.set(key1, true);
        existingKeysMap.set(key2, true);
      } else {
        console.log('Duplicate data found and skipped:', {
          id: item.id,
          route: item.route,
          date: item.date
        });
      }
    }

    return uniqueData;
  };

  const parseImportData = (rawData: string, date: string): ImportedData[] => {
    const lines = rawData.split('\n').filter(line => line.trim() !== '');
    const parsedData: ImportedData[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line || 
          line.includes('Transporte SAP') || 
          line.includes('ROTAS') || 
          line.includes('PESO') || 
          line.includes('Caixas') ||
          line === '**ROTAS**' ||
          line === '**PESO**' ||
          line === '**Caixas**') {
        continue;
      }

      const routeMatch = line.match(/^(\d+)/);
      if (routeMatch) {
        const routeId = routeMatch[1];
        
        let routeDescription = '';
        let weight = '';
        let boxes = '';
        
        const sameLineMatch = line.match(/^(\d+)\s+(.+?)(\d+[,.]?\d*)\s+(\d+)$/);
        if (sameLineMatch) {
          routeDescription = sameLineMatch[2].trim();
          weight = sameLineMatch[3].replace(',', '.');
          boxes = sameLineMatch[4];
        } else {
          if (i + 1 < lines.length) {
            const nextLine = lines[i + 1].trim();
            if (!nextLine.match(/^\d+/) && nextLine.length > 0) {
              routeDescription = nextLine;
              i++;
              
              if (i + 1 < lines.length) {
                const weightLine = lines[i + 1].trim();
                const weightMatch = weightLine.match(/(\d+[,.]?\d*)/);
                if (weightMatch) {
                  weight = weightMatch[1].replace(',', '.');
                  i++;
                  
                  if (i + 1 < lines.length) {
                    const boxesLine = lines[i + 1].trim();
                    const boxesMatch = boxesLine.match(/(\d+)/);
                    if (boxesMatch) {
                      boxes = boxesMatch[1];
                      i++;
                    }
                  }
                }
              }
            }
          }
        }

        if (routeId && routeDescription) {
          const uniqueId = `${date}-${routeId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
          const importedItem: ImportedData = {
            id: uniqueId,
            date: date,
            route: routeDescription,
            weight: parseFloat(weight) || 0,
            boxes: parseInt(boxes) || 0,
            driverId: '',
            vehicleId: '',
            operationId: '',
            // routeId: routeId, // Adicione este campo se necessário no tipo ImportedData
          };

          parsedData.push(importedItem);
        }
      }
    }

    console.log(`Parsed ${parsedData.length} records from import data`);
    return parsedData;
  };

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

  const refreshData = async () => {
    await loadData();
  };

  // Função de importação corrigida
  const importData = async (data: ImportedData[] | string, date: string) => {
    try {
      let parsedData: ImportedData[];
      
      if (typeof data === 'string') {
        parsedData = parseImportData(data, date);
      } else {
        parsedData = data;
      }
      
      if (parsedData.length === 0) {
        console.warn('No valid data found to import');
        return;
      }

      const currentImportedData = await importedDataService.getAll();
      const uniqueData = checkForDuplicates(parsedData, currentImportedData);
      
      if (uniqueData.length === 0) {
        console.warn('No new data to import - all records already exist');
        return;
      }

      console.log(`Importing ${uniqueData.length} unique records out of ${parsedData.length} total records`);
      
      await importDataToFirebase(uniqueData, date);
      
      const updatedImportedData = await importedDataService.getAll();
      setImportedData(updatedImportedData);
      
      console.log(`Successfully imported ${uniqueData.length} records`);
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  };

  // Todas as outras funções (addDriver, updateDriver, etc.) permanecem iguais
  // ... (resto das funções do código original)

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

// Exportações finais
export default AppProvider;
export { AppContext };
