export type BrowserMemoryTier = "core" | "daily";
export type BrowserMemoryEntryKind = "project" | "preference" | "decision" | "research" | "task";
export type BrowserMemoryEntryStatus = "active" | "candidate" | "expires";
export type BrowserMemoryActionId = "promote_to_core" | "forget_review" | "open_markdown";

export type BrowserMemoryEntry = {
  id: string;
  tier: BrowserMemoryTier;
  kind: BrowserMemoryEntryKind;
  title: string;
  body: string;
  status: BrowserMemoryEntryStatus;
  filePath: string;
  retentionLabel: string;
  metadata: Array<{
    label: string;
    value: string;
  }>;
};

export type BrowserMemoryRecallMatch = {
  id: string;
  sourceEntryId: string;
  tier: BrowserMemoryTier;
  title: string;
  snippet: string;
  scoreLabel: string;
};

export type BrowserMemoryAction = {
  id: BrowserMemoryActionId;
  label: string;
  enabled: boolean;
  reason: string;
};

export type BrowserMemoryPreview = {
  id: string;
  title: string;
  localOnlyNotice: string;
  query: string;
  coreFilePath: string;
  dailyFilePath: string;
  coreEntries: BrowserMemoryEntry[];
  dailyEntries: BrowserMemoryEntry[];
  recallMatches: BrowserMemoryRecallMatch[];
  actions: BrowserMemoryAction[];
  guardrails: string[];
  stats: Array<{
    label: string;
    value: string;
  }>;
};

export type BrowserMemoryPreviewPayload = {
  workspaceName: string;
  playbookTitle: string;
  currentTitle: string;
  currentUrl: string;
  captureCount: number;
  knowledgeChunkCount: number;
  query?: string;
  now?: string;
};

const localMemoryRoot = "~/.ai-launchpad-for-oracle/memory";

export function createBrowserMemoryPreview(payload: BrowserMemoryPreviewPayload): BrowserMemoryPreview {
  const now = payload.now ?? new Date().toISOString();
  const day = now.slice(0, 10) || "preview-day";
  const query = (payload.query ?? "").trim();
  const coreFilePath = `${localMemoryRoot}/CORE.md`;
  const dailyFilePath = `${localMemoryRoot}/${day}.md`;
  const coreEntries: BrowserMemoryEntry[] = [
    {
      id: `memory-core-workspace-${hashSeed(payload.workspaceName)}`,
      tier: "core",
      kind: "project",
      title: payload.workspaceName,
      body: `${payload.workspaceName} は ${payload.playbookTitle} を進める Oracle enterprise AI workspace です。`,
      status: "active",
      filePath: coreFilePath,
      retentionLabel: "permanent",
      metadata: [
        { label: "type", value: "workspace" },
        { label: "provider", value: "OCI GenAI Project" }
      ]
    },
    {
      id: "memory-core-provider-oci-genai",
      tier: "core",
      kind: "preference",
      title: "Default provider",
      body: "回答と agent planning の既定 provider は OCI GenAI / OCI Generative AI / Enterprise AI Project とする。",
      status: "active",
      filePath: coreFilePath,
      retentionLabel: "permanent",
      metadata: [
        { label: "scope", value: "chat / agent / RAG" },
        { label: "sync", value: "local only" }
      ]
    }
  ];
  const dailyEntries: BrowserMemoryEntry[] = [
    {
      id: `memory-daily-page-${hashSeed(`${day}:${payload.currentUrl}`)}`,
      tier: "daily",
      kind: "research",
      title: payload.currentTitle,
      body: `${payload.currentUrl} を ${payload.playbookTitle} の調査 context として確認中。`,
      status: "expires",
      filePath: dailyFilePath,
      retentionLabel: "expires in 30 days",
      metadata: [
        { label: "captures", value: String(Math.max(0, payload.captureCount)) },
        { label: "knowledge", value: String(Math.max(0, payload.knowledgeChunkCount)) }
      ]
    },
    {
      id: `memory-daily-decision-${hashSeed(`${day}:${payload.playbookTitle}`)}`,
      tier: "daily",
      kind: "decision",
      title: "Clean-room implementation boundary",
      body: "BrowserOS source、asset、UI implementation は使わず、公開 behavior から独自 contract と UI を作る。",
      status: "candidate",
      filePath: dailyFilePath,
      retentionLabel: "candidate for CORE",
      metadata: [
        { label: "review", value: "required" },
        { label: "action", value: "promote or forget" }
      ]
    }
  ];
  const entries = [...coreEntries, ...dailyEntries];
  const recallMatches = createRecallMatches(entries, query);

  return {
    id: `browser-memory-preview-${hashSeed(`${payload.workspaceName}:${day}:${query}`)}`,
    title: "Local Memory Preview",
    localOnlyNotice: "Memory preview は Markdown への保存前確認だけを表示します。cloud sync、OCI GenAI 送信、実ファイル更新は行いません。",
    query,
    coreFilePath,
    dailyFilePath,
    coreEntries,
    dailyEntries,
    recallMatches,
    actions: [
      {
        id: "promote_to_core",
        label: "Promote to CORE preview",
        enabled: dailyEntries.some((entry) => entry.status === "candidate"),
        reason: "繰り返し使う decision を CORE.md 候補として確認します。"
      },
      {
        id: "forget_review",
        label: "Forget review",
        enabled: entries.length > 0,
        reason: "不要な memory 候補を削除 review に送ります。"
      },
      {
        id: "open_markdown",
        label: "Open Markdown path",
        enabled: false,
        reason: "renderer preview では実ファイルを開きません。"
      }
    ],
    guardrails: [
      "secret、wallet、private key、token は memory 候補に保存しない。",
      "Daily note は 30 日で expire する前提として表示する。",
      "CORE への promote と forget は user review 後の操作に限定する。"
    ],
    stats: [
      { label: "CORE", value: `${coreEntries.length} facts` },
      { label: "Daily", value: `${dailyEntries.length} notes` },
      { label: "Recall", value: `${recallMatches.length} matches` },
      { label: "Storage", value: "Markdown / local" }
    ]
  };
}

function createRecallMatches(entries: BrowserMemoryEntry[], query: string): BrowserMemoryRecallMatch[] {
  const normalizedQuery = query.toLowerCase();
  const filtered = normalizedQuery.length === 0
    ? entries
    : entries.filter((entry) => `${entry.title} ${entry.body} ${entry.kind}`.toLowerCase().includes(normalizedQuery));

  return filtered.slice(0, 5).map((entry, index) => ({
    id: `memory-recall-${entry.id}`,
    sourceEntryId: entry.id,
    tier: entry.tier,
    title: entry.title,
    snippet: trimForPreview(entry.body, 120),
    scoreLabel: normalizedQuery.length === 0 ? `recent ${index + 1}` : `match ${index + 1}`
  }));
}

function trimForPreview(value: string, maxLength: number): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, maxLength - 1))}…`;
}

function hashSeed(value: string): string {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash.toString(36);
}
