/**
 * Flashcard component for displaying a question and its alternatives
 */
"use client";

import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { shuffleArray } from "@/lib/pdf/parser";
import { cn } from "@/lib/utils";
import type { Question } from "@/types/flashcard";

interface FlashcardProps {
  question: Question;
  showAnswer: boolean;
  onToggleAnswer: () => void;
  questionNumber?: number;
  totalQuestions?: number;
}

export function Flashcard({
  question,
  showAnswer,
  onToggleAnswer,
  questionNumber,
  totalQuestions,
}: FlashcardProps) {
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-lg sm:text-xl flex-1">
            <span className="text-muted-foreground mr-2">
              {questionNumber !== undefined
                ? `${questionNumber}.`
                : `${question.numero}.`}
            </span>
            {question.pregunta}
          </CardTitle>
          {totalQuestions && questionNumber && (
            <Badge variant="outline" className="shrink-0">
              {questionNumber}/{totalQuestions}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Alternatives */}
        <div className="space-y-3">
          {shuffleArray(question.alternativas).map((alt, index) => {
            const isCorrect = index === 0; // First alternative is always correct after reordering

            return (
              <div
                key={alt.numero}
                className={cn(
                  "p-4 rounded-lg border-2 transition-colors",
                  showAnswer && isCorrect
                    ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                    : "border-border bg-card",
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="text-sm font-medium text-muted-foreground shrink-0">
                    {index + 1}.
                  </span>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm leading-relaxed">{alt.texto}</p>

                    {/* Comment (only shown when answer is revealed and this is the correct alternative) */}
                    {showAnswer && isCorrect && alt.comentario && (
                      <div className="mt-3 pl-4 border-l-2 border-green-500">
                        <p className="text-xs text-muted-foreground font-medium mb-1">
                          Comentario:
                        </p>
                        <p className="text-sm text-foreground">
                          {alt.comentario}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Checkmark for correct answer when revealed */}
                  {showAnswer && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Toggle answer button */}
        <div className="flex justify-center pt-2">
          <Button
            onClick={onToggleAnswer}
            variant={showAnswer ? "outline" : "default"}
          >
            {showAnswer ? (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                Ocultar respuesta
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Revelar respuesta
              </>
            )}
          </Button>
        </div>

        {/* Original answer info (for debugging/verification) */}
        {showAnswer && (
          <div className="pt-2 text-xs text-muted-foreground text-center">
            Respuesta original: {question.respuesta_original}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
