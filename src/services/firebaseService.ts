import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
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

// Generic CRUD operations
export class FirebaseService<T extends { id: string }> {
  constructor(private collectionName: string) {}

  async getAll(): Promise<T[]> {
    try {
      const querySnapshot = await getDocs(collection(db, this.collectionName));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as T));
    } catch (error) {
      console.error(`Error getting ${this.collectionName}:`, error);
      return [];
    }
  }

  async add(data: Omit<T, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error(`Error adding to ${this.collectionName}:`, error);
      throw error;
    }
  }

  async update(id: string, data: Partial<T>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error(`Error updating ${this.collectionName}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.collectionName, id));
    } catch (error) {
      console.error(`Error deleting from ${this.collectionName}:`, error);
      throw error;
    }
  }

  async getByDate(date: string): Promise<T[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('date', '==', date),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as T));
    } catch (error) {
      console.error(`Error getting ${this.collectionName} by date:`, error);
      return [];
    }
  }

  onSnapshot(callback: (data: T[]) => void): () => void {
    const unsubscribe = onSnapshot(
      collection(db, this.collectionName),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as T));
        callback(data);
      },
      (error) => {
        console.error(`Error in ${this.collectionName} snapshot:`, error);
      }
    );
    return unsubscribe;
  }
}

// Service instances
export const driversService = new FirebaseService<Driver>('drivers');
export const vehiclesService = new FirebaseService<Vehicle>('vehicles');
export const operationsService = new FirebaseService<Operation>('operations');
export const industriesService = new FirebaseService<Industry>('industries');
export const originsService = new FirebaseService<Origin>('origins');
export const destinationsService = new FirebaseService<Destination>('destinations');
export const importedDataService = new FirebaseService<ImportedData>('importedData');
export const dailyStatusService = new FirebaseService<DailyStatus>('dailyStatus');
export const dailyProgramsService = new FirebaseService<DailyProgram>('dailyPrograms');

// Specialized methods for imported data
export const importDataToFirebase = async (data: ImportedData[], date: string): Promise<void> => {
  try {
    // Remove existing data for the date
    const existingData = await importedDataService.getByDate(date);
    await Promise.all(existingData.map(item => importedDataService.delete(item.id)));
    
    // Add new data
    const dataWithDate = data.map(item => ({ ...item, date }));
    await Promise.all(dataWithDate.map(item => importedDataService.add(item)));
  } catch (error) {
    console.error('Error importing data to Firebase:', error);
    throw error;
  }
};