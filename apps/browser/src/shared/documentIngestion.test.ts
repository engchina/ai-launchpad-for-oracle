import * as assert from "node:assert/strict";
import { test } from "node:test";
import { ingestTextDocument, MAX_TEXT_DOCUMENT_BYTES } from "./documentIngestion";

test("ingestTextDocument creates document chunks from markdown headings", () => {
  const result = ingestTextDocument({
    fileName: "rag-plan.md",
    documentId: "document-test",
    importedAt: "2026-05-14T00:00:00.000Z",
    text: "# RAG PoC\n\nVector index demo flow.\n\n## Checklist\n\n- Load documents\n- Run similarity query"
  });

  assert.equal(result.ok, true);
  if (!result.ok) {
    return;
  }

  assert.equal(result.document.title, "RAG PoC");
  assert.equal(result.chunks.length, 2);
  assert.equal(result.chunks[0].sourceKind, "document");
  assert.match(result.chunks[0].text, /Vector index demo/);
  assert.match(result.chunks[1].title, /Checklist/);
});

test("ingestTextDocument accepts txt files without markdown headings", () => {
  const result = ingestTextDocument({
    fileName: "notes.txt",
    documentId: "document-notes",
    text: "Oracle AI Database notes\n\nEmbedding model and vector search prerequisites."
  });

  assert.equal(result.ok, true);
  if (!result.ok) {
    return;
  }

  assert.equal(result.document.title, "notes");
  assert.equal(result.chunks.length, 1);
  assert.match(result.chunks[0].text, /Embedding model/);
});

test("ingestTextDocument rejects empty or unsupported documents", () => {
  const empty = ingestTextDocument({ fileName: "empty.md", text: "  \n  " });
  const unsupported = ingestTextDocument({ fileName: "deck.pdf", text: "content" });

  assert.deepEqual(empty, {
    ok: false,
    code: "empty_document",
    message: "空の文書は Knowledge に追加できません。"
  });
  assert.equal(unsupported.ok, false);
  if (!unsupported.ok) {
    assert.equal(unsupported.code, "unsupported_type");
  }
});

test("ingestTextDocument enforces max byte size", () => {
  const result = ingestTextDocument({
    fileName: "large.txt",
    text: "x".repeat(MAX_TEXT_DOCUMENT_BYTES + 1)
  });

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.code, "file_too_large");
  }
});
