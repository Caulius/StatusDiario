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
  importData: (data: ImportedData[], date: string) => Promise<void>;
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

  // Utility function to check for duplicates
  const checkForDuplicates = (newData: ImportedData[], existingData: ImportedData[]): ImportedData[] => {
    const uniqueData: ImportedData[] = [];
    const existingKeys = new Set(
      existingData.map(item => `${item.date}-${item.driverId}-${item.vehicleId}-${item.operationId}`)
    );

    for (const item of newData) {
      const key = `${item.date}-${item.driverId}-${item.vehicleId}-${item.operationId}`;
      if (!existingKeys.has(key)) {
        uniqueData.push(item);
        existingKeys.add(key);
      } else {
        console.warn('Duplicate data found and skipped:', item);
      }
    }

    return uniqueData;
  };

  // Driver functions
  const addDriver = async (driver: Omit<Driver, 'id'>) => {
    try {
      // Check for duplicate driver by name or unique identifier
      const existingDriver = drivers.find(d => 
        d.name === driver.name || 
        (driver.licenseNumber && d.licenseNumber === driver.licenseNumber)
      );
      
      if (existingDriver) {
        throw new Error('Driver already exists');
      }

      const id = await driversService.add(driver);
      setDrivers(prev => [...prev, { ...driver, id }]);
    } catch (error) {
      console.error('Error adding driver:', error);
      throw error;
    }
  };

  const updateDriver = async (id: string, driver: Omit<Driver, 'id'>) => {
    try {
      // Check for duplicate driver name/license (excluding current driver)
      const existingDriver = drivers.find(d => 
        d.id !== id && (
          d.name === driver.name || 
          (driver.licenseNumber && d.licenseNumber === driver.licenseNumber)
        )
      );
      
      if (existingDriver) {
        throw new Error('Driver with this name or license already exists');
      }

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
      // Check for duplicate vehicle by license plate
      const existingVehicle = vehicles.find(v => 
        v.licensePlate === vehicle.licensePlate
      );
      
      if (existingVehicle) {
        throw new Error('Vehicle with this license plate already exists');
      }

      const id = await vehiclesService.add(vehicle);
      setVehicles(prev => [...prev, { ...vehicle, id }]);
    } catch (error) {
      console.error('Error adding vehicle:', error);
      throw error;
    }
  };

  const updateVehicle = async (id: string, vehicle: Omit<Vehicle, 'id'>) => {
    try {
      // Check for duplicate license plate (excluding current vehicle)
      const existingVehicle = vehicles.find(v => 
        v.id !== id && v.licensePlate === vehicle.licensePlate
      );
      
      if (existingVehicle) {
        throw new Error('Vehicle with this license plate already exists');
      }

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
      // Check for duplicate operation by name
      const existingOperation = operations.find(o => 
        o.name === operation.name
      );
      
      if (existingOperation) {
        throw new Error('Operation with this name already exists');
      }

      const id = await operationsService.add(operation);
      setOperations(prev => [...prev, { ...operation, id }]);
    } catch (error) {
      console.error('Error adding operation:', error);
      throw error;
    }
  };

  const updateOperation = async (id: string, operation: Omit<Operation, 'id'>) => {
    try {
      // Check for duplicate operation name (excluding current operation)
      const existingOperation = operations.find(o => 
        o.id !== id && o.name === operation.name
      );
      
      if (existingOperation) {
        throw new Error('Operation with this name already exists');
      }

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
      // Check for duplicate industry by name
      const existingIndustry = industries.find(i => 
        i.name === industry.name
      );
      
      if (existingIndustry) {
        throw new Error('Industry with this name already exists');
      }

      const id = await industriesService.add(industry);
      setIndustries(prev => [...prev, { ...industry, id }]);
    } catch (error) {
      console.error('Error adding industry:', error);
      throw error;
    }
  };

  const updateIndustry = async (id: string, industry: Omit<Industry, 'id'>) => {
    try {
      // Check for duplicate industry name (excluding current industry)
      const existingIndustry = industries.find(i => 
        i.id !== id && i.name === industry.name
      );
      
      if (existingIndustry) {
        throw new Error('Industry with this name already exists');
      }

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
      // Check for duplicate origin by name
      const existingOrigin = origins.find(o => 
        o.name === origin.name
      );
      
      if (existingOrigin) {
        throw new Error('Origin with this name already exists');
      }

      const id = await originsService.add(origin);
      setOrigins(prev => [...prev, { ...origin, id }]);
    } catch (error) {
      console.error('Error adding origin:', error);
      throw error;
    }
  };

  const updateOrigin = async (id: string, origin: Omit<Origin, 'id'>) => {
    try {
      // Check for duplicate origin name (excluding current origin)
      const existingOrigin = origins.find(o => 
        o.id !== id && o.name === origin.name
      );
      
      if (existingOrigin) {
        throw new Error('Origin with this name already exists');
      }

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
      // Check for duplicate destination by name
      const existingDestination = destinations.find(d => 
        d.name === destination.name
      );
      
      if (existingDestination) {
        throw new Error('Destination with this name already exists');
      }

      const id = await destinationsService.add(destination);
      setDestinations(prev => [...prev, { ...destination, id }]);
    } catch (error) {
      console.error('Error adding destination:', error);
      throw error;
    }
  };

  const updateDestination = async (id: string, destination: Omit<Destination, 'id'>) => {
    try {
      // Check for duplicate destination name (excluding current destination)
      const existingDestination = destinations.find(d => 
        d.id !== id && d.name === destination.name
      );
      
      if (existingDestination) {
        throw new Error('Destination with this name already exists');
      }

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

  // Import data function - CORRIGIDO PARA EVITAR DUPLICATAS
  const importData = async (data: ImportedData[], date: string) => {
    try {
      // Filter out duplicates before importing
      const uniqueData = checkForDuplicates(data, importedData);
      
      if (uniqueData.length === 0) {
        console.warn('No new data to import - all records already exist');
        return;
      }

      console.log(`Importing ${uniqueData.length} unique records out of ${data.length} total records`);
      
      // Import only unique data
      await importDataToFirebase(uniqueData, date);
      
      // Refresh imported data
      const updatedImportedData = await importedDataService.getAll();
      setImportedData(updatedImportedData);
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  };

  // Daily status functions
  const addDailyStatus = async (status: Omit<DailyStatus, 'id'>) => {
    try {
      // Check for duplicate daily status by date and driver
      const existingStatus = dailyStatus.find(s => 
        s.date === status.date && s.driverId === status.driverId
      );
      
      if (existingStatus) {
        throw new Error('Daily status for this driver and date already exists');
      }

      const id = await dailyStatusService.add(status);
      setDailyStatus(prev => [...prev, { ...status, id }]);
    } catch (error) {
      console.error('Error adding daily status:', error);
      throw error;
    }
  };

  const updateDailyStatus = async (id: string, status: Partial<DailyStatus>) => {
    try {
      // If updating date or driverId, check for duplicates
      if (status.date || status.driverId) {
        const currentStatus = dailyStatus.find(s => s.id === id);
        const checkDate = status.date || currentStatus?.date;
        const checkDriverId = status.driverId || currentStatus?.driverId;
        
        const existingStatus = dailyStatus.find(s => 
          s.id !== id && s.date === checkDate && s.driverId === checkDriverId
        );
        
        if (existingStatus) {
          throw new Error('Daily status for this driver and date already exists');
        }
      }

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
      // Check for duplicate daily program by date, driver, and vehicle
      const existingProgram = dailyPrograms.find(p => 
        p.date === program.date && 
        p.driverId === program.driverId && 
        p.vehicleId === program.vehicleId
      );
      
      if (existingProgram) {
        throw new Error('Daily program for this driver, vehicle and date already exists');
      }

      const id = await dailyProgramsService.add(program);
      setDailyPrograms(prev => [...prev, { ...program, id }]);
    } catch (error) {
      console.error('Error adding daily program:', error);
      throw error;
    }
  };

  const updateDailyProgram = async (id: string, program: Omit<DailyProgram, 'id'>) => {
    try {
      // Check for duplicate daily program (excluding current program)
      const existingProgram = dailyPrograms.find(p => 
        p.id !== id && 
        p.date === program.date && 
        p.driverId === program.driverId && 
        p.vehicleId === program.vehicleId
      );
      
      if (existingProgram) {
        throw new Error('Daily program for this driver, vehicle and date already exists');
      }

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
