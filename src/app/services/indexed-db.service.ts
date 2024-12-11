import { Injectable } from '@angular/core';
import { IDBPDatabase, openDB } from 'idb';
import { ConstantsEnum } from '../utils/constants';

@Injectable({
  providedIn: 'root'
})
export class IndexedDBService {
  private db: IDBPDatabase | null = null;
  private dbPromise: Promise<IDBPDatabase>;

  constructor() {
    this.dbPromise = this.initDB();
  }

  async initDB(): Promise<IDBPDatabase> {
    if (!this.db) {
      this.db = await openDB('my-database', 1, {
        upgrade(db) {
          db.createObjectStore('voltageReadings', { keyPath: 'uptime' });  // Use uptime as the key
          db.createObjectStore('temperatureReadings', { keyPath: 'uptime' });
          db.createObjectStore('uptime', { keyPath: 'id', autoIncrement: true });  // New store for uptime
        },
      });
    }
    return this.db;
  }

  /**
   * ==================================
   * UPTIME OPERATIONS
   * ==================================
   */

  // Save uptime value to IndexedDB
  async saveUptime(value: number) {
    const db = await this.dbPromise;
    const tx = db.transaction(ConstantsEnum.uptimeObjectStoreName, 'readwrite');
    const store = tx.objectStore(ConstantsEnum.uptimeObjectStoreName);
    await store.put({ id: 1, value });  // Save with a fixed id for simplicity
    await tx.done;
  }

  // Get uptime value from IndexedDB
  async getUptime(): Promise<number | null> {
    const db = await this.dbPromise;
    const tx = db.transaction(ConstantsEnum.uptimeObjectStoreName, 'readonly');
    const store = tx.objectStore(ConstantsEnum.uptimeObjectStoreName);
    const result = await store.get(1);  // Retrieve the uptime value by id
    await tx.done;
    return result ? result.value : null;  // Return the value or null if not found
  }

  // Optionally clear uptime data
  async clearUptime() {
    const db = await this.dbPromise;
    const tx = db.transaction(ConstantsEnum.uptimeObjectStoreName, 'readwrite');
    const store = tx.objectStore(ConstantsEnum.uptimeObjectStoreName);
    await store.clear();
    await tx.done;
  }

  /**
   * ==================================
   * VOLTAGE OPERATIONS
   * ==================================
   */

  // Save voltage reading to IndexedDB with uptime as the key
  async addVoltageReading(reading: any) {
    const db = await this.dbPromise;
    const tx = db.transaction(ConstantsEnum.voltageObjectStoreName, 'readwrite');
    const store = tx.objectStore(ConstantsEnum.voltageObjectStoreName);
    await store.put({ id: reading.uptime, uptime: reading.uptime, voltage: reading.voltage });  // Save with uptime as the key
    await tx.done;
  }

  // Get the last 'N' voltage readings from IndexedDB excluding the last 2
  async getLastNVoltageReadingsExcludingLast2(limit: number): Promise<any[]> {
    const db = await this.dbPromise;
    const allReadings = await db.getAll(ConstantsEnum.voltageObjectStoreName);
    if (allReadings.length <= 2) {
      return [];
    }
    return allReadings.slice(-limit - 2, -2);
  }

  // Get all voltage readings from IndexedDB
  async getAllVoltageReadings() {
    const db = await this.dbPromise;
    return db.getAll(ConstantsEnum.voltageObjectStoreName);
  }

  // Clear voltage readings from IndexedDB
  async clearVoltageReadings() {
    const db = await this.dbPromise;
    return db.clear(ConstantsEnum.voltageObjectStoreName);
  }

  /**
   * ==================================
   * TEMPERATURE OPERATIONS
   * ==================================
   */

  // Save temperature reading to IndexedDB with uptime as the key
  async addTemperatureReading(reading: any) {
    const db = await this.dbPromise;
    const tx = db.transaction(ConstantsEnum.temperatureObjectStoreName, 'readwrite');
    const store = tx.objectStore(ConstantsEnum.temperatureObjectStoreName);
    await store.put({ id: reading.uptime, uptime: reading.uptime, temperature: reading.temperature });  // Save with uptime as the key
    await tx.done;
  }

  // Delete all temperature readings from IndexedDB
  async clearTemperatureReadings() {
    const db = await this.dbPromise;
    return db.clear(ConstantsEnum.temperatureObjectStoreName);
  }

  // Get the last N-2 temperature readings from IndexedDB
  // Used for the chart / plot / graph
  async getLastNTemperatureReadingsExcludingLast2(limit: number): Promise<any[]> {
    const db = await this.dbPromise;
    const allReadings = await db.getAll(ConstantsEnum.temperatureObjectStoreName);
    if (allReadings.length <= 2) {
      return [];
    }
    return allReadings.slice(-limit - 2, -2);
  }

  // Get all temperature readings from IndexedDB
  async getAllTemperatureReadings() {
    const db = await this.dbPromise;
    return db.getAll(ConstantsEnum.temperatureObjectStoreName);
  }
}
