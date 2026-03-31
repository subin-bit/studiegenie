import "pdfjs-dist/legacy/build/pdf.worker.mjs";
import { PDFParse } from "pdf-parse";
import { normalizeStudyText } from "@/lib/chunk";

export async function extractPdfText(buffer: Buffer) {
  const parser = new PDFParse({ data: buffer });

  try {
    const parsed = await parser.getText();
    const text = normalizeStudyText(parsed.text ?? "");

    return {
      pageCount: parsed.total ?? parsed.pages.length ?? null,
      text,
    };
  } finally {
    await parser.destroy();
  }
}
