/**
 * Parser for MIR exam PDF questions
 * Replicates the exact logic from the Python legacy system (extractor_con_comentario.py)
 */
import type { Alternative, Question } from "@/types/flashcard";
import type { ParserConfig } from "@/types/pdf";

/**
 * Parse questions from extracted PDF text
 * Follows the exact logic from Python's parsear_preguntas()
 */
export function parseQuestions(
  text: string,
  config: ParserConfig = {},
): Question[] {
  const { preserveOrder = false } = config;

  const questions: Question[] = [];
  const lines = text.split("\n");

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();

    // Search for start of question: ^\d+\.\s+.+$
    const match = line.match(/^(\d+)\.\s+(.+)$/);

    if (match) {
      const questionNumber = parseInt(match[1], 10);
      let questionText = match[2];

      i++;

      // Accumulate question text until we find "1." (start of alternatives)
      while (i < lines.length) {
        const next = lines[i].trim();

        if (!next) {
          i++;
          continue;
        }

        // Check if this is "1." (start of alternatives)
        if (/^1\.\s+.+$/.test(next)) {
          // Try to extract the 4 alternatives
          const alternatives: Array<{ numero: number; texto: string }> = [];
          let posTemp = i;

          for (let expectedNum = 1; expectedNum <= 4; expectedNum++) {
            // Skip empty lines
            while (posTemp < lines.length && !lines[posTemp].trim()) {
              posTemp++;
            }

            if (posTemp >= lines.length) {
              break;
            }

            const altLine = lines[posTemp].trim();
            const altMatch = altLine.match(/^(\d+)\.\s+(.+)$/);

            if (altMatch && parseInt(altMatch[1], 10) === expectedNum) {
              let altText = altMatch[2];
              posTemp++;

              // Accumulate multiline alternative text
              while (posTemp < lines.length) {
                const sig = lines[posTemp].trim();

                if (!sig) {
                  posTemp++;
                  continue;
                }

                // Stop if we find number., "Respuesta correcta", or "Comentario"
                if (
                  /^\d+\.\s+/.test(sig) ||
                  sig.startsWith("Respuesta correcta") ||
                  sig.startsWith("Comentario")
                ) {
                  break;
                }

                altText += ` ${sig}`;
                posTemp++;
              }

              alternatives.push({
                numero: expectedNum,
                texto: altText.trim(),
              });
            } else {
              break;
            }
          }

          // Search for "Respuesta correcta: X"
          let correctAnswer: number | null = null;
          if (posTemp < lines.length) {
            const answerLine = lines[posTemp].trim();
            const answerMatch = answerLine.match(
              /^Respuesta correcta:\s*(\d+)/,
            );
            if (answerMatch) {
              correctAnswer = parseInt(answerMatch[1], 10);
              posTemp++;
            }
          }

          // Search for "Comentario:"
          const [comment, newPos] = extractComment(lines, posTemp);

          // If we found 4 alternatives, save the question
          if (alternatives.length === 4) {
            // Reorder alternatives if there's a correct answer
            let finalAlternatives: Alternative[];

            if (correctAnswer && correctAnswer >= 1 && correctAnswer <= 4) {
              finalAlternatives = reorderAlternatives(
                alternatives,
                correctAnswer,
                comment,
                preserveOrder,
              );
            } else {
              finalAlternatives = alternatives.map((alt) => ({
                numero: alt.numero,
                texto: alt.texto,
              }));
            }

            questions.push({
              numero: questionNumber,
              pregunta: questionText.trim(),
              alternativas: finalAlternatives,
              respuesta_original: correctAnswer || 0,
              comentario: comment,
            });

            i = newPos;
            break;
          } else {
            // Not alternatives, continue reading the question
            questionText += ` ${next}`;
            i++;
          }
        } else {
          // Continue reading the question
          questionText += ` ${next}`;
          i++;
        }
      }
    } else {
      i++;
    }
  }

  return questions;
}

/**
 * Extract comment text after "Comentario:"
 * Follows the exact logic from Python's extraer_comentario()
 */
function extractComment(
  lines: string[],
  startPos: number,
): [string | null, number] {
  let comment = "";
  let pos = startPos;

  // Search for line containing "Comentario:"
  while (pos < lines.length) {
    const line = lines[pos].trim();

    if (!line) {
      pos++;
      continue;
    }

    // If we find "Comentario:"
    if (line.startsWith("Comentario:")) {
      // Extract text after "Comentario:"
      const afterText = line.replace("Comentario:", "").trim();
      if (afterText) {
        comment = afterText;
      }
      pos++;

      // Continue reading comment lines until we find a new question
      while (pos < lines.length) {
        const sig = lines[pos].trim();

        if (!sig) {
          pos++;
          continue;
        }

        // If it starts with number followed by period, it's a new question
        if (/^\d+\.\s+/.test(sig)) {
          break;
        }

        // Add to comment
        comment += ` ${sig}`;
        pos++;
      }

      return [comment.trim() || null, pos];
    }

    // If we find something else before the comment
    if (/^\d+\.\s+/.test(line)) {
      break;
    }

    pos++;
  }

  return [null, pos];
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Reorder alternatives to put the correct answer first
 * Follows the exact logic from Python's reordenar_alternativas()
 */
function reorderAlternatives(
  alternatives: Array<{ numero: number; texto: string }>,
  correctAnswer: number,
  comment: string | null,
  preserveOrder: boolean,
): Alternative[] {
  if (preserveOrder) {
    // Keep original order
    const altObjects: Alternative[] = alternatives.map((alt) => ({
      numero: alt.numero,
      texto: alt.texto,
    }));

    // Add comment to correct alternative
    if (comment) {
      altObjects[correctAnswer - 1].comentario = comment;
    }

    return altObjects;
  }

  // Find correct alternative
  let correctAlt: Alternative | null = null;
  const otherAlternatives: Alternative[] = [];

  for (const alt of alternatives) {
    if (alt.numero === correctAnswer) {
      correctAlt = {
        numero: alt.numero,
        texto: alt.texto,
      };
      // Add comment to correct alternative
      if (comment) {
        correctAlt.comentario = comment;
      }
    } else {
      otherAlternatives.push({
        numero: alt.numero,
        texto: alt.texto,
      });
    }
  }

  // Return reordered: correct first, then shuffled others
  if (correctAlt) {
    return [correctAlt, ...otherAlternatives];
  } else {
    return alternatives.map((alt) => ({
      numero: alt.numero,
      texto: alt.texto,
    }));
  }
}

/**
 * Validate a parsed question
 */
export function validateQuestion(question: Question): boolean {
  // Must have valid question text
  if (!question.pregunta || question.pregunta.length < 5) {
    return false;
  }

  // Must have exactly 4 alternatives
  if (question.alternativas.length !== 4) {
    return false;
  }

  // All alternatives must have text
  for (const alt of question.alternativas) {
    if (!alt.texto || alt.texto.length === 0) {
      return false;
    }
  }

  // Original answer must be 1-4 (or 0 if not found)
  if (question.respuesta_original < 0 || question.respuesta_original > 4) {
    return false;
  }

  return true;
}

/**
 * Get statistics about parsed questions
 */
export function getParsingStats(questions: Question[]): {
  total: number;
  withComments: number;
  averageAlternativeLength: number;
} {
  const total = questions.length;
  const withComments = questions.filter((q) => q.comentario !== null).length;

  let totalAltLength = 0;
  let altCount = 0;

  for (const q of questions) {
    for (const alt of q.alternativas) {
      totalAltLength += alt.texto.length;
      altCount++;
    }
  }

  return {
    total,
    withComments,
    averageAlternativeLength:
      altCount > 0 ? Math.round(totalAltLength / altCount) : 0,
  };
}
