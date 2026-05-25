import type { CapturedPage } from "../data/mockData";
import {
  answerRagQuestion,
  searchRagChunks,
  truncateRagText,
  type OracleVectorSearchConfig,
  type RagAdapterId,
  type RagAskResult,
  type RagChunk,
  type RagSearchResult
} from "../../../shared/rag";

export type KnowledgeChunk = RagChunk;
export type KnowledgeSearchResult = RagSearchResult;
export type GroundedKnowledgeAnswer = RagAskResult;

export function createKnowledgeChunk(capture: CapturedPage): KnowledgeChunk {
  const base = `${capture.title}\nSource URL: ${capture.url}`;
  let text = base;

  if (capture.kind === "selection") {
    text = `${base}\nSelected text:\n${capture.selectedText || "No selected text."}`;
  } else if (capture.kind === "screenshot") {
    text = `${base}\nScreenshot note:\nA screenshot was captured for this page. Use it as visual context for demo or follow-up material.`;
  } else if (capture.summary) {
    text = `${base}\nSummary:\n${capture.summary}`;
  } else {
    text = `${base}\nPage metadata captured for later Oracle sales enablement work.`;
  }

  return {
    id: `chunk-${capture.id}`,
    captureId: capture.id,
    title: capture.title,
    sourceUrl: capture.url,
    sourceKind: capture.kind,
    text: truncateRagText(text)
  };
}

export function createKnowledgeChunks(captures: CapturedPage[], captureIds: string[]): KnowledgeChunk[] {
  const captureById = new Map(captures.map((capture) => [capture.id, capture]));

  return captureIds.flatMap((captureId) => {
    const capture = captureById.get(captureId);
    return capture ? [createKnowledgeChunk(capture)] : [];
  });
}

export function searchKnowledge(question: string, chunks: KnowledgeChunk[], maxResults = 3): KnowledgeSearchResult[] {
  return searchRagChunks(question, chunks, maxResults);
}

export function answerKnowledgeQuestion(
  question: string,
  chunks: KnowledgeChunk[],
  maxResults = 3,
  adapter: RagAdapterId = "local-keyword",
  oracleVectorSearch?: OracleVectorSearchConfig
): GroundedKnowledgeAnswer {
  return answerRagQuestion({ question, chunks, maxResults, adapter, oracleVectorSearch });
}
