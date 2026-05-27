import type { OracleVectorSearchExecutionResult } from "../../../shared/oracleVectorSearch";
import type { RagSearchResult } from "../../../shared/rag";

type FormatKnowledgeAnswerMarkdownInput = {
  workspaceName: string;
  playbookTitle: string;
  question: string;
  answer: string;
  adapterStatus: string;
  sources: RagSearchResult[];
  oracleVectorExecution: OracleVectorSearchExecutionResult | null;
};

function normalizeFileNameSegment(value: string, fallback: string): string {
  return (
    value
      .trim()
      .split("")
      .map((character) => (character.charCodeAt(0) < 32 || '<>:"/\\|?*'.includes(character) ? "-" : character))
      .join("")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || fallback
  );
}

export function createKnowledgeAnswerFileName(workspaceName: string, generatedAt: string): string {
  const safeWorkspaceName = normalizeFileNameSegment(workspaceName, "knowledge-answer");
  const safeDate = generatedAt.slice(0, 10) || new Date().toISOString().slice(0, 10);

  return `${safeWorkspaceName}-grounded-answer-${safeDate}.md`;
}

export function createOracleVectorSqlFileName(workspaceName: string, generatedAt: string): string {
  const safeWorkspaceName = normalizeFileNameSegment(workspaceName, "oracle-vector");
  const safeDate = generatedAt.slice(0, 10) || new Date().toISOString().slice(0, 10);

  return `${safeWorkspaceName}-oracle-vector-plan-${safeDate}.sql`;
}

function formatSources(sources: RagSearchResult[]): string[] {
  if (sources.length === 0) {
    return ["根拠 source はありません。"];
  }

  return sources.flatMap((source, index) => [
    `${index + 1}. ${source.chunk.title}`,
    `   - URL: ${source.chunk.sourceUrl}`,
    `   - Kind: ${source.chunk.sourceKind}`,
    `   - Score: ${source.score}`,
    `   - Matched terms: ${source.matchedTerms.length > 0 ? source.matchedTerms.join(", ") : "none"}`,
    `   - Excerpt: ${source.excerpt}`
  ]);
}

function formatOracleVectorExecution(execution: OracleVectorSearchExecutionResult | null): string[] {
  if (!execution) {
    return [];
  }

  const lines = [
    "## Oracle Vector Search",
    "",
    `- Status: ${execution.status}`,
    `- Message: ${execution.message}`,
    `- Executed at: ${execution.executedAt}`,
    `- Latency: ${execution.latencyMs}ms`
  ];

  if (execution.validationErrors && execution.validationErrors.length > 0) {
    lines.push("", "### Validation errors", "", ...execution.validationErrors.map((error) => `- ${error}`));
  }

  if (execution.readinessChecks && execution.readinessChecks.length > 0) {
    lines.push(
      "",
      "### Execution readiness",
      "",
      ...execution.readinessChecks.map((check) =>
        `- ${check.name}: ${check.status} - ${check.message}${check.path ? ` (${check.path})` : ""}`
      )
    );
  }

  if (execution.plan) {
    lines.push(
      "",
      "### Dry-run plan",
      "",
      `- Connection: ${execution.plan.connectionName}`,
      `- Table: ${execution.plan.tableName}`,
      `- Vector column: ${execution.plan.vectorColumn}`,
      `- Text column: ${execution.plan.textColumn}`,
      `- Embedding model: ${execution.plan.embeddingModel}`,
      `- Top K: ${execution.plan.topK}`,
      "",
      "```sql",
      execution.plan.sqlPreview,
      "```",
      "",
      "### SQLcl script preview",
      "",
      "```sql",
      execution.plan.sqlclScriptPreview,
      "```",
      "",
      "### Bind variables",
      "",
      ...execution.plan.bindVariables.map((bind) => `- \`${bind.name}\`: ${bind.purpose}`)
    );
  }

  return lines;
}

export function formatKnowledgeAnswerMarkdown(input: FormatKnowledgeAnswerMarkdownInput): string {
  const lines = [
    `# ${input.workspaceName} Grounded Answer`,
    "",
    "## Context",
    "",
    `- Playbook: ${input.playbookTitle}`,
    `- Adapter: ${input.adapterStatus || "unknown"}`,
    "",
    "## Question",
    "",
    input.question.trim() || "現在の knowledge set から PoC に使える要点を整理してください。",
    "",
    "## Answer",
    "",
    input.answer,
    "",
    "## Sources",
    "",
    ...formatSources(input.sources)
  ];

  const oracleVectorLines = formatOracleVectorExecution(input.oracleVectorExecution);

  if (oracleVectorLines.length > 0) {
    lines.push("", ...oracleVectorLines);
  }

  return lines.join("\n");
}
