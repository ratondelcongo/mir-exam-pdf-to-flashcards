/**
 * Types for PDF processing and text extraction
 */

/**
 * Result of text extraction from PDF
 */
export interface TextExtraction {
  /** Full extracted text from the PDF */
  text: string;
  /** Number of pages processed */
  pageCount: number;
  /** Metadata from the PDF */
  metadata: {
    title?: string;
    author?: string;
    subject?: string;
  };
}

/**
 * Text item with position information from PDF.js
 */
export interface TextItem {
  /** The text string */
  str: string;
  /** Transform matrix with position info */
  transform: number[];
  /** Width of the text */
  width: number;
  /** Height of the text */
  height: number;
  /** Font name */
  fontName: string;
}

/**
 * Progress callback for PDF processing
 */
export interface PDFProcessingProgress {
  /** Current step being performed */
  step: "loading" | "extracting" | "parsing" | "saving" | "complete";
  /** Progress percentage (0-100) */
  progress: number;
  /** Optional message describing current action */
  message?: string;
}

/**
 * Raw question data before reordering
 */
export interface RawQuestion {
  /** Question number */
  numero: number;
  /** Question text */
  pregunta: string;
  /** All 4 alternatives in original order */
  alternativas: string[];
  /** Correct answer index (1-4) */
  respuestaCorrecta: number;
  /** Optional comment */
  comentario: string | null;
}

/**
 * Configuration for PDF parsing
 */
export interface ParserConfig {
  /** Whether to preserve original order (default: false, reorders with correct first) */
  preserveOrder?: boolean;
  /** Minimum question length to consider valid */
  minQuestionLength?: number;
  /** Maximum number of alternatives expected */
  maxAlternatives?: number;
}
