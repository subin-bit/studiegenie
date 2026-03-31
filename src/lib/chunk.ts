type Chunk = {
  chunkIndex: number;
  content: string;
  pageNumber: number | null;
  tokenCount: number;
};

const DEFAULT_CHUNK_SIZE = 1800;
const DEFAULT_OVERLAP = 220;

export function normalizeStudyText(text: string) {
  return text
    .replace(/\r/g, "\n")
    .replace(/\t/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function estimateTokenCount(value: string) {
  return Math.ceil(value.split(/\s+/).length * 1.35);
}

export function splitIntoChunks(
  rawText: string,
  pageCount?: number | null,
  chunkSize = DEFAULT_CHUNK_SIZE,
  overlap = DEFAULT_OVERLAP,
) {
  const text = normalizeStudyText(rawText);
  const chunks: Chunk[] = [];

  if (!text) {
    return chunks;
  }

  let start = 0;
  let chunkIndex = 0;

  while (start < text.length) {
    let end = Math.min(start + chunkSize, text.length);

    if (end < text.length) {
      const paragraphBreak = text.lastIndexOf("\n\n", end);
      const sentenceBreak = text.lastIndexOf(". ", end);

      if (paragraphBreak > start + chunkSize * 0.55) {
        end = paragraphBreak;
      } else if (sentenceBreak > start + chunkSize * 0.55) {
        end = sentenceBreak + 1;
      }
    }

    const content = text.slice(start, end).trim();

    if (!content) {
      break;
    }

    chunks.push({
      chunkIndex,
      content,
      pageNumber: derivePageNumber(start, end, text.length, pageCount),
      tokenCount: estimateTokenCount(content),
    });

    if (end >= text.length) {
      break;
    }

    start = Math.max(end - overlap, start + 1);
    chunkIndex += 1;
  }

  return chunks;
}

function derivePageNumber(
  start: number,
  end: number,
  totalLength: number,
  pageCount?: number | null,
) {
  if (!pageCount || pageCount < 1 || totalLength < 1) {
    return null;
  }

  const midpoint = (start + end) / 2;

  return Math.max(
    1,
    Math.min(pageCount, Math.ceil((midpoint / totalLength) * pageCount)),
  );
}
