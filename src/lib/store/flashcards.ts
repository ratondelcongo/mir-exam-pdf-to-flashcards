/**
 * Zustand store for flashcard state management
 */
import { create } from "zustand";
import {
  deletePackage as dbDeletePackage,
  getAllPackages,
  savePackage,
} from "@/lib/db/packages";
import type { FlashcardPackage, StudyProgress } from "@/types/flashcard";

interface FlashcardsState {
  // State
  packages: FlashcardPackage[];
  studyProgress: Map<string, StudyProgress>;
  isLoading: boolean;
  error: string | null;
  currentPackageId: string | null;

  // Actions
  loadPackages: () => Promise<void>;
  addPackage: (pkg: FlashcardPackage) => Promise<void>;
  deletePackage: (id: string) => Promise<void>;
  getPackage: (id: string) => FlashcardPackage | undefined;
  setCurrentPackage: (id: string | null) => void;

  // Study progress actions
  initStudyProgress: (packageId: string) => void;
  updateStudyProgress: (
    packageId: string,
    updates: Partial<StudyProgress>,
  ) => void;
  nextQuestion: (packageId: string) => void;
  previousQuestion: (packageId: string) => void;
  toggleAnswerRevealed: (packageId: string) => void;
  markCorrect: (packageId: string, questionIndex: number) => void;
  markIncorrect: (packageId: string, questionIndex: number) => void;
  resetProgress: (packageId: string) => void;
}

export const useFlashcardsStore = create<FlashcardsState>((set, get) => ({
  // Initial state
  packages: [],
  studyProgress: new Map(),
  isLoading: false,
  error: null,
  currentPackageId: null,

  // Load all packages from IndexedDB
  loadPackages: async () => {
    set({ isLoading: true, error: null });
    try {
      const packages = await getAllPackages();
      set({ packages, isLoading: false });
    } catch (error) {
      console.error("Failed to load packages:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to load packages",
        isLoading: false,
      });
    }
  },

  // Add a new package
  addPackage: async (pkg: FlashcardPackage) => {
    set({ isLoading: true, error: null });
    try {
      await savePackage(pkg);
      const packages = [...get().packages, pkg];
      set({ packages, isLoading: false });
    } catch (error) {
      console.error("Failed to save package:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to save package",
        isLoading: false,
      });
      throw error;
    }
  },

  // Delete a package
  deletePackage: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await dbDeletePackage(id);
      const packages = get().packages.filter((pkg) => pkg.id !== id);
      const studyProgress = new Map(get().studyProgress);
      studyProgress.delete(id);
      set({ packages, studyProgress, isLoading: false });
    } catch (error) {
      console.error("Failed to delete package:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to delete package",
        isLoading: false,
      });
      throw error;
    }
  },

  // Get a package by ID
  getPackage: (id: string) => {
    return get().packages.find((pkg) => pkg.id === id);
  },

  // Set current package ID
  setCurrentPackage: (id: string | null) => {
    set({ currentPackageId: id });
  },

  // Initialize study progress for a package
  initStudyProgress: (packageId: string) => {
    const studyProgress = new Map(get().studyProgress);

    if (!studyProgress.has(packageId)) {
      studyProgress.set(packageId, {
        packageId,
        currentIndex: 0,
        answerRevealed: false,
        correctAnswers: new Set(),
        incorrectAnswers: new Set(),
        lastStudied: new Date(),
      });

      set({ studyProgress });
    }
  },

  // Update study progress
  updateStudyProgress: (packageId: string, updates: Partial<StudyProgress>) => {
    const studyProgress = new Map(get().studyProgress);
    const current = studyProgress.get(packageId);

    if (current) {
      studyProgress.set(packageId, {
        ...current,
        ...updates,
        lastStudied: new Date(),
      });
      set({ studyProgress });
    }
  },

  // Navigate to next question
  nextQuestion: (packageId: string) => {
    const pkg = get().getPackage(packageId);
    const progress = get().studyProgress.get(packageId);

    if (pkg && progress && progress.currentIndex < pkg.totalQuestions - 1) {
      get().updateStudyProgress(packageId, {
        currentIndex: progress.currentIndex + 1,
        answerRevealed: false,
      });
    }
  },

  // Navigate to previous question
  previousQuestion: (packageId: string) => {
    const progress = get().studyProgress.get(packageId);

    if (progress && progress.currentIndex > 0) {
      get().updateStudyProgress(packageId, {
        currentIndex: progress.currentIndex - 1,
        answerRevealed: false,
      });
    }
  },

  // Toggle answer revealed state
  toggleAnswerRevealed: (packageId: string) => {
    const progress = get().studyProgress.get(packageId);

    if (progress) {
      get().updateStudyProgress(packageId, {
        answerRevealed: !progress.answerRevealed,
      });
    }
  },

  // Mark question as correct
  markCorrect: (packageId: string, questionIndex: number) => {
    const progress = get().studyProgress.get(packageId);

    if (progress) {
      const correctAnswers = new Set(progress.correctAnswers);
      const incorrectAnswers = new Set(progress.incorrectAnswers);

      correctAnswers.add(questionIndex);
      incorrectAnswers.delete(questionIndex);

      get().updateStudyProgress(packageId, {
        correctAnswers,
        incorrectAnswers,
      });
    }
  },

  // Mark question as incorrect
  markIncorrect: (packageId: string, questionIndex: number) => {
    const progress = get().studyProgress.get(packageId);

    if (progress) {
      const correctAnswers = new Set(progress.correctAnswers);
      const incorrectAnswers = new Set(progress.incorrectAnswers);

      incorrectAnswers.add(questionIndex);
      correctAnswers.delete(questionIndex);

      get().updateStudyProgress(packageId, {
        correctAnswers,
        incorrectAnswers,
      });
    }
  },

  // Reset progress for a package
  resetProgress: (packageId: string) => {
    const studyProgress = new Map(get().studyProgress);
    studyProgress.set(packageId, {
      packageId,
      currentIndex: 0,
      answerRevealed: false,
      correctAnswers: new Set(),
      incorrectAnswers: new Set(),
      lastStudied: new Date(),
    });
    set({ studyProgress });
  },
}));
