/**
 * Drag and drop zone for PDF upload
 */
"use client";

import { Upload } from "lucide-react";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  className?: string;
}

export function UploadZone({
  onFileSelect,
  disabled,
  className,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      const pdfFile = files.find(
        (file) =>
          file.type === "application/pdf" ||
          file.name.toLowerCase().endsWith(".pdf"),
      );

      if (pdfFile) {
        onFileSelect(pdfFile);
      }
    },
    [onFileSelect, disabled],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
      // Reset input so same file can be selected again
      e.target.value = "";
    },
    [onFileSelect],
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative border-2 border-dashed rounded-lg p-12 transition-colors",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-muted-foreground/50",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      <input
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileInput}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        id="pdf-upload-input"
      />

      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <Upload className="w-12 h-12 text-muted-foreground" />

        <div>
          <p className="text-lg font-medium">
            Arrastra tu PDF de examen MIR aquí
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            o haz clic para seleccionar un archivo
          </p>
        </div>

        <p className="text-xs text-muted-foreground">
          Máximo 50MB • Formato PDF
        </p>
      </div>
    </div>
  );
}
