/**
 * Card component for displaying a flashcard package
 */
"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { BookOpen, Calendar, Download, FileText, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { FlashcardPackage } from "@/types/flashcard";

interface PackageCardProps {
  package: FlashcardPackage;
  onStudy: () => void;
  onExport: () => void;
  onDelete: () => void;
}

export function PackageCard({
  package: pkg,
  onStudy,
  onExport,
  onDelete,
}: PackageCardProps) {
  const formattedDate = format(pkg.createdAt, "d 'de' MMMM, yyyy", {
    locale: es,
  });
  const fileSizeMB = (pkg.metadata.fileSize / (1024 * 1024)).toFixed(2);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="truncate">{pkg.nombre}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-2">
              <Calendar className="w-3 h-3" />
              <span>{formattedDate}</span>
            </CardDescription>
          </div>
          <Badge variant="secondary" className="shrink-0">
            {pkg.totalQuestions} preguntas
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <FileText className="w-3 h-3" />
            <span>{pkg.metadata.pageCount} páginas</span>
          </div>
          <span>•</span>
          <span>{fileSizeMB} MB</span>
          {pkg.questions.filter((q) => q.comentario).length > 0 && (
            <>
              <span>•</span>
              <span>
                {pkg.questions.filter((q) => q.comentario).length} con
                comentarios
              </span>
            </>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2">
        <Button onClick={onStudy} className="flex-1" size="sm">
          <BookOpen className="w-4 h-4 mr-2" />
          Estudiar
        </Button>
        <Button onClick={onExport} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Exportar
        </Button>
        <Button
          onClick={onDelete}
          variant="ghost"
          size="sm"
          className="text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
