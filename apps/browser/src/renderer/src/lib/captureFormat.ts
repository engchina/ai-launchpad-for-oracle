import type { CapturedPage, Workspace } from "@renderer/data/mockData";

export function formatCaptureKind(kind: CapturedPage["kind"]): string {
  if (kind === "selection") {
    return "Selection";
  }

  if (kind === "screenshot") {
    return "Screenshot";
  }

  return "Page";
}

export function formatSavedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function formatCaptureCopyText(capture: CapturedPage): string {
  const lines = [`${formatCaptureKind(capture.kind)}: ${capture.title}`, `URL: ${capture.url}`];

  if (capture.selectedText) {
    lines.push("", capture.selectedText);
  }

  if (capture.summary) {
    lines.push("", `Summary: ${capture.summary}`);
  }

  if (capture.kind === "screenshot") {
    lines.push("", "Screenshot image is saved in the local capture store.");
  }

  return lines.join("\n");
}

export function formatCaptureMarkdown(capture: CapturedPage, workspace?: Workspace): string {
  const lines = [
    `## ${capture.title}`,
    "",
    `- Type: ${formatCaptureKind(capture.kind)}`,
    workspace ? `- Workspace: ${workspace.name}` : "",
    `- Source: ${capture.sourceType}`,
    `- URL: ${capture.url}`,
    `- Saved at: ${formatSavedAt(capture.savedAt)}`
  ].filter(Boolean);

  if (capture.summary) {
    lines.push("", "### Summary", "", capture.summary);
  }

  if (capture.selectedText) {
    lines.push("", "### Selected Text", "", "> " + capture.selectedText.replace(/\n/g, "\n> "));
  }

  if (capture.kind === "screenshot") {
    lines.push("", "### Screenshot", "", capture.screenshotDataUrl ? "Screenshot is stored in local capture data." : "Screenshot metadata only.");
  }

  return lines.join("\n");
}

export function formatCapturesMarkdown(captures: CapturedPage[], workspaces: Workspace[]): string {
  if (captures.length === 0) {
    return "# AI Launchpad Captures\n\nNo captures saved.";
  }

  const sections = captures.map((capture) => {
    const workspace = workspaces.find((item) => item.id === capture.workspaceId);
    return formatCaptureMarkdown(capture, workspace);
  });

  return ["# AI Launchpad Captures", "", ...sections].join("\n\n");
}
