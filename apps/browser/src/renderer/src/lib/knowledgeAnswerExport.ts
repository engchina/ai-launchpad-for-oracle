import type { RagSearchResult } from "../../../shared/rag";

type FormatKnowledgeAnswerMarkdownInput = {
  workspaceName: string;
  playbookTitle: string;
  question: string;
  answer: string;
  adapterStatus: string;
  sources: RagSearchResult[];
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

export function formatKnowledgeAnswerMarkdown(input: FormatKnowledgeAnswerMarkdownInput): string {
  const lines = [
    `# ${input.workspaceName} Grounded Answer`,
    "",
    "## Context",
    "",
    `- Playbook: ${input.playbookTitle}`,
    `- Provider: ${input.adapterStatus || "unknown"}`,
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

  return lines.join("\n");
}
