/**
 * Hook for PDF upload and processing workflow
 */
import { useCallback, useState } from "react";
import {
  extractTextFromPDF,
  isPDFFile,
  validatePDFSize,
} from "@/lib/pdf/extractor";
import {
  getParsingStats,
  parseQuestions,
  validateQuestion,
} from "@/lib/pdf/parser";
import { useFlashcardsStore } from "@/lib/store/flashcards";
import type { FlashcardPackage } from "@/types/flashcard";
import type { PDFProcessingProgress } from "@/types/pdf";

interface UploadState {
  isUploading: boolean;
  progress: PDFProcessingProgress | null;
  error: string | null;
}

interface UploadResult {
  success: boolean;
  package?: FlashcardPackage;
  error?: string;
}

export function usePDFUpload() {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: null,
    error: null,
  });

  const addPackage = useFlashcardsStore((state) => state.addPackage);

  const uploadPDF = useCallback(
    async (
      file: File,
      skipFirstPage: boolean = true,
    ): Promise<UploadResult> => {
      // Reset state
      setState({
        isUploading: true,
        progress: { step: "loading", progress: 0 },
        error: null,
      });

      try {
        // Validate file type
        if (!isPDFFile(file)) {
          throw new Error("File must be a PDF");
        }

        // Validate file size (max 50MB)
        if (!validatePDFSize(file, 50)) {
          throw new Error("PDF file must be smaller than 50MB");
        }

        // Extract text from PDF
        const extraction = await extractTextFromPDF(
          file,
          (progress) => {
            setState((prev) => ({ ...prev, progress }));
          },
          skipFirstPage,
        );

        // Parse questions
        setState({
          isUploading: true,
          progress: {
            step: "parsing",
            progress: 85,
            message: "Parsing questions...",
          },
          error: null,
        });

        const questions = parseQuestions(extraction.text);

        // Validate questions
        const validQuestions = questions.filter(validateQuestion);

        if (validQuestions.length === 0) {
          throw new Error(
            "No valid questions found in PDF. Please check the format.",
          );
        }

        // Get parsing statistics
        const stats = getParsingStats(validQuestions);
        console.log("Parsing statistics:", stats);

        // Create package
        const packageName = file.name.replace(".pdf", "");
        const packageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const flashcardPackage: FlashcardPackage = {
          id: packageId,
          nombre: packageName,
          createdAt: new Date(),
          totalQuestions: validQuestions.length,
          questions: validQuestions,
          metadata: {
            fileSize: file.size,
            pageCount: extraction.pageCount,
            fileName: file.name,
          },
        };

        // Save to IndexedDB
        setState({
          isUploading: true,
          progress: {
            step: "saving",
            progress: 95,
            message: "Saving package...",
          },
          error: null,
        });

        await addPackage(flashcardPackage);

        // Complete
        setState({
          isUploading: false,
          progress: { step: "complete", progress: 100, message: "Complete!" },
          error: null,
        });

        return {
          success: true,
          package: flashcardPackage,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to process PDF";

        setState({
          isUploading: false,
          progress: null,
          error: errorMessage,
        });

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [addPackage],
  );

  const reset = useCallback(() => {
    setState({
      isUploading: false,
      progress: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    uploadPDF,
    reset,
  };
}
