import type { RagChunk } from "./rag";
import { truncateRagText } from "./rag";

export const MAX_TEXT_DOCUMENT_BYTES = 1_048_576;
export const SUPPORTED_TEXT_DOCUMENT_EXTENSIONS = [".md", ".txt"] as const;

export type SupportedTextDocumentExtension = (typeof SUPPORTED_TEXT_DOCUMENT_EXTENSIONS)[number];

export type KnowledgeDocument = {
  id: string;
  title: string;
  fileName: string;
  sourceUrl: string;
  byteLength: number;
  importedAt: string;
};

export type IngestTextDocumentPayload = {
  fileName: string;
  text: string;
  sourcePath?: string;
  documentId?: string;
  importedAt?: string;
  maxBytes?: number;
  maxChunkChars?: number;
};

export type IngestTextDocumentResult =
  | {
      ok: true;
      document: KnowledgeDocument;
      chunks: RagChunk[];
    }
  | {
      ok: false;
      code: "unsupported_type" | "empty_document" | "file_too_large";
      message: string;
    };

function textByteLength(text: string): number {
  return new TextEncoder().encode(text).byteLength;
}

function getExtension(fileName: string): string {
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex === -1 ? "" : fileName.slice(dotIndex).toLowerCase();
}

function isSupportedTextDocument(fileName: string): boolean {
  return SUPPORTED_TEXT_DOCUMENT_EXTENSIONS.includes(getExtension(fileName) as SupportedTextDocumentExtension);
}

function normalizeLineEndings(text: string): string {
  return text.replace(/\r\n?/g, "\n");
}

function normalizeInlineText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function titleFromText(fileName: string, text: string): string {
  const heading = normalizeLineEndings(text)
    .split("\n")
    .map((line) => line.trim())
    .find((line) => /^#{1,6}\s+\S/.test(line));

  if (heading) {
    return heading.replace(/^#{1,6}\s+/, "").trim();
  }

  return fileName.replace(/\.(md|txt)$/i, "");
}

function sourceUrlForDocument(fileName: string, sourcePath?: string): string {
  if (sourcePath) {
    return `file://${sourcePath.replace(/\\/g, "/")}`;
  }

  return `document://${encodeURIComponent(fileName)}`;
}

function splitMarkdownSections(text: string): Array<{ title: string; text: string }> {
  const lines = normalizeLineEndings(text).split("\n");
  const sections: Array<{ title: string; lines: string[] }> = [];
  let current: { title: string; lines: string[] } | undefined;

  for (const line of lines) {
    const headingMatch = /^(#{1,6})\s+(.+)$/.exec(line.trim());
    if (headingMatch) {
      if (current && current.lines.join("\n").trim()) {
        sections.push(current);
      }
      current = { title: headingMatch[2].trim(), lines: [line] };
      continue;
    }

    if (!current) {
      current = { title: "Document", lines: [] };
    }

    current.lines.push(line);
  }

  if (current && current.lines.join("\n").trim()) {
    sections.push(current);
  }

  return sections.map((section) => ({
    title: section.title,
    text: section.lines.join("\n").trim()
  }));
}

function splitLongText(text: string, maxChunkChars: number): string[] {
  const paragraphs = normalizeLineEndings(text)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const chunks: string[] = [];
  let current = "";

  for (const paragraph of paragraphs) {
    if (!current) {
      current = paragraph;
      continue;
    }

    if (`${current}\n\n${paragraph}`.length <= maxChunkChars) {
      current = `${current}\n\n${paragraph}`;
    } else {
      chunks.push(current);
      current = paragraph;
    }
  }

  if (current) {
    chunks.push(current);
  }

  return chunks.flatMap((chunk) => {
    if (chunk.length <= maxChunkChars) {
      return [chunk];
    }

    const parts: string[] = [];
    for (let index = 0; index < chunk.length; index += maxChunkChars) {
      parts.push(chunk.slice(index, index + maxChunkChars));
    }
    return parts;
  });
}

function createDocumentChunks(document: KnowledgeDocument, text: string, maxChunkChars: number): RagChunk[] {
  const sections = splitMarkdownSections(text);
  const rawChunks = sections.flatMap((section) =>
    splitLongText(section.text, maxChunkChars).map((chunkText, index) => ({
      sectionTitle: section.title,
      chunkText,
      partIndex: index + 1
    }))
  );

  return rawChunks.map((chunk, index) => ({
    id: `${document.id}-chunk-${index + 1}`,
    captureId: document.id,
    title:
      chunk.partIndex === 1
        ? `${document.title} / ${chunk.sectionTitle}`
        : `${document.title} / ${chunk.sectionTitle} (${chunk.partIndex})`,
    sourceUrl: document.sourceUrl,
    sourceKind: "document",
    text: truncateRagText(
      [
        `Document: ${document.title}`,
        `File: ${document.fileName}`,
        `Section: ${chunk.sectionTitle}`,
        "",
        chunk.chunkText
      ].join("\n"),
      Math.max(maxChunkChars + 240, 420)
    )
  }));
}

export function ingestTextDocument(payload: IngestTextDocumentPayload): IngestTextDocumentResult {
  const maxBytes = payload.maxBytes ?? MAX_TEXT_DOCUMENT_BYTES;
  const maxChunkChars = payload.maxChunkChars ?? 900;
  const trimmedText = payload.text.trim();

  if (!isSupportedTextDocument(payload.fileName)) {
    return {
      ok: false,
      code: "unsupported_type",
      message: ".md または .txt ファイルを選択してください。"
    };
  }

  if (!trimmedText) {
    return {
      ok: false,
      code: "empty_document",
      message: "空の文書は Knowledge に追加できません。"
    };
  }

  const byteLength = textByteLength(payload.text);
  if (byteLength > maxBytes) {
    return {
      ok: false,
      code: "file_too_large",
      message: `文書サイズが上限 ${Math.round(maxBytes / 1024)} KB を超えています。`
    };
  }

  const document: KnowledgeDocument = {
    id: payload.documentId ?? `document-${Date.now().toString(36)}`,
    title: titleFromText(payload.fileName, payload.text),
    fileName: payload.fileName,
    sourceUrl: sourceUrlForDocument(payload.fileName, payload.sourcePath),
    byteLength,
    importedAt: payload.importedAt ?? new Date().toISOString()
  };
  const chunks = createDocumentChunks(document, normalizeInlineText(payload.text) ? payload.text : trimmedText, maxChunkChars);

  return {
    ok: true,
    document,
    chunks
  };
}
