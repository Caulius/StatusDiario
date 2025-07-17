// FUNÇÕES CRUD - Adicione essas funções antes do return do AppProvider

  // Driver functions
  const addDriver = async (driver: Omit<Driver, 'id'>) => {
    try {
      const newDriver = await driversService.create(driver);
      setDrivers(prev => [...prev, newDriver]);
    } catch (error) {
      console.error('Error adding driver:', error);
      throw error;
    }
  };

  const updateDriver = async (id: string, driver: Omit<Driver, 'id'>) => {
    try {
      const updatedDriver = await driversService.update(id, driver);
      setDrivers(prev => prev.map(d => d.id === id ? updatedDriver : d));
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
      const newVehicle = await vehiclesService.create(vehicle);
      setVehicles(prev => [...prev, newVehicle]);
    } catch (error) {
      console.error('Error adding vehicle:', error);
      throw error;
    }
  };

  const updateVehicle = async (id: string, vehicle: Omit<Vehicle, 'id'>) => {
    try {
      const updatedVehicle = await vehiclesService.update(id, vehicle);
      setVehicles(prev => prev.map(v => v.id === id ? updatedVehicle : v));
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
      const newOperation = await operationsService.create(operation);
      setOperations(prev => [...prev, newOperation]);
    } catch (error) {
      console.error('Error adding operation:', error);
      throw error;
    }
  };

  const updateOperation = async (id: string, operation: Omit<Operation, 'id'>) => {
    try {
      const updatedOperation = await operationsService.update(id, operation);
      setOperations(prev => prev.map(o => o.id === id ? updatedOperation : o));
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
      const newIndustry = await industriesService.create(industry);
      setIndustries(prev => [...prev, newIndustry]);
    } catch (error) {
      console.error('Error adding industry:', error);
      throw error;
    }
  };

  const updateIndustry = async (id: string, industry: Omit<Industry, 'id'>) => {
    try {
      const updatedIndustry = await industriesService.update(id, industry);
      setIndustries(prev => prev.map(i => i.id === id ? updatedIndustry : i));
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
      const newOrigin = await originsService.create(origin);
      setOrigins(prev => [...prev, newOrigin]);
    } catch (error) {
      console.error('Error adding origin:', error);
      throw error;
    }
  };

  const updateOrigin = async (id: string, origin: Omit<Origin, 'id'>) => {
    try {
      const updatedOrigin = await originsService.update(id, origin);
      setOrigins(prev => prev.map(o => o.id === id ? updatedOrigin : o));
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
      const newDestination = await destinationsService.create(destination);
      setDestinations(prev => [...prev, newDestination]);
    } catch (error) {
      console.error('Error adding destination:', error);
      throw error;
    }
  };

  const updateDestination = async (id: string, destination: Omit<Destination, 'id'>) => {
    try {
      const updatedDestination = await destinationsService.update(id, destination);
      setDestinations(prev => prev.map(d => d.id === id ? updatedDestination : d));
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

  // Daily Status functions
  const addDailyStatus = async (status: Omit<DailyStatus, 'id'>) => {
    try {
      const newStatus = await dailyStatusService.create(status);
      setDailyStatus(prev => [...prev, newStatus]);
    } catch (error) {
      console.error('Error adding daily status:', error);
      throw error;
    }
  };

  const updateDailyStatus = async (id: string, status: Partial<DailyStatus>) => {
    try {
      const updatedStatus = await dailyStatusService.update(id, status);
      setDailyStatus(prev => prev.map(s => s.id === id ? updatedStatus : s));
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

  // Daily Program functions
  const addDailyProgram = async (program: Omit<DailyProgram, 'id'>) => {
    try {
      const newProgram = await dailyProgramsService.create(program);
      setDailyPrograms(prev => [...prev, newProgram]);
    } catch (error) {
      console.error('Error adding daily program:', error);
      throw error;
    }
  };

  const updateDailyProgram = async (id: string, program: Omit<DailyProgram, 'id'>) => {
    try {
      const updatedProgram = await dailyProgramsService.update(id, program);
      setDailyPrograms(prev => prev.map(p => p.id === id ? updatedProgram : p));
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
