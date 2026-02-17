/**
 * Study page - Flashcard viewer
 */
"use client";

import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Flashcard } from "@/components/flashcards/flashcard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useFlashcardsStore } from "@/lib/store/flashcards";

interface StudyPageProps {
  params: Promise<{
    packageId: string;
  }>;
}

export default function StudyPage({ params }: StudyPageProps) {
  const router = useRouter();
  const [packageId, setPackageId] = useState<string | null>(null);

  // Unwrap params
  useEffect(() => {
    params.then((p) => setPackageId(p.packageId));
  }, [params]);

  const packages = useFlashcardsStore((state) => state.packages);
  const loadPackages = useFlashcardsStore((state) => state.loadPackages);
  const pkg = useFlashcardsStore((state) =>
    packageId ? state.getPackage(packageId) : undefined,
  );
  const studyProgress = useFlashcardsStore((state) =>
    packageId ? state.studyProgress.get(packageId) : undefined,
  );

  const initStudyProgress = useFlashcardsStore(
    (state) => state.initStudyProgress,
  );
  const nextQuestion = useFlashcardsStore((state) => state.nextQuestion);
  const previousQuestion = useFlashcardsStore(
    (state) => state.previousQuestion,
  );
  const toggleAnswerRevealed = useFlashcardsStore(
    (state) => state.toggleAnswerRevealed,
  );
  const markCorrect = useFlashcardsStore((state) => state.markCorrect);
  const markIncorrect = useFlashcardsStore((state) => state.markIncorrect);
  const resetProgress = useFlashcardsStore((state) => state.resetProgress);

  // Load packages if not already loaded (for direct link access)
  useEffect(() => {
    if (packages.length === 0) {
      loadPackages();
    }
  }, [packages.length, loadPackages]);

  // Initialize progress on mount
  useEffect(() => {
    if (packageId) {
      initStudyProgress(packageId);
    }
  }, [packageId, initStudyProgress]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!packageId) return;

      if (e.key === "ArrowLeft") {
        previousQuestion(packageId);
      } else if (e.key === "ArrowRight") {
        nextQuestion(packageId);
      } else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        toggleAnswerRevealed(packageId);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [packageId, nextQuestion, previousQuestion, toggleAnswerRevealed]);

  if (!packageId || !pkg) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!studyProgress) {
    return null;
  }

  const currentQuestion = pkg.questions[studyProgress.currentIndex];
  const progressPercentage =
    ((studyProgress.currentIndex + 1) / pkg.totalQuestions) * 100;
  const isFirstQuestion = studyProgress.currentIndex === 0;
  const isLastQuestion = studyProgress.currentIndex === pkg.totalQuestions - 1;

  const handlePrevious = () => {
    previousQuestion(packageId);
  };

  const handleNext = () => {
    nextQuestion(packageId);
  };

  const handleToggleAnswer = () => {
    toggleAnswerRevealed(packageId);
  };

  const handleMarkCorrect = () => {
    markCorrect(packageId, studyProgress.currentIndex);
    if (!isLastQuestion) {
      setTimeout(() => nextQuestion(packageId), 300);
    }
  };

  const handleMarkIncorrect = () => {
    markIncorrect(packageId, studyProgress.currentIndex);
    if (!isLastQuestion) {
      setTimeout(() => nextQuestion(packageId), 300);
    }
  };

  const handleReset = () => {
    resetProgress(packageId);
  };

  const correctCount = studyProgress.correctAnswers.size;
  const incorrectCount = studyProgress.incorrectAnswers.size;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <Button variant="ghost" onClick={() => router.push("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>

            <div className="flex-1 max-w-md">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
                <span>{pkg.nombre}</span>
                <span>
                  {studyProgress.currentIndex + 1} / {pkg.totalQuestions}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            <div className="flex items-center gap-2">
              {correctCount > 0 && (
                <Badge variant="default" className="bg-green-500">
                  <Check className="w-3 h-3 mr-1" />
                  {correctCount}
                </Badge>
              )}
              {incorrectCount > 0 && (
                <Badge variant="destructive">
                  <X className="w-3 h-3 mr-1" />
                  {incorrectCount}
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Flashcard */}
          <Flashcard
            question={currentQuestion}
            showAnswer={studyProgress.answerRevealed}
            onToggleAnswer={handleToggleAnswer}
            questionNumber={studyProgress.currentIndex + 1}
            totalQuestions={pkg.totalQuestions}
          />

          {/* Navigation buttons */}
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstQuestion}
              size="lg"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Anterior
            </Button>

            {studyProgress.answerRevealed && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleMarkIncorrect}
                  className="border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <X className="w-4 h-4 mr-2" />
                  Incorrecta
                </Button>
                <Button
                  variant="outline"
                  onClick={handleMarkCorrect}
                  className="border-green-500 text-green-500 hover:bg-green-50 dark:hover:bg-green-950/20"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Correcta
                </Button>
              </div>
            )}

            <Button
              variant="outline"
              onClick={handleNext}
              disabled={isLastQuestion}
              size="lg"
            >
              Siguiente
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          {/* Keyboard shortcuts hint */}
          <p className="text-xs text-muted-foreground text-center">
            Usa ← → para navegar, Espacio/Enter para revelar respuesta
          </p>
        </div>
      </main>
    </div>
  );
}
