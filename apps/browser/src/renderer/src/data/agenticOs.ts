export type AgenticModeId = "chat" | "agent" | "workflow" | "schedule" | "memory" | "mcp";

export type StatusTone = "ready" | "progress" | "planned" | "guarded";

export type AgenticMode = {
  id: AgenticModeId;
  label: string;
  shortLabel: string;
  summary: string;
  stateLabel: string;
  tone: StatusTone;
  oracleAdaptation: string;
  pipeline: string[];
  safeguards: string[];
  nextCuts: string[];
};

export type CapabilitySignal = {
  label: string;
  value: string;
  description: string;
  tone: StatusTone;
};

export type ConnectorBlueprint = {
  name: string;
  scope: string;
  status: string;
  tone: StatusTone;
};

export type ScheduledTaskBlueprint = {
  name: string;
  cadence: string;
  prompt: string;
  status: string;
};

export type WorkflowNodeBlueprint = {
  step: string;
  title: string;
  detail: string;
};

export const agenticModes: AgenticMode[] = [
  {
    id: "chat",
    label: "Chat / Hub",
    shortLabel: "Chat",
    summary: "現在ページ、capture、スクリーンショット、Knowledge を使って、OCI Generative AI に質問するモード。",
    stateLabel: "既存 RAG と統合中",
    tone: "progress",
    oracleAdaptation: "既定 provider は OCI Generative AI / Enterprise AI Project。Local keyword と Oracle Vector を fallback にする。",
    pipeline: [
      "Webview から URL、title、選択テキスト、必要なら screenshot を取得する",
      "Workspace / Playbook / Knowledge chunk を prompt context にまとめる",
      "OCI Generative AI へ問い合わせ、引用付き answer と export を返す"
    ],
    safeguards: ["secret、wallet、private key は prompt に含めない", "外部送信前に source と添付範囲を UI に表示する"],
    nextCuts: ["OCI GenAI provider 設定 schema", "複数モデル比較 panel", "page context token budget preview"]
  },
  {
    id: "agent",
    label: "Agent",
    shortLabel: "Agent",
    summary: "自然言語の依頼を、観測、計画、承認、実行、監査の browser action loop に変換するモード。",
    stateLabel: "第1優先で実装",
    tone: "guarded",
    oracleAdaptation: "Oracle Docs、OCI Console、LiveLabs、GitHub sample を対象に PoC 準備タスクを自動化する。",
    pipeline: [
      "ページ状態を accessibility tree / DOM summary / screenshot summary として観測する",
      "OCI GenAI が action plan を作る",
      "click、type、navigate、extract などの危険度を分類し、必要な操作は明示承認する",
      "実行結果を capture と audit log に保存する"
    ],
    safeguards: ["送信、購入、削除、権限変更は必ず停止して確認する", "OCI Console の destructive action は read-only plan に落とす"],
    nextCuts: ["Browser action IPC schema", "human approval gate", "step-by-step run history"]
  },
  {
    id: "workflow",
    label: "Workflow Graph",
    shortLabel: "Workflow",
    summary: "繰り返す browser task を visual graph として保存し、テストしてから再実行するモード。",
    stateLabel: "設計済み",
    tone: "planned",
    oracleAdaptation: "Oracle 提案 playbook を、検索、capture、RAG、SQL preview、follow-up 生成の workflow に展開する。",
    pipeline: [
      "自然言語 task から workflow node draft を生成する",
      "各 node に input、tool、approval、output を割り当てる",
      "Test run で失敗 node を特定し、保存版 workflow に反映する"
    ],
    safeguards: ["保存前に graph diff を表示する", "外部サービス連携 node は connector 状態を必ず確認する"],
    nextCuts: ["Workflow JSON schema", "graph preview component", "workflow local store"]
  },
  {
    id: "schedule",
    label: "Scheduled Tasks",
    shortLabel: "Schedule",
    summary: "毎朝、数時間ごと、数分ごとの agent run をローカルに登録し、結果を workspace に残すモード。",
    stateLabel: "計画中",
    tone: "planned",
    oracleAdaptation: "OCI readiness、Oracle Docs update、PoC follow-up の定期確認を task 化する。",
    pipeline: [
      "Prompt、cadence、workspace、approval policy を task として保存する",
      "local scheduler が次回実行時刻を計算する",
      "run 結果、失敗理由、生成 artifact を capture history に追記する"
    ],
    safeguards: ["自動実行でも destructive browser action は停止する", "credential が必要な task は未接続時に skipped として残す"],
    nextCuts: ["scheduler registry", "run history table", "conversation から schedule card を提案"]
  },
  {
    id: "memory",
    label: "Memory",
    shortLabel: "Memory",
    summary: "assistant が重要な事実、顧客前提、最近の調査をローカル Markdown として保持するモード。",
    stateLabel: "設計中",
    tone: "planned",
    oracleAdaptation: "顧客 workspace、Oracle service preference、PoC constraints を検索可能な local memory として扱う。",
    pipeline: [
      "長期 facts は CORE.md、短期 notes は日次ファイルに保存する",
      "回答前に workspace memory を検索し、関連事実だけ prompt に入れる",
      "forget / expire / promote を UI から操作できるようにする"
    ],
    safeguards: ["PII と secret は保存候補から除外する", "memory への追記はユーザーが確認できる形で表示する"],
    nextCuts: ["local memory directory", "memory search adapter", "forget action"]
  },
  {
    id: "mcp",
    label: "MCP / Apps",
    shortLabel: "MCP",
    summary: "browser control と外部 app 操作を MCP-compatible tools として公開し、agent から呼べるようにするモード。",
    stateLabel: "設計中",
    tone: "planned",
    oracleAdaptation: "OCI、Oracle Database、Object Storage、社内 app connector を優先 connector として扱う。",
    pipeline: [
      "browser tools と Oracle connector tools の schema を分ける",
      "credential は OS / connector 側で保持し、LLM prompt へ出さない",
      "tool call、result、approval を audit log に保存する"
    ],
    safeguards: ["connector 未接続時は manual browser fallback を提示する", "tool scope と実行権限を workspace ごとに固定する"],
    nextCuts: ["MCP endpoint design", "browser tool catalog", "Oracle connector capability registry"]
  }
];

export const capabilitySignals: CapabilitySignal[] = [
  {
    label: "Clean-room",
    value: "0 code copied",
    description: "BrowserOS の source、asset、UI 実装を使用しない",
    tone: "ready"
  },
  {
    label: "AI Provider",
    value: "OCI GenAI",
    description: "Enterprise AI Project を既定 provider として設計",
    tone: "progress"
  },
  {
    label: "Privacy",
    value: "Local-first",
    description: "capture、memory、run history はローカル保存を基本にする",
    tone: "ready"
  },
  {
    label: "Safety",
    value: "Approval gate",
    description: "destructive action と credential 操作は停止して確認する",
    tone: "guarded"
  }
];

export const connectorBlueprints: ConnectorBlueprint[] = [
  {
    name: "OCI Generative AI",
    scope: "Chat / Agent planning / RAG answer",
    status: "default provider",
    tone: "progress"
  },
  {
    name: "Oracle AI Database 26ai",
    scope: "Vector Search / Select AI / SQL preview",
    status: "dry-run ready",
    tone: "progress"
  },
  {
    name: "OCI Object Storage",
    scope: "document staging / ingestion readiness",
    status: "probe ready",
    tone: "progress"
  },
  {
    name: "Browser Control MCP",
    scope: "tabs / navigation / click / type / screenshot",
    status: "planned",
    tone: "planned"
  },
  {
    name: "Business Apps",
    scope: "mail / calendar / docs / ticketing",
    status: "manual fallback first",
    tone: "planned"
  }
];

export const scheduledTaskBlueprints: ScheduledTaskBlueprint[] = [
  {
    name: "朝の PoC readiness digest",
    cadence: "毎日 08:00",
    prompt: "対象 workspace の capture、Knowledge、connector status から今日確認すべき PoC blocker をまとめる。",
    status: "schedule registry 待ち"
  },
  {
    name: "Oracle Docs update watch",
    cadence: "6時間ごと",
    prompt: "保存済み Oracle Docs URL を再確認し、AI Database / OCI GenAI の提案影響がある変更を抽出する。",
    status: "browser agent 待ち"
  },
  {
    name: "Follow-up draft refresh",
    cadence: "毎週 月曜",
    prompt: "capture と checklist から顧客向け follow-up email と未決事項を再生成する。",
    status: "artifact export ready"
  }
];

export const workflowGraphBlueprint: WorkflowNodeBlueprint[] = [
  {
    step: "01",
    title: "Observe",
    detail: "現在ページ、workspace、playbook、connector readiness を収集する"
  },
  {
    step: "02",
    title: "Plan",
    detail: "OCI GenAI が task を browser action と Oracle connector action に分解する"
  },
  {
    step: "03",
    title: "Approve",
    detail: "危険操作、外部送信、credential 参照の前にユーザー確認を挟む"
  },
  {
    step: "04",
    title: "Act",
    detail: "webview、RAG adapter、local connector を通じて step を実行する"
  },
  {
    step: "05",
    title: "Record",
    detail: "capture、memory、run history、export artifact に結果を残す"
  }
];
