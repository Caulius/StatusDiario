export interface Driver {
  id: string;
  name: string;
  phone: string;
}

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
}

export interface Operation {
  id: string;
  name: string;
}

export interface Industry {
  id: string;
  name: string;
}

export interface Origin {
  id: string;
  name: string;
}

export interface Destination {
  id: string;
  name: string;
}

export interface ImportedData {
  transportSAP: string;
  routes: string;
  weight: number;
  boxes: number;
  date: string;
}

export interface DailyStatus {
  id: string;
  operation: string;
  number: string;
  industry: string;
  scheduledTime: string;
  plate: string;
  driver: string;
  origin: string;
  destination: string;
  transportSAP: string;
  routes: string;
  weight: number;
  boxes: number;
  responsible: string;
  start: string;
  end: string;
  refrigPallets: number;
  dryPallets: number;
  totalPallets: number;
  separation: string;
  observation: string;
  termoPallet: string;
  cte: string;
  mdfe: string;
  ae: string;
  originDeparture: string;
  destinationArrival: string;
  docRelFin: boolean;
  docTermoPallet: boolean;
  docProtoc: boolean;
  docCanhotos: boolean;
  status: 'Pendente' | 'Concluído';
  date: string;
}

export interface ProgramDestination {
  destination: string;
  time?: string;
  observation?: string;
}

export interface ProgramVehicle {
  id: string;
  plate: string;
  driver: string;
  origin: string;
  originTime: string;
  destinations: ProgramDestination[];
  transportSAPs: string[];
  routes?: string;
  weight?: number;
  status: 'Em Trânsito' | 'Concluído';
}

export interface DailyProgram {
  id: string;
  name: string;
  date: string;
  vehicles: ProgramVehicle[];
}

export interface DashboardData {
  scheduledVehicles: number;
  transitVehicles: number;
  completedPrograms: number;
  totalPrograms: number;
  dailyStatus: DailyStatus[];
}