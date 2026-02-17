/**
 * CRUD operations for flashcard packages in IndexedDB
 */

import type { FlashcardPackage } from "@/types/flashcard";
import { getDB } from "./index";

/**
 * Save a flashcard package to IndexedDB
 */
export async function savePackage(pkg: FlashcardPackage): Promise<void> {
  const db = await getDB();
  await db.put("packages", pkg);
}

/**
 * Get all flashcard packages, sorted by date (newest first)
 */
export async function getAllPackages(): Promise<FlashcardPackage[]> {
  const db = await getDB();
  const packages = await db.getAllFromIndex("packages", "by-date");
  // Reverse to get newest first
  return packages.reverse();
}

/**
 * Get a specific package by ID
 */
export async function getPackageById(
  id: string,
): Promise<FlashcardPackage | undefined> {
  const db = await getDB();
  return await db.get("packages", id);
}

/**
 * Delete a package by ID
 */
export async function deletePackage(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("packages", id);
}

/**
 * Update an existing package
 */
export async function updatePackage(pkg: FlashcardPackage): Promise<void> {
  const db = await getDB();
  await db.put("packages", pkg);
}

/**
 * Check if a package exists
 */
export async function packageExists(id: string): Promise<boolean> {
  const db = await getDB();
  const pkg = await db.get("packages", id);
  return pkg !== undefined;
}

/**
 * Get the total count of packages
 */
export async function getPackageCount(): Promise<number> {
  const db = await getDB();
  return await db.count("packages");
}

/**
 * Clear all packages (for testing/reset)
 */
export async function clearAllPackages(): Promise<void> {
  const db = await getDB();
  await db.clear("packages");
}
