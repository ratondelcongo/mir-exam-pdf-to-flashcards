/**
 * IndexedDB setup and initialization
 */
import { type DBSchema, type IDBPDatabase, openDB } from "idb";
import type { FlashcardPackage } from "@/types/flashcard";

/**
 * Database schema definition
 */
interface FlashcardsDB extends DBSchema {
  packages: {
    key: string;
    value: FlashcardPackage;
    indexes: { "by-date": Date };
  };
}

const DB_NAME = "mir-flashcards-db";
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<FlashcardsDB> | null = null;

/**
 * Initialize and get database instance
 */
export async function getDB(): Promise<IDBPDatabase<FlashcardsDB>> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<FlashcardsDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create packages store if it doesn't exist
      if (!db.objectStoreNames.contains("packages")) {
        const packageStore = db.createObjectStore("packages", {
          keyPath: "id",
        });

        // Create index for sorting by date
        packageStore.createIndex("by-date", "createdAt");
      }
    },
  });

  return dbInstance;
}

/**
 * Close database connection
 */
export async function closeDB(): Promise<void> {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

/**
 * Delete the entire database (for testing/reset purposes)
 */
export async function deleteDatabase(): Promise<void> {
  await closeDB();
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
