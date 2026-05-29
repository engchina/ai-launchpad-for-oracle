import type { BrowserCloudSyncPreview } from "./browserCloudSync";

export type BrowserCloudSignInMethodId = "magic_link" | "google_oauth" | "oracle_sso";
export type BrowserCloudSignInMethodStatus = "available" | "review_only" | "enterprise_planned";
export type BrowserCloudSignInStepStatus = "ready" | "blocked" | "review";

export type BrowserCloudSignInMethod = {
  id: BrowserCloudSignInMethodId;
  label: string;
  status: BrowserCloudSignInMethodStatus;
  detail: string;
  actionLabel: string;
};

export type BrowserCloudSignInStep = {
  id: string;
  label: string;
  detail: string;
  status: BrowserCloudSignInStepStatus;
};

export type BrowserCloudSignInSyncBucket = {
  label: string;
  value: string;
  detail: string;
};

export type BrowserCloudSignInPreview = {
  title: string;
  subtitle: string;
  workspaceName: string;
  statusLabel: string;
  localOnlyNotice: string;
  methods: BrowserCloudSignInMethod[];
  steps: BrowserCloudSignInStep[];
  syncBuckets: BrowserCloudSignInSyncBucket[];
  excludedLabels: string[];
  guardrails: string[];
};

export function createBrowserCloudSignInPreview(syncPreview: BrowserCloudSyncPreview): BrowserCloudSignInPreview {
  return {
    title: "Cloud Sign In Preview",
    subtitle: "Sign in を開始する前に、同期候補、local-only scope、除外 credential を確認する clean-room preview。",
    workspaceName: syncPreview.workspaceName,
    statusLabel: syncPreview.statusLabel,
    localOnlyNotice: "この page は認証 UX の preview です。magic link、OAuth、cloud request、account 作成は開始しません。",
    methods: [
      {
        id: "magic_link",
        label: "Email magic link",
        status: "available",
        detail: "passwordless sign-in flow の UI draft。入力値は送信せず、local validation のみ行います。",
        actionLabel: "Preview email link"
      },
      {
        id: "google_oauth",
        label: "Google sign-in",
        status: "review_only",
        detail: "OAuth は browser session を開かず、scope と sync impact の確認だけを表示します。",
        actionLabel: "Review OAuth"
      },
      {
        id: "oracle_sso",
        label: "Oracle SSO",
        status: "enterprise_planned",
        detail: "OCI tenancy / enterprise identity 連携は future connector として扱います。",
        actionLabel: "Plan SSO"
      }
    ],
    steps: [
      {
        id: "open-new-tab",
        label: "Open sidebar sign-in",
        detail: "左 rail の Cloud Sign In からこの internal page を表示します。",
        status: "ready"
      },
      {
        id: "choose-method",
        label: "Choose method",
        detail: "email magic link、Google、enterprise SSO の扱いを事前確認します。",
        status: "review"
      },
      {
        id: "review-sync",
        label: "Review sync scope",
        detail: `${syncPreview.syncCandidateCount} sync candidates / ${syncPreview.localOnlyCount} local-only / ${syncPreview.excludedCount} excluded を確認します。`,
        status: "ready"
      },
      {
        id: "start-auth",
        label: "Start authentication",
        detail: "この切片では認証開始を disabled にし、UI contract だけを検証します。",
        status: "blocked"
      }
    ],
    syncBuckets: [
      {
        label: "Sync candidates",
        value: String(syncPreview.syncCandidateCount),
        detail: "conversations、model settings、scheduled tasks、profile"
      },
      {
        label: "Local only",
        value: String(syncPreview.localOnlyCount),
        detail: "workspace folders、MCP connections、workflows、run outputs、memory、captures"
      },
      {
        label: "Excluded",
        value: String(syncPreview.excludedCount),
        detail: "credentials、tokens、wallets、private keys"
      }
    ],
    excludedLabels: syncPreview.scopes
      .filter((scope) => scope.decision === "excluded")
      .map((scope) => scope.label),
    guardrails: [
      "BrowserOS source / asset / auth implementation reuse なし",
      "password、API key、OAuth token、OCI wallet、private key は form state と sync scope に入れない",
      "sign-in method は preview-only で、network request、cookie write、browser profile write を開始しない",
      "enterprise workspace では sync conflict を自動 merge せず review queue に残す"
    ]
  };
}
