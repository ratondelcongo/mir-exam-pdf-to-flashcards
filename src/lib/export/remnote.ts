/**
 * RemNote export functionality
 * Converts flashcard packages to RemNote format matching the Python legacy system
 */
import type { FlashcardPackage, Question } from "@/types/flashcard";

/**
 * Convert a flashcard package to RemNote format
 */
export function convertToRemNoteFormat(pkg: FlashcardPackage): string {
  const lines: string[] = [];

  for (const question of pkg.questions) {
    lines.push(...convertQuestionToRemNote(question));
    lines.push(""); // Empty line between questions
  }

  return lines.join("\n");
}

/**
 * Convert a single question to RemNote format lines
 */
function convertQuestionToRemNote(question: Question): string[] {
  const lines: string[] = [];

  // Question line with == A) format
  lines.push(`${question.pregunta} == A)`);

  // Alternatives (first one is correct, already reordered)
  for (let i = 0; i < question.alternativas.length; i++) {
    const alt = question.alternativas[i];

    // Alternative with single space indentation
    lines.push(` -${alt.texto}`);

    // Comment for correct answer (first alternative) with 3 spaces indentation
    if (i === 0 && alt.comentario) {
      lines.push(`   -${alt.comentario}`);
    }
  }

  return lines;
}

/**
 * Export package to RemNote format and download as .txt file
 */
export function exportToRemNote(pkg: FlashcardPackage): void {
  try {
    // Convert to RemNote format
    const content = convertToRemNoteFormat(pkg);

    // Create blob with UTF-8 encoding
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${pkg.nombre}_remnote.txt`;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to export to RemNote:", error);
    throw new Error("Failed to export flashcards to RemNote format");
  }
}

/**
 * Generate preview of RemNote format (first N questions)
 */
export function getRemNotePreview(
  pkg: FlashcardPackage,
  maxQuestions: number = 3,
): string {
  const previewQuestions = pkg.questions.slice(0, maxQuestions);
  const previewPkg = { ...pkg, questions: previewQuestions };
  const content = convertToRemNoteFormat(previewPkg);

  if (pkg.questions.length > maxQuestions) {
    return `${content}\n... (${pkg.questions.length - maxQuestions} more questions)`;
  }

  return content;
}

/**
 * Validate RemNote format output
 */
export function validateRemNoteFormat(content: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const lines = content.split("\n");

  let alternativeCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for question line
    if (line.includes(" == A)")) {
      alternativeCount = 0;
    }
    // Check for alternative line (starts with space + dash)
    else if (line.match(/^ -/)) {
      alternativeCount++;
    }
    // Check for comment line (starts with 3 spaces + dash)
    else if (line.match(/^ {3}-/)) {
      // Comments should only appear after first alternative
      if (alternativeCount !== 1) {
        errors.push(`Line ${i + 1}: Comment not after first alternative`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
