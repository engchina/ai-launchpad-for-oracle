import {
  defaultOracleVectorSearchConfig,
  executeOracleVectorSearchDryRun,
  normalizeOracleVectorSearchConfig,
  type OracleVectorSearchConfig,
  type OracleVectorSearchExecutionResult
} from "./oracleVectorSearch";

export type RagSourceKind = "page" | "selection" | "screenshot" | "document";
export type RagAdapterId = "local-keyword" | "oracle-vector-search";
export type RagAdapterStatus = "ready" | "not_configured" | "invalid_config" | "dry_run" | "unavailable";

export type { OracleVectorSearchConfig, OracleVectorSearchExecutionResult, OracleVectorSearchPlan } from "./oracleVectorSearch";
export {
  createOracleVectorSearchPlan,
  defaultOracleVectorSearchConfig,
  executeOracleVectorSearchDryRun,
  getMissingOracleVectorSearchConfigFields,
  isOracleVectorSearchConfigured,
  normalizeOracleVectorSearchConfig
} from "./oracleVectorSearch";

export type RagAdapterHealth = {
  adapter: RagAdapterId;
  status: RagAdapterStatus;
  message: string;
  config?: OracleVectorSearchConfig;
};

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
  adapter?: RagAdapterId;
  oracleVectorSearch?: OracleVectorSearchConfig;
};

export type RagAskResult = {
  question: string;
  answer: string;
  results: RagSearchResult[];
  status: "empty" | "no_match" | "answered" | "adapter_unavailable" | "adapter_dry_run";
  adapter: RagAdapterId;
  adapterStatus?: RagAdapterStatus;
  oracleVectorSearch?: OracleVectorSearchExecutionResult;
  latencyMs?: number;
};

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

export function getRagAdapterHealth(adapter: RagAdapterId, config?: OracleVectorSearchConfig): RagAdapterHealth {
  if (adapter === "local-keyword") {
    return {
      adapter,
      status: "ready",
      message: "Local keyword retrieval is ready."
    };
  }

  const effectiveConfig = normalizeOracleVectorSearchConfig(config);
  if (!effectiveConfig.configured) {
    return {
      adapter,
      status: "not_configured",
      message:
        "Oracle Vector Search adapter はまだ設定されていません。次フェーズで connection、table、vector column、embedding model を接続します。",
      config: effectiveConfig
    };
  }

  return {
    adapter,
    status: "dry_run",
    message: "Oracle Vector Search adapter の dry-run 契約は定義済みです。実 DB 呼び出しはまだ実装していません。",
    config: effectiveConfig
  };
}

function answerOracleVectorSearchQuestion(payload: RagAskPayload, startedAt: number): RagAskResult {
  const normalizedQuestion = payload.question.trim() || "現在の knowledge set から PoC に使える要点を整理してください。";
  const execution = executeOracleVectorSearchDryRun({
    question: normalizedQuestion,
    config: payload.oracleVectorSearch ?? defaultOracleVectorSearchConfig,
    maxResults: payload.maxResults
  });
  const adapterStatus =
    execution.status === "dry_run"
      ? "dry_run"
      : execution.status === "invalid_config"
        ? "invalid_config"
        : execution.status === "not_configured"
          ? "not_configured"
          : "unavailable";

  return {
    question: normalizedQuestion,
    answer:
      execution.status === "dry_run"
        ? `${execution.message} SQL preview と bind contract を確認してください。`
        : `${execution.message} ${execution.validationErrors?.join(" ") ?? ""}`.trim(),
    results: [],
    status: execution.status === "dry_run" ? "adapter_dry_run" : "adapter_unavailable",
    adapter: "oracle-vector-search",
    adapterStatus,
    oracleVectorSearch: execution,
    latencyMs: Math.round(performance.now() - startedAt)
  };
}

function answerLocalKeywordQuestion(payload: RagAskPayload, startedAt: number): RagAskResult {
  const normalizedQuestion = payload.question.trim() || "現在の knowledge set から PoC に使える要点を整理してください。";

  if (payload.chunks.length === 0) {
    return {
      question: normalizedQuestion,
      answer: "Knowledge set が空です。まず captures を knowledge に追加してください。",
      results: [],
      status: "empty",
      adapter: "local-keyword",
      adapterStatus: "ready",
      latencyMs: Math.round(performance.now() - startedAt)
    };
  }

  const results = searchRagChunks(normalizedQuestion, payload.chunks, payload.maxResults);

  if (results.length === 0) {
    return {
      question: normalizedQuestion,
      answer:
        `質問「${normalizedQuestion}」に一致する根拠は、現在の knowledge set からは見つかりませんでした。capture を追加するか、より具体的な Oracle service / demo step / URL キーワードで再検索してください。`,
      results: [],
      status: "no_match",
      adapter: "local-keyword",
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
      `質問「${normalizedQuestion}」に対して、現在の local retrieval では ${sourceSummary} を根拠として使えます。回答本文はまだ生成 AI ではなく deterministic summary ですが、source selection は keyword score に基づく実検索結果です。次フェーズでは同じ interface を embedding / Oracle AI Vector Search adapter に差し替えます。`,
    results,
    status: "answered",
    adapter: "local-keyword",
    adapterStatus: "ready",
    latencyMs: Math.round(performance.now() - startedAt)
  };
}

export function answerRagQuestion(payload: RagAskPayload): RagAskResult {
  const startedAt = performance.now();
  const adapter = payload.adapter ?? "local-keyword";

  if (adapter === "oracle-vector-search") {
    return answerOracleVectorSearchQuestion(payload, startedAt);
  }

  return answerLocalKeywordQuestion(payload, startedAt);
}
