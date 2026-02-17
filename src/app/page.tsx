/**
 * Home page - Display flashcard packages and upload new PDFs
 */
"use client";

import { AlertCircle, BookOpen, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PackageCard } from "@/components/flashcards/package-card";
import { UploadProgress } from "@/components/pdf/upload-progress";
import { UploadZone } from "@/components/pdf/upload-zone";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { usePDFUpload } from "@/hooks/use-pdf-upload";
import { exportToRemNote } from "@/lib/export/remnote";
import { useFlashcardsStore } from "@/lib/store/flashcards";

export default function Home() {
  const router = useRouter();
  const [showUpload, setShowUpload] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [skipFirstPage, setSkipFirstPage] = useState(true); // Marcado por defecto

  const packages = useFlashcardsStore((state) => state.packages);
  const loadPackages = useFlashcardsStore((state) => state.loadPackages);
  const deletePackage = useFlashcardsStore((state) => state.deletePackage);

  const { isUploading, progress, error, uploadPDF, reset } = usePDFUpload();

  // Load packages on mount
  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  // Handle file upload
  const handleFileSelect = async (file: File) => {
    const result = await uploadPDF(file, skipFirstPage);

    if (result.success) {
      toast.success(
        `¡Éxito! ${result.package?.totalQuestions} preguntas extraídas`,
      );
      setShowUpload(false);
      reset();
    } else {
      toast.error(result.error || "Error al procesar el PDF");
    }
  };

  // Handle study navigation
  const handleStudy = (packageId: string) => {
    router.push(`/study/${packageId}`);
  };

  // Handle export
  const handleExport = (pkg: (typeof packages)[0]) => {
    try {
      exportToRemNote(pkg);
      toast.success("Archivo RemNote descargado correctamente");
    } catch (_) {
      toast.error("Error al exportar a RemNote");
    }
  };

  // Handle delete
  const handleDelete = async (packageId: string) => {
    try {
      await deletePackage(packageId);
      toast.success("Paquete eliminado");
      setDeleteConfirm(null);
    } catch (_) {
      toast.error("Error al eliminar el paquete");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <BookOpen className="w-8 h-8" />
                MIR Flashcards
              </h1>
              <p className="text-muted-foreground mt-1">
                Convierte PDFs de exámenes en flashcards interactivos
              </p>
            </div>

            <Button onClick={() => setShowUpload(true)} size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Nuevo PDF
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {packages.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No hay paquetes aún</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Sube tu primer PDF de examen MIR para empezar a crear flashcards
            </p>
            <Button onClick={() => setShowUpload(true)} size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Subir PDF
            </Button>
          </div>
        ) : (
          // Package grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                package={pkg}
                onStudy={() => handleStudy(pkg.id)}
                onExport={() => handleExport(pkg)}
                onDelete={() => setDeleteConfirm(pkg.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Upload Dialog */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Subir PDF de examen</DialogTitle>
            <DialogDescription>
              Sube un PDF de examen MIR para convertirlo en flashcards
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {!isUploading && !progress && !error && (
              <>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="skip-first-page"
                    checked={skipFirstPage}
                    onCheckedChange={(checked) =>
                      setSkipFirstPage(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="skip-first-page"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Omitir primera página (portada)
                  </Label>
                </div>
                <UploadZone onFileSelect={handleFileSelect} />
              </>
            )}

            {isUploading && progress && <UploadProgress progress={progress} />}

            {error && (
              <div className="flex items-start gap-3 p-4 border-2 border-destructive rounded-lg bg-destructive/10">
                <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-destructive">Error</p>
                  <p className="text-sm text-destructive/90 mt-1">{error}</p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  reset();
                  setShowUpload(false);
                }}
              >
                Cerrar
              </Button>
              <Button onClick={() => reset()}>Intentar de nuevo</Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirm !== null}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar paquete?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. El paquete de flashcards será
              eliminado permanentemente.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
