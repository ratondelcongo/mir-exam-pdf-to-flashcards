/**
 * PDF text extraction using PDF.js
 */
import type { PDFProcessingProgress, TextExtraction } from "@/types/pdf";

/**
 * Extract text from a PDF file, respecting column layout
 */
export async function extractTextFromPDF(
  file: File,
  onProgress?: (progress: PDFProcessingProgress) => void,
  skipFirstPage: boolean = true,
): Promise<TextExtraction> {
  try {
    // Dynamic import to avoid SSR issues
    const pdfjsLib = await import("pdfjs-dist");

    // Configure PDF.js worker from local public folder
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    // Report loading progress
    onProgress?.({
      step: "loading",
      progress: 10,
      message: "Loading PDF...",
    });

    // Read file as array buffer
    const arrayBuffer = await file.arrayBuffer();

    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    const pageCount = pdf.numPages;
    let fullText = "";

    // Extract metadata
    const metadata = await pdf.getMetadata();
    // biome-ignore lint/suspicious/noExplicitAny: to be fixed in future refactor
    const info = metadata.info as any;
    const pdfMetadata = {
      title: info?.Title,
      author: info?.Author,
      subject: info?.Subject,
    };

    // Report extraction progress
    const startPage = skipFirstPage ? 2 : 1;
    const totalPagesToProcess = skipFirstPage ? pageCount - 1 : pageCount;

    onProgress?.({
      step: "extracting",
      progress: 20,
      message: `Extracting text from ${totalPagesToProcess} pages...${skipFirstPage ? " (skipping first page)" : ""}`,
    });

    // Process each page (skip first page if requested)
    for (let pageNum = startPage; pageNum <= pageCount; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.0 });
      const textContent = await page.getTextContent();

      // biome-ignore lint/suspicious/noExplicitAny: to be fixed in future refactor
      const items = textContent.items as any[];
      const filteredItems = items.filter(
        (item) => item.str && item.str.trim().length > 0,
      );

      // Get page dimensions
      const pageWidth = viewport.width;
      const pageHeight = viewport.height;
      const midWidth = pageWidth / 2;

      if (pageNum < 4) {
        // Log page dimensions and item count for first few pages for debugging
        console.log(
          `Page ${pageNum}: width=${pageWidth}, height=${pageHeight}, items=${filteredItems.length}`,
        );
        // Log positions of first few items for debugging
        filteredItems.forEach((item, index) => {
          console.log(
            `Item ${index}: text="${item.str}", x=${item.transform[4]}, y=${item.transform[5]}`,
          );
        });
      }

      // Separate items into left and right columns
      // transform[4] is X coordinate, transform[5] is Y coordinate
      const leftColumn = filteredItems.filter(
        (item) =>
          item.transform[4] < midWidth &&
          !(
            item.str.startsWith("www") ||
            item.str.startsWith("Pag.") ||
            item.str === "MEDICINA MIR" ||
            item.str === "Simulacro MIR"
          ),
      );
      const rightColumn = filteredItems.filter(
        (item) =>
          item.transform[4] >= midWidth &&
          !(
            item.str.startsWith("www") ||
            item.str.startsWith("Pag.") ||
            item.str === "MEDICINA AMIR" ||
            item.str === "Simulacro AMIR"
          ),
      );

      // Sort each column by Y position (top to bottom)
      // biome-ignore lint/suspicious/noExplicitAny: to be fixed in future refactor
      const sortByY = (a: any, b: any) => {
        // Higher Y values are at the top in PDF.js coordinate system
        return b.transform[5] - a.transform[5];
      };

      leftColumn.sort(sortByY);
      rightColumn.sort(sortByY);

      // Extract text from left column
      let leftText = "";
      let lastY = -1;

      for (const item of leftColumn) {
        const y = item.transform[5];

        // Add line break if Y position changed significantly
        if (lastY !== -1 && Math.abs(lastY - y) > 5) {
          leftText += "\n";
        }

        leftText += `${item.str} `;
        lastY = y;
      }

      // Extract text from right column
      let rightText = "";
      lastY = -1;

      for (const item of rightColumn) {
        const y = item.transform[5];

        // Add line break if Y position changed significantly
        if (lastY !== -1 && Math.abs(lastY - y) > 5) {
          rightText += "\n";
        }

        rightText += `${item.str} `;
        lastY = y;
      }

      // Combine columns: left first, then right
      const pageText = `${leftText}\n${rightText}`;
      fullText += `${pageText}\n\n`;

      // Update progress
      const processedPages = pageNum - startPage + 1;
      const progress = 20 + (processedPages / totalPagesToProcess) * 60;
      onProgress?.({
        step: "extracting",
        progress,
        message: `Processed page ${pageNum} of ${pageCount}`,
      });
    }

    onProgress?.({
      step: "extracting",
      progress: 80,
      message: "Text extraction complete",
    });

    return {
      text: fullText.trim(),
      pageCount,
      metadata: pdfMetadata,
    };
  } catch (error) {
    console.error("Error extracting PDF text:", error);
    throw new Error(
      `Failed to extract text from PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Validate that a file is a PDF
 */
export function isPDFFile(file: File): boolean {
  return (
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
  );
}

/**
 * Validate PDF file size (max 50MB)
 */
export function validatePDFSize(file: File, maxSizeMB: number = 50): boolean {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxBytes;
}
