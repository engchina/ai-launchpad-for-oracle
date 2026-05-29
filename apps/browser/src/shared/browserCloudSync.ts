export type BrowserCloudSyncStatus = "signed_out" | "ready" | "paused";
export type BrowserCloudSyncDecision = "sync_candidate" | "local_only" | "excluded";
export type BrowserCloudSyncScopeId =
  | "conversations"
  | "model_settings"
  | "scheduled_tasks"
  | "profile"
  | "workspace_folders"
  | "mcp_servers"
  | "workflows"
  | "run_outputs"
  | "memory_soul"
  | "captures"
  | "credentials";
export type BrowserCloudSyncActionId = "sign_in_preview" | "sync_now" | "review_scopes";

export type BrowserCloudSyncScope = {
  id: BrowserCloudSyncScopeId;
  label: string;
  decision: BrowserCloudSyncDecision;
  detail: string;
  reason: string;
  itemCount: number;
};

export type BrowserCloudSyncAction = {
  id: BrowserCloudSyncActionId;
  label: string;
  enabled: boolean;
  reason: string;
};

export type BrowserCloudSyncPreview = {
  id: string;
  title: string;
  status: BrowserCloudSyncStatus;
  statusLabel: string;
  workspaceName: string;
  syncCandidateCount: number;
  localOnlyCount: number;
  excludedCount: number;
  scopes: BrowserCloudSyncScope[];
  details: string[];
  guardrails: string[];
  actions: BrowserCloudSyncAction[];
};

export type BrowserCloudSyncPreviewOptions = {
  workspaceName: string;
  playbookTitle: string;
  activeProviderLabel: string;
  captureCount: number;
  knowledgeChunkCount: number;
  scheduledTaskCount?: number;
  signedIn?: boolean;
  syncPaused?: boolean;
};

export function createBrowserCloudSyncPreview(options: BrowserCloudSyncPreviewOptions): BrowserCloudSyncPreview {
  const signedIn = options.signedIn ?? false;
  const syncPaused = options.syncPaused ?? false;
  const status: BrowserCloudSyncStatus = signedIn ? (syncPaused ? "paused" : "ready") : "signed_out";
  const scopes = createCloudSyncScopes(options);
  const syncCandidateCount = scopes.filter((scope) => scope.decision === "sync_candidate").length;
  const localOnlyCount = scopes.filter((scope) => scope.decision === "local_only").length;
  const excludedCount = scopes.filter((scope) => scope.decision === "excluded").length;

  return {
    id: `browser-cloud-sync-${hashSeed(`${options.workspaceName}:${options.playbookTitle}:${status}:${options.activeProviderLabel}`)}`,
    title: "Cloud Sync Preview",
    status,
    statusLabel: getStatusLabel(status),
    workspaceName: normalizeText(options.workspaceName, "Workspace"),
    syncCandidateCount,
    localOnlyCount,
    excludedCount,
    scopes,
    details: [
      `workspace: ${normalizeText(options.workspaceName, "Workspace")}`,
      `playbook: ${normalizeText(options.playbookTitle, "Playbook")}`,
      `provider: ${normalizeText(options.activeProviderLabel, "OCI GenAI Enterprise")}`,
      `local captures: ${Math.max(0, options.captureCount)}`,
      `knowledge chunks: ${Math.max(0, options.knowledgeChunkCount)}`
    ],
    guardrails: [
      "BrowserOS source / asset / cloud implementation reuse なし",
      "この preview は account 作成、magic link、OAuth、cloud sync request を開始しない",
      "credential、API key、wallet、token、private key は sync scope から常に除外する",
      "Memory、SOUL.md、workspace folder、MCP connection details、run outputs は local-only として扱う",
      "sync conflict は latest timestamp だけで自動確定せず、enterprise workspace では review queue に残す"
    ],
    actions: [
      {
        id: "sign_in_preview",
        label: signedIn ? "Account connected" : "Sign in preview",
        enabled: !signedIn,
        reason: signedIn ? "signed-in 状態の preview です。" : "実認証ではなく、同期範囲の事前確認を表示します。"
      },
      {
        id: "sync_now",
        label: "Sync now",
        enabled: false,
        reason: "この切片では network sync を開始しません。"
      },
      {
        id: "review_scopes",
        label: "Review scopes",
        enabled: true,
        reason: "cloud candidate / local-only / excluded scope を確認します。"
      }
    ]
  };
}

function createCloudSyncScopes(options: BrowserCloudSyncPreviewOptions): BrowserCloudSyncScope[] {
  return [
    {
      id: "conversations",
      label: "Conversations",
      decision: "sync_candidate",
      detail: "Chat / Assistant conversation metadata を cross-device 候補として扱う。",
      reason: "別 device で会話を継続するため。",
      itemCount: 3
    },
    {
      id: "model_settings",
      label: "AI model settings",
      decision: "sync_candidate",
      detail: `${normalizeText(options.activeProviderLabel, "OCI GenAI Enterprise")} の provider preference を同期候補にする。`,
      reason: "provider の選択状態だけを共有し、secret は含めない。",
      itemCount: 1
    },
    {
      id: "scheduled_tasks",
      label: "Scheduled tasks",
      decision: "sync_candidate",
      detail: "scheduled task definition と cadence を同期候補にする。",
      reason: "複数端末で同じ automation を確認するため。",
      itemCount: Math.max(0, options.scheduledTaskCount ?? 0)
    },
    {
      id: "profile",
      label: "Account profile",
      decision: "sync_candidate",
      detail: "表示名、workspace preference、account state を同期候補にする。",
      reason: "sign-in 後の device restore を簡潔にするため。",
      itemCount: 1
    },
    {
      id: "workspace_folders",
      label: "Workspace folders",
      decision: "local_only",
      detail: `${normalizeText(options.workspaceName, "Workspace")} の local path はこの端末だけで扱う。`,
      reason: "absolute path や private folder structure を外へ出さない。",
      itemCount: 1
    },
    {
      id: "mcp_servers",
      label: "MCP connections",
      decision: "local_only",
      detail: "connected MCP server details は local connector 側に留める。",
      reason: "tool endpoint、socket、local port は端末依存のため。",
      itemCount: 2
    },
    {
      id: "workflows",
      label: "Workflow drafts",
      decision: "local_only",
      detail: "workflow graph draft と approval gate は workspace-local review に残す。",
      reason: "自動実行や file write boundary を device ごとに確認するため。",
      itemCount: 1
    },
    {
      id: "run_outputs",
      label: "Scheduled run outputs",
      decision: "local_only",
      detail: "run output、trace、screenshot、capture result はこの端末に残す。",
      reason: "生成物に顧客 data や local evidence が含まれ得るため。",
      itemCount: Math.max(0, options.captureCount)
    },
    {
      id: "memory_soul",
      label: "Memory / SOUL.md",
      decision: "local_only",
      detail: "Memory facts、daily notes、SOUL.md behavior baseline は local Markdown に留める。",
      reason: "personality、顧客前提、recent facts を cloud に混ぜない。",
      itemCount: Math.max(1, options.knowledgeChunkCount)
    },
    {
      id: "captures",
      label: "Page captures",
      decision: "local_only",
      detail: "page capture、selection、screenshot は local evidence store に残す。",
      reason: "権利や顧客情報を含む可能性があるため。",
      itemCount: Math.max(0, options.captureCount)
    },
    {
      id: "credentials",
      label: "Credentials and wallets",
      decision: "excluded",
      detail: "API key、OAuth token、OCI config secret、wallet、private key は同期対象外。",
      reason: "sensitive credential は prompt / memory / cloud sync に入れない。",
      itemCount: 0
    }
  ];
}

function getStatusLabel(status: BrowserCloudSyncStatus): string {
  if (status === "ready") {
    return "Signed in / local-first sync ready";
  }

  if (status === "paused") {
    return "Signed in / sync paused";
  }

  return "Signed out / local only";
}

function normalizeText(value: string, fallback: string): string {
  const normalized = value.trim().replace(/\s+/g, " ");
  return normalized.length > 0 ? normalized : fallback;
}

function hashSeed(seed: string): string {
  let hash = 0;

  for (const char of seed) {
    hash = (hash * 53 + char.charCodeAt(0)) >>> 0;
  }

  return hash.toString(36).padStart(7, "0").slice(0, 7);
}
