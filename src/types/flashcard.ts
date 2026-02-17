/**
 * Core flashcard types for the MIR exam flashcard system
 */

/**
 * Alternative (answer option) for a question
 */
export interface Alternative {
  /** Original number in PDF (1-4) */
  numero: number;
  /** Text of the alternative */
  texto: string;
  /** Comment associated with this alternative (only for correct answer) */
  comentario?: string;
}

/**
 * Question from the exam PDF
 */
export interface Question {
  /** Question number in original PDF */
  numero: number;
  /** Question text */
  pregunta: string;
  /** Array of alternatives (first one is always the correct answer after reordering) */
  alternativas: Alternative[];
  /** Original correct answer number before reordering (1-4) */
  respuesta_original: number;
  /** Optional comment explaining the correct answer */
  comentario: string | null;
}

/**
 * Metadata about the source PDF file
 */
export interface PackageMetadata {
  /** Size of the PDF file in bytes */
  fileSize: number;
  /** Number of pages in the PDF */
  pageCount: number;
  /** Original filename */
  fileName: string;
}

/**
 * Complete package of flashcards from a PDF
 */
export interface FlashcardPackage {
  /** Unique identifier (timestamp + random) */
  id: string;
  /** Package name (usually PDF filename without extension) */
  nombre: string;
  /** Creation date */
  createdAt: Date;
  /** Total number of questions in the package */
  totalQuestions: number;
  /** Array of all questions */
  questions: Question[];
  /** Metadata about the source file */
  metadata: PackageMetadata;
}

/**
 * Study progress for a flashcard package
 */
export interface StudyProgress {
  /** Package ID this progress belongs to */
  packageId: string;
  /** Current question index (0-based) */
  currentIndex: number;
  /** Whether the answer is currently revealed */
  answerRevealed: boolean;
  /** Questions marked as correct */
  correctAnswers: Set<number>;
  /** Questions marked as incorrect */
  incorrectAnswers: Set<number>;
  /** Last studied timestamp */
  lastStudied: Date;
}
