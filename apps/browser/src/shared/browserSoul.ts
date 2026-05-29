export type BrowserSoulSectionId = "personality" | "communication" | "boundaries" | "preferences";

export type BrowserSoulActionId = "preview_update" | "reset_default" | "open_markdown";

export type BrowserSoulSection = {
  id: BrowserSoulSectionId;
  title: string;
  lines: string[];
};

export type BrowserSoulAction = {
  id: BrowserSoulActionId;
  label: string;
  enabled: boolean;
  reason: string;
};

export type BrowserSoulChangePreview = {
  instruction: string;
  targetSectionId: BrowserSoulSectionId;
  targetSectionLabel: string;
  summary: string;
  canApply: boolean;
  reason: string;
};

export type BrowserSoulPreview = {
  id: string;
  title: string;
  filePath: string;
  lineLimit: number;
  lineCount: number;
  localOnlyNotice: string;
  memorySeparationNotice: string;
  sections: BrowserSoulSection[];
  changePreview: BrowserSoulChangePreview;
  actions: BrowserSoulAction[];
  guardrails: string[];
  stats: Array<{
    label: string;
    value: string;
  }>;
};

export type BrowserSoulPreviewPayload = {
  workspaceName: string;
  currentMode: string;
  instructionDraft?: string;
  preferredLanguage?: string;
};

const soulFilePath = "~/.ai-launchpad-for-oracle/SOUL.md";
const soulLineLimit = 150;

export function createBrowserSoulPreview(payload: BrowserSoulPreviewPayload): BrowserSoulPreview {
  const instruction = (payload.instructionDraft ?? "").trim();
  const sections = createSoulSections(payload);
  const changePreview = createChangePreview(instruction, sections);
  const lineCount = sections.reduce((count, section) => count + 1 + section.lines.length, 0);

  return {
    id: `browser-soul-preview-${hashSeed(`${payload.workspaceName}:${payload.currentMode}:${instruction}`)}`,
    title: "Agent Soul Preview",
    filePath: soulFilePath,
    lineLimit: soulLineLimit,
    lineCount,
    localOnlyNotice: "SOUL.md preview は local Markdown の read / rewrite 候補だけを表示します。実ファイル更新、cloud sync、OCI GenAI 送信は行いません。",
    memorySeparationNotice: "SOUL.md は assistant の振る舞いを定義し、Memory は facts と recent notes を保持します。この2つは分離して扱います。",
    sections,
    changePreview,
    actions: [
      {
        id: "preview_update",
        label: "Preview update",
        enabled: changePreview.canApply,
        reason: changePreview.reason
      },
      {
        id: "reset_default",
        label: "Reset default preview",
        enabled: true,
        reason: "default personality に戻す差分を review-only で表示します。"
      },
      {
        id: "open_markdown",
        label: "Open SOUL.md path",
        enabled: false,
        reason: "renderer preview では実ファイルを開きません。"
      }
    ],
    guardrails: [
      "SOUL.md は人格、tone、rules、boundaries だけを扱い、顧客 facts は Memory に保存する。",
      "送信、購入、削除、権限変更の boundary は assistant behavior として残す。",
      "150 lines limit を超える rewrite は保存前に要約 review へ回す。"
    ],
    stats: [
      { label: "Lines", value: `${lineCount}/${soulLineLimit}` },
      { label: "Sections", value: String(sections.length) },
      { label: "Mode", value: payload.currentMode },
      { label: "Storage", value: "Markdown / local" }
    ]
  };
}

function createSoulSections(payload: BrowserSoulPreviewPayload): BrowserSoulSection[] {
  const language = payload.preferredLanguage ?? "Japanese UI / Chinese conversation";

  return [
    {
      id: "personality",
      title: "Personality",
      lines: [
        "Oracle enterprise AI browser assistant として、実装可能な次の一手を優先する。",
        "曖昧な要求は local evidence、workspace context、公開仕様の順に確認してから進める。"
      ]
    },
    {
      id: "communication",
      title: "Communication Style",
      lines: [
        `${language} を尊重し、project UI / docs は日本語で維持する。`,
        "進捗更新は短く、検証結果は command と outcome を明確に示す。"
      ]
    },
    {
      id: "boundaries",
      title: "Boundaries",
      lines: [
        "BrowserOS の source、asset、UI implementation は使わず、公開 behavior から clean-room 実装する。",
        "外部送信、credential 参照、destructive action はユーザー確認前に停止する。"
      ]
    },
    {
      id: "preferences",
      title: "Preferences",
      lines: [
        `${payload.workspaceName} では OCI GenAI Project を既定 provider として扱う。`,
        "Memory は facts、SOUL.md は behavior として分離し、回答前 context を混同しない。"
      ]
    }
  ];
}

function createChangePreview(instruction: string, sections: BrowserSoulSection[]): BrowserSoulChangePreview {
  const targetSectionId = classifyInstruction(instruction);
  const targetSection = sections.find((section) => section.id === targetSectionId) ?? sections[0];
  const hasInstruction = instruction.length > 0;

  return {
    instruction,
    targetSectionId,
    targetSectionLabel: targetSection.title,
    summary: hasInstruction
      ? `${targetSection.title} に「${trimForPreview(instruction, 92)}」を反映する rewrite 候補です。`
      : "会話で tone、boundary、preference を指定すると SOUL.md rewrite 候補を表示します。",
    canApply: hasInstruction,
    reason: hasInstruction ? "保存前 review に進められます。" : "instruction draft が空のため preview update は無効です。"
  };
}

function classifyInstruction(instruction: string): BrowserSoulSectionId {
  const normalized = instruction.toLowerCase();

  if (/(never|confirm|boundary|send|delete|purchase|slack|email|mail|送信|削除|確認|境界|メール)/u.test(normalized)) {
    return "boundaries";
  }

  if (/(tone|casual|direct|formal|brief|style|口調|簡潔|直接|丁寧)/u.test(normalized)) {
    return "communication";
  }

  if (/(prefer|priority|primary|provider|oci|genai|好み|優先|既定)/u.test(normalized)) {
    return "preferences";
  }

  return "personality";
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
