export type BrowserSkillCategory = "research" | "sales" | "rag" | "browser" | "safety";
export type BrowserSkillStatus = "active" | "available" | "needs_review";
export type BrowserSkillRisk = "safe" | "review";
export type BrowserSkillActionId = "activate_review" | "open_instruction" | "export_markdown";

export type BrowserSkillDefinition = {
  id: string;
  title: string;
  category: BrowserSkillCategory;
  status: BrowserSkillStatus;
  risk: BrowserSkillRisk;
  description: string;
  instructionPreview: string[];
  appliesToModes: string[];
  outputContract: string;
  localFilePath: string;
  reviewReason: string;
};

export type BrowserSkillCatalogAction = {
  id: BrowserSkillActionId;
  label: string;
  enabled: boolean;
  reason: string;
};

export type BrowserSkillsCatalogPreview = {
  id: string;
  title: string;
  workspaceName: string;
  totalCount: number;
  activeCount: number;
  availableCount: number;
  reviewCount: number;
  recommendedSkillId: string;
  recommendedSkillTitle: string;
  skills: BrowserSkillDefinition[];
  details: string[];
  guardrails: string[];
  actions: BrowserSkillCatalogAction[];
};

export type BrowserSkillsCatalogPreviewOptions = {
  workspaceName: string;
  playbookTitle: string;
  currentMode: string;
  instructionQuery?: string;
  activeSkillIds?: string[];
};

type BrowserSkillBlueprint = Omit<BrowserSkillDefinition, "status" | "localFilePath"> & {
  defaultStatus: BrowserSkillStatus;
  fileSlug: string;
};

const skillsRoot = "~/.ai-launchpad-for-oracle/skills";
const defaultActiveSkillIds = new Set(["oracle-docs-researcher", "credential-safety-reviewer"]);

const skillBlueprints: BrowserSkillBlueprint[] = [
  {
    id: "oracle-docs-researcher",
    fileSlug: "oracle-docs-researcher",
    title: "Oracle Docs Researcher",
    category: "research",
    defaultStatus: "active",
    risk: "safe",
    description: "Oracle Docs、OCI console page、workspace notes を evidence first で要約する research skill。",
    instructionPreview: [
      "公開 docs と current page の URL を answer に必ず残す。",
      "不明な API behavior は推測せず、確認済み evidence と未確認事項を分ける。",
      "OCI GenAI Enterprise AI Project を既定 provider として扱う。"
    ],
    appliesToModes: ["chat", "agent", "memory"],
    outputContract: "answer summary + cited evidence + next action",
    reviewReason: "read-only research skill のため既定で有効。"
  },
  {
    id: "poc-package-builder",
    fileSlug: "poc-package-builder",
    title: "PoC Package Builder",
    category: "sales",
    defaultStatus: "available",
    risk: "review",
    description: "営業同行、PoC 計画、follow-up artifact を review-only で組み立てる skill。",
    instructionPreview: [
      "顧客課題、demo scope、success criteria、follow-up を 1 つの artifact に整理する。",
      "送信、共有、保存は user review 後に限定する。",
      "Oracle product name と正式サービス名は既存表記を維持する。"
    ],
    appliesToModes: ["council", "agent"],
    outputContract: "PoC brief + checklist + follow-up draft",
    reviewReason: "artifact write や外部送信に接続し得るため有効化前 review が必要。"
  },
  {
    id: "rag-evidence-reviewer",
    fileSlug: "rag-evidence-reviewer",
    title: "RAG Evidence Reviewer",
    category: "rag",
    defaultStatus: "available",
    risk: "safe",
    description: "RAG chunk、Oracle Vector Search readiness、source quality を確認する skill。",
    instructionPreview: [
      "回答前に chunk freshness、source URL、unsupported claim を確認する。",
      "vector index、embedding、rerank の不足を remediation として列挙する。",
      "根拠のない product claim は confidence を下げる。"
    ],
    appliesToModes: ["memory", "agent", "council"],
    outputContract: "evidence checklist + risk flags + remediation",
    reviewReason: "local evidence review のため read-only で追加可能。"
  },
  {
    id: "browser-action-guard",
    fileSlug: "browser-action-guard",
    title: "Browser Action Guard",
    category: "browser",
    defaultStatus: "needs_review",
    risk: "review",
    description: "click、form fill、download、login、destructive action を approval class に分類する skill。",
    instructionPreview: [
      "read-only navigation と state-changing action を分ける。",
      "credential、payment、permission、delete、send は explicit approval まで停止する。",
      "automation 実行前に intended URL、target element、rollback path を表示する。"
    ],
    appliesToModes: ["agent", "mcp"],
    outputContract: "approval class + blocked reason + safe fallback",
    reviewReason: "browser automation の action boundary に関わるため user review が必要。"
  },
  {
    id: "credential-safety-reviewer",
    fileSlug: "credential-safety-reviewer",
    title: "Credential Safety Reviewer",
    category: "safety",
    defaultStatus: "active",
    risk: "safe",
    description: "secret、wallet、private key、token、customer confidential data を除外する safety skill。",
    instructionPreview: [
      "credential-like string は memory、artifact、prompt へ保存しない。",
      "wallet path や token は redact し、必要なら local-only 確認に留める。",
      "customer data は最小限の scope と retention で扱う。"
    ],
    appliesToModes: ["chat", "agent", "memory", "mcp", "schedule"],
    outputContract: "redaction notes + blocked fields + safe alternative",
    reviewReason: "全 mode で常時有効な safety baseline。"
  }
];

export function createBrowserSkillsCatalogPreview(options: BrowserSkillsCatalogPreviewOptions): BrowserSkillsCatalogPreview {
  const workspaceName = normalizeText(options.workspaceName, "Workspace");
  const playbookTitle = normalizeText(options.playbookTitle, "Browser workspace");
  const currentMode = normalizeText(options.currentMode, "memory");
  const activeIds = resolveActiveSkillIds(options.activeSkillIds);
  const skills = skillBlueprints.map((blueprint) => createSkillDefinition(blueprint, activeIds));
  const recommendedSkill = findRecommendedSkill(skills, {
    currentMode,
    instructionQuery: options.instructionQuery ?? "",
    playbookTitle
  });
  const activeCount = skills.filter((skill) => skill.status === "active").length;
  const availableCount = skills.filter((skill) => skill.status === "available").length;
  const reviewCount = skills.filter((skill) => skill.status === "needs_review").length;

  return {
    id: `browser-skills-catalog-${hashSeed(`${workspaceName}:${playbookTitle}:${currentMode}:${options.instructionQuery ?? ""}`)}`,
    title: "Skills Catalog Preview",
    workspaceName,
    totalCount: skills.length,
    activeCount,
    availableCount,
    reviewCount,
    recommendedSkillId: recommendedSkill.id,
    recommendedSkillTitle: recommendedSkill.title,
    skills,
    details: [
      `workspace: ${workspaceName}`,
      `playbook: ${playbookTitle}`,
      `mode: ${currentMode}`,
      `recommended: ${recommendedSkill.id}`,
      "storage: local Markdown instructions"
    ],
    guardrails: [
      "BrowserOS source / asset / skill file reuse なし",
      "公開 feature category だけを参考にし、instruction text はこの project 用に独自作成する",
      "skill preview は実ファイル更新、cloud sync、OCI GenAI call、browser automation を開始しない",
      "SOUL.md は behavior baseline、Skills は task-specific instruction として分離する",
      "secret、wallet、private key、token は skill input / memory / artifact 候補から除外する"
    ],
    actions: [
      {
        id: "activate_review",
        label: "Review activation",
        enabled: skills.some((skill) => skill.status !== "active"),
        reason: "available / needs_review skill を有効化する前に差分を確認します。"
      },
      {
        id: "open_instruction",
        label: "Open instruction path",
        enabled: false,
        reason: "renderer preview では local Markdown file を開きません。"
      },
      {
        id: "export_markdown",
        label: "Export markdown preview",
        enabled: false,
        reason: "この切片では markdown export を開始せず preview に限定します。"
      }
    ]
  };
}

function createSkillDefinition(blueprint: BrowserSkillBlueprint, activeIds: Set<string>): BrowserSkillDefinition {
  const status = activeIds.has(blueprint.id)
    ? "active"
    : blueprint.defaultStatus === "active"
      ? "available"
      : blueprint.defaultStatus;

  return {
    id: blueprint.id,
    title: blueprint.title,
    category: blueprint.category,
    status,
    risk: blueprint.risk,
    description: blueprint.description,
    instructionPreview: blueprint.instructionPreview,
    appliesToModes: blueprint.appliesToModes,
    outputContract: blueprint.outputContract,
    localFilePath: `${skillsRoot}/${blueprint.fileSlug}.md`,
    reviewReason: blueprint.reviewReason
  };
}

function resolveActiveSkillIds(activeSkillIds?: string[]): Set<string> {
  if (!activeSkillIds) {
    return defaultActiveSkillIds;
  }

  const validIds = new Set(skillBlueprints.map((skill) => skill.id));
  return new Set(activeSkillIds.filter((id) => validIds.has(id)));
}

function findRecommendedSkill(
  skills: BrowserSkillDefinition[],
  options: { currentMode: string; instructionQuery: string; playbookTitle: string }
): BrowserSkillDefinition {
  const normalized = `${options.currentMode} ${options.playbookTitle} ${options.instructionQuery}`.toLowerCase();
  const preferredId =
    /(rag|vector|evidence|chunk|embedding|検索|根拠|ベクトル)/u.test(normalized)
      ? "rag-evidence-reviewer"
      : /(browser|automation|click|form|agent|mcp|操作|自動)/u.test(normalized)
        ? "browser-action-guard"
        : /(poc|proposal|sales|follow-up|brief|提案|営業)/u.test(normalized)
          ? "poc-package-builder"
          : "oracle-docs-researcher";

  return skills.find((skill) => skill.id === preferredId) ?? skills[0];
}

function normalizeText(value: string, fallback: string): string {
  const normalized = value.trim().replace(/\s+/g, " ");
  return normalized.length > 0 ? normalized : fallback;
}

function hashSeed(seed: string): string {
  let hash = 0;

  for (const char of seed) {
    hash = (hash * 43 + char.charCodeAt(0)) >>> 0;
  }

  return hash.toString(36).padStart(7, "0").slice(0, 7);
}
