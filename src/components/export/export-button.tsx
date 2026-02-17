/**
 * Button component for exporting flashcards to RemNote format
 */
"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportToRemNote } from "@/lib/export/remnote";
import type { FlashcardPackage } from "@/types/flashcard";

interface ExportButtonProps {
  package: FlashcardPackage;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function ExportButton({
  package: pkg,
  variant = "outline",
  size = "default",
  className,
}: ExportButtonProps) {
  const handleExport = () => {
    exportToRemNote(pkg);
  };

  return (
    <Button
      onClick={handleExport}
      variant={variant}
      size={size}
      className={className}
    >
      <Download className="w-4 h-4 mr-2" />
      Exportar a RemNote
    </Button>
  );
}
