export type RagSourceKind = "page" | "selection" | "screenshot" | "document";
export type RagAdapterId = "oci-genai-enterprise-ai";
export type RagAdapterStatus = "ready" | "unavailable";

export type RagChunk = {
  id: string;
  captureId: string;
  title: string;
  sourceUrl: string;
  sourceKind: RagSourceKind;
  text: string;
};

export type RagSearchResult = {
  chunk: RagChunk;
  score: number;
  matchedTerms: string[];
  excerpt: string;
};

export type RagAskPayload = {
  question: string;
  chunks: RagChunk[];
  maxResults?: number;
};

export type RagAskResult = {
  question: string;
  answer: string;
  results: RagSearchResult[];
  status: "empty" | "no_match" | "answered" | "adapter_unavailable";
  adapter: RagAdapterId;
  adapterStatus?: RagAdapterStatus;
  answerProvider?: "deterministic" | "oci-genai";
  latencyMs?: number;
};

const defaultKnowledgeQuestion = "現在の captures から OCI GenAI Enterprise AI の検討ポイントを整理してください。";

const stopWords = new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "this",
  "that",
  "please",
  "について",
  "してください",
  "ください",
  "整理",
  "要点",
  "現在",
  "使う",
  "から",
  "です",
  "ます"
]);

const sourceKindLabels: Record<RagSourceKind, string> = {
  page: "Page",
  selection: "Selection",
  screenshot: "Screenshot",
  document: "Document"
};

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeForSearch(value: string): string {
  return value.normalize("NFKC").toLowerCase();
}

export function truncateRagText(value: string, maxLength = 420): string {
  const normalized = normalizeText(value);
  return normalized.length > maxLength ? `${normalized.slice(0, maxLength - 1)}...` : normalized;
}

function tokenize(value: string): string[] {
  const terms = normalizeForSearch(value).match(/[\p{L}\p{N}]+/gu) ?? [];
  const uniqueTerms = new Set<string>();

  for (const term of terms) {
    if (term.length < 2 || stopWords.has(term)) {
      continue;
    }

    uniqueTerms.add(term);
  }

  return Array.from(uniqueTerms);
}

function countOccurrences(value: string, term: string): number {
  if (!value || !term) {
    return 0;
  }

  return value.split(term).length - 1;
}

export function normalizeRagQuestion(question: string): string {
  return question.trim() || defaultKnowledgeQuestion;
}

function createExcerpt(chunk: RagChunk, matchedTerms: string[]): string {
  const normalized = normalizeText(chunk.text);
  const lowered = normalizeForSearch(normalized);
  const firstMatchIndex = matchedTerms.reduce<number>((bestIndex, term) => {
    const index = lowered.indexOf(term);
    if (index === -1) {
      return bestIndex;
    }

    return bestIndex === -1 ? index : Math.min(bestIndex, index);
  }, -1);

  if (firstMatchIndex === -1) {
    return truncateRagText(normalized, 180);
  }

  const start = Math.max(firstMatchIndex - 48, 0);
  const end = Math.min(firstMatchIndex + 132, normalized.length);
  const prefix = start > 0 ? "..." : "";
  const suffix = end < normalized.length ? "..." : "";

  return `${prefix}${normalized.slice(start, end)}${suffix}`;
}

export function searchRagChunks(question: string, chunks: RagChunk[], maxResults = 3): RagSearchResult[] {
  const terms = tokenize(question);

  if (chunks.length === 0) {
    return [];
  }

  if (terms.length === 0) {
    return chunks.slice(0, maxResults).map((chunk) => ({
      chunk,
      score: 0.1,
      matchedTerms: [],
      excerpt: truncateRagText(chunk.text, 180)
    }));
  }

  return chunks
    .map((chunk) => {
      const title = normalizeForSearch(chunk.title);
      const text = normalizeForSearch(chunk.text);
      const url = normalizeForSearch(chunk.sourceUrl);
      const matchedTerms = terms.filter((term) => title.includes(term) || text.includes(term) || url.includes(term));
      const score = matchedTerms.reduce((total, term) => {
        const titleScore = countOccurrences(title, term) * 4;
        const textScore = countOccurrences(text, term) * 2;
        const urlScore = countOccurrences(url, term);
        return total + titleScore + textScore + urlScore;
      }, 0);

      return {
        chunk,
        score,
        matchedTerms,
        excerpt: createExcerpt(chunk, matchedTerms)
      };
    })
    .filter((result) => result.score > 0)
    .sort((left, right) => right.score - left.score || left.chunk.title.localeCompare(right.chunk.title, "ja"))
    .slice(0, maxResults);
}

export function answerRagQuestion(payload: RagAskPayload): RagAskResult {
  const startedAt = performance.now();
  const normalizedQuestion = normalizeRagQuestion(payload.question);

  if (payload.chunks.length === 0) {
    return {
      question: normalizedQuestion,
      answer: "Capture context が空です。まずページ、選択テキスト、またはスクリーンショットを Captures に保存してください。",
      results: [],
      status: "empty",
      adapter: "oci-genai-enterprise-ai",
      adapterStatus: "ready",
      latencyMs: Math.round(performance.now() - startedAt)
    };
  }

  const results = searchRagChunks(normalizedQuestion, payload.chunks, payload.maxResults);

  if (results.length === 0) {
    return {
      question: normalizedQuestion,
      answer:
        `質問「${normalizedQuestion}」に対して OCI GenAI Enterprise AI へ渡せる根拠は、現在の captures からは見つかりませんでした。capture を追加するか、より具体的な Oracle service / demo step / URL キーワードで再検索してください。`,
      results: [],
      status: "no_match",
      adapter: "oci-genai-enterprise-ai",
      adapterStatus: "ready",
      latencyMs: Math.round(performance.now() - startedAt)
    };
  }

  const sourceSummary = results
    .map((result) => `${result.chunk.title} (${sourceKindLabels[result.chunk.sourceKind]}, score ${result.score})`)
    .join(" / ");

  return {
    question: normalizedQuestion,
    answer:
      `質問「${normalizedQuestion}」に対して、OCI GenAI Enterprise AI の回答生成に使う根拠候補として ${sourceSummary} を選択しました。`,
    results,
    status: "answered",
    adapter: "oci-genai-enterprise-ai",
    adapterStatus: "ready",
    latencyMs: Math.round(performance.now() - startedAt)
  };
}
