/**
 * Progress bar for PDF upload and processing
 */
"use client";

import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { PDFProcessingProgress } from "@/types/pdf";

interface UploadProgressProps {
  progress: PDFProcessingProgress;
}

const stepLabels: Record<PDFProcessingProgress["step"], string> = {
  loading: "Cargando PDF",
  extracting: "Extrayendo texto",
  parsing: "Analizando preguntas",
  saving: "Guardando",
  complete: "Completado",
};

export function UploadProgress({ progress }: UploadProgressProps) {
  const label = stepLabels[progress.step];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        {progress.step !== "complete" && (
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        )}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <p className="text-sm font-medium">{label}</p>
            <p className="text-sm text-muted-foreground">
              {Math.round(progress.progress)}%
            </p>
          </div>
          {progress.message && (
            <p className="text-xs text-muted-foreground">{progress.message}</p>
          )}
        </div>
      </div>

      <Progress value={progress.progress} className="h-2" />
    </div>
  );
}
