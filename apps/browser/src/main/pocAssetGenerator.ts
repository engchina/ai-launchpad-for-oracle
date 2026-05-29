import type { GeneratePocAssetsPayload, GeneratePocAssetsResult, GeneratedPocAsset } from "../shared/api";

type NormalizedPocAssetConfig = Required<GeneratePocAssetsPayload>;

function normalize(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

function normalizeConfig(payload: GeneratePocAssetsPayload): NormalizedPocAssetConfig {
  return {
    workspaceName: normalize(payload.workspaceName, "AI Launchpad PoC"),
    playbookTitle: normalize(payload.playbookTitle, "OCI GenAI Enterprise AI Assistant"),
    useCase: normalize(payload.useCase, "OCI GenAI Enterprise AI PoC"),
    genAiModel: normalize(payload.genAiModel, "<oci-genai-model>")
  };
}

function createWarnings(): string[] {
  return [
    "生成した asset は OCI GenAI Enterprise AI 向けの template です。実 OCI API 呼び出しは行っていません。",
    "API key、token、password、顧客データは template に含めないでください。"
  ];
}

function createReadme(config: NormalizedPocAssetConfig): string {
  return [
    `# ${config.workspaceName}`,
    "",
    "## Use case",
    "",
    config.useCase,
    "",
    "## Playbook",
    "",
    config.playbookTitle,
    "",
    "## Assets",
    "",
    "- `proposal.md`: 顧客説明に使う提案 section の draft",
    "- `follow_up_email.md`: 次アクション確認用の follow-up email draft",
    "- `architecture/architecture.mmd`: OCI GenAI Enterprise AI flow の Mermaid diagram",
    "- `.env.example`: OCI GenAI OpenAI-compatible endpoint 用の環境変数 template",
    "- `demo_script.md`: 顧客向け demo の進行 script",
    "- `checklist.md`: GenAI 実行前の readiness と validation checklist",
    "- `troubleshooting.md`: 初期切り分け用 troubleshooting guide",
    "- `handover.md`: PoC 後の引き継ぎ document",
    "",
    "## Safety",
    "",
    "- API key、token、password、顧客データはこの package に含めない",
    "- LLM に送る context は capture / document source として画面で確認してから扱う",
    "- 生成物は PoC starter であり、本番運用 template ではない"
  ].join("\n");
}

function createDemoScript(config: NormalizedPocAssetConfig): string {
  return [
    `# ${config.workspaceName} Demo Script`,
    "",
    "## Opening",
    "",
    `- 今日の目的は ${config.playbookTitle} を使い、${config.useCase} の PoC flow を短時間で確認することです。`,
    "- Browser Client で Oracle Docs / OCI Console / 顧客メモを capture し、OCI GenAI Enterprise AI に渡す根拠を確認します。",
    "",
    "## Flow",
    "",
    "1. Workspace と playbook の前提を確認する",
    "2. ページ、選択テキスト、スクリーンショットを Captures に保存する",
    "3. Captures / 文書を Knowledge source に追加する",
    `4. OCI GenAI Enterprise AI model (${config.genAiModel}) で grounded answer を生成する`,
    "5. 回答、sources、proposal、follow-up email の next action を確認する",
    "",
    "## Expected outcome",
    "",
    "- 顧客が GenAI PoC の scope、根拠 source、確認事項を理解している",
    "- 次回までの owner、期限、未確認リスクが明確になっている"
  ].join("\n");
}

function createHandoverDocument(config: NormalizedPocAssetConfig): string {
  return [
    `# ${config.workspaceName} Handover Document`,
    "",
    "## Summary",
    "",
    `- Playbook: ${config.playbookTitle}`,
    `- Use case: ${config.useCase}`,
    `- OCI GenAI model: ${config.genAiModel}`,
    "",
    "## Included assets",
    "",
    "- README / proposal / follow-up email",
    "- Mermaid architecture diagram",
    "- `.env.example`、checklist、troubleshooting guide",
    "- Demo script",
    "",
    "## Open items",
    "",
    "- [ ] OCI GenAI endpoint、model、API key 管理の owner を確定する",
    "- [ ] 顧客データ利用可否と anonymization 方針を確認する",
    "- [ ] PoC 成功条件、fallback、期限を顧客と合意する",
    "- [ ] 本番化に向けた security / governance review の要否を判断する",
    "",
    "## Handover notes",
    "",
    "- この package は starter template です。実 OCI API 呼び出しは行っていません。",
    "- secret、token、password、顧客データは別管理とし、この package には含めません。"
  ].join("\n");
}

function createEnvExample(config: NormalizedPocAssetConfig): string {
  return [
    "# AI Launchpad for Oracle OCI GenAI environment template",
    "# 実値、API key、token、password はこの file に保存しないでください。",
    "",
    "AI_LAUNCHPAD_OCI_GENAI_LIVE=1",
    "OCI_GENAI_BASE_URL=<openai-compatible-endpoint>",
    "OCI_GENAI_API_KEY=<api-key>",
    `OCI_GENAI_MODEL=${config.genAiModel}`
  ].join("\n");
}

function createArchitectureDiagram(config: NormalizedPocAssetConfig): string {
  return [
    "flowchart LR",
    `  user["Business user / Pre-sales"]`,
    `  browser["AI Launchpad Browser Client"]`,
    `  captures["Captures / Knowledge sources"]`,
    `  genai["OCI GenAI Enterprise AI\\n${config.genAiModel}"]`,
    `  answer["Grounded answer / Sources"]`,
    `  package["PoC package\\nREADME / Proposal / Checklist"]`,
    "",
    "  user --> browser",
    "  browser --> captures",
    "  captures --> genai",
    "  genai --> answer",
    "  answer --> browser",
    "  browser --> package",
    "  package --> user"
  ].join("\n");
}

function createTroubleshooting(config: NormalizedPocAssetConfig): string {
  return [
    `# ${config.workspaceName} Troubleshooting Guide`,
    "",
    "## OCI GenAI Enterprise AI",
    "",
    "- `AI_LAUNCHPAD_OCI_GENAI_LIVE=1` が設定されているか確認する",
    "- `OCI_GENAI_BASE_URL`、`OCI_GENAI_API_KEY`、`OCI_GENAI_MODEL` が connector 側の環境変数にあるか確認する",
    `- target model: ${config.genAiModel}`,
    "- API key や token を UI、Markdown、capture、prompt に貼り付けない",
    "",
    "## Knowledge sources",
    "",
    "- 回答が空の場合は captures または文書を Knowledge に追加する",
    "- 根拠不足の場合は Oracle service、demo step、URL など具体的なキーワードで質問する",
    "- 顧客データを使えない場合は匿名化した sample text で prompt flow を確認する",
    "",
    "## Demo fallback",
    "",
    "- live 生成が未設定の場合は、source selection と prompt context の確認までを demo する",
    "- 失敗時は原因、owner、次回確認事項を follow-up email に追記する"
  ].join("\n");
}

function createProposal(config: NormalizedPocAssetConfig): string {
  return [
    `# ${config.workspaceName} Proposal Section`,
    "",
    "## 提案要旨",
    "",
    `${config.playbookTitle} をベースに、${config.useCase} の PoC を短期間で検証します。`,
    "既存文書や業務ナレッジを OCI GenAI Enterprise AI に接続し、根拠付き回答、回答品質、運用前提を顧客と同じ画面で確認できる状態を目指します。",
    "",
    "## 期待効果",
    "",
    "- PoC 前提、demo 手順、検証観点を顧客と共有しやすくする",
    "- OCI GenAI Enterprise AI の採用判断に必要な technical evidence を早期に揃える",
    "- 本番化に向けた security、prompt governance、data handling の確認事項を明確にする",
    "",
    "## 確認が必要な前提",
    "",
    `- OCI GenAI model: ${config.genAiModel}`,
    "- live endpoint / API key は connector 側の環境変数で管理する",
    "- 実顧客データを使う場合は、事前に data handling と secret 管理の承認を取得する"
  ].join("\n");
}

function createFollowUpEmail(config: NormalizedPocAssetConfig): string {
  return [
    `件名: ${config.workspaceName} OCI GenAI PoC package の次アクション確認`,
    "",
    "お客様各位",
    "",
    `本日は ${config.playbookTitle} の PoC 準備についてお時間をいただき、ありがとうございました。`,
    `${config.useCase} の検証に向け、以下の starter assets を整理しました。`,
    "",
    "- README / 提案 section draft",
    "- OCI GenAI endpoint 設定 template",
    "- Demo script / validation checklist",
    "",
    "次の確認事項:",
    "",
    "1. PoC で扱うデータ範囲と secret / API key の取り扱い",
    "2. OCI GenAI model、endpoint、利用制限の準備状況",
    "3. Demo 当日に確認したい質問、成功条件、fallback 方針",
    "",
    "上記をご確認いただき、次回までに owner と期限を整理できればと思います。",
    "",
    "よろしくお願いいたします。"
  ].join("\n");
}

function createChecklist(config: NormalizedPocAssetConfig): string {
  return [
    `# ${config.workspaceName} PoC Checklist`,
    "",
    "## Scope",
    "",
    `- Playbook: ${config.playbookTitle}`,
    `- Use case: ${config.useCase}`,
    `- OCI GenAI model: ${config.genAiModel}`,
    "",
    "## Readiness",
    "",
    "- [ ] OCI GenAI endpoint と model を確認する",
    "- [ ] API key / token の保管場所と owner を確認する",
    "- [ ] Knowledge に入れる capture / 文書の範囲を確認する",
    "- [ ] 顧客データ、secret、private key を package に含めていないことを確認する",
    "",
    "## Demo validation",
    "",
    "- [ ] Knowledge sources が回答前に確認できる",
    "- [ ] OCI GenAI Enterprise AI の回答と source evidence をレビューできる",
    "- [ ] proposal / follow-up email の next action を整理できる",
    "- [ ] PoC 後の owner と期限を決められる"
  ].join("\n");
}

function createAsset(kind: GeneratedPocAsset["kind"], fileName: string, title: string, content: string): GeneratedPocAsset {
  return {
    kind,
    fileName,
    title,
    content
  };
}

export function generatePocAssets(payload: GeneratePocAssetsPayload = {}): GeneratePocAssetsResult {
  const config = normalizeConfig(payload);
  return {
    status: "generated",
    message: "OCI GenAI Enterprise AI PoC asset templates を生成しました。実行や外部接続は行っていません。",
    generatedAt: new Date().toISOString(),
    warnings: createWarnings(),
    assets: [
      createAsset("readme", "README.md", "PoC README", createReadme(config)),
      createAsset("proposal", "proposal.md", "Proposal section draft", createProposal(config)),
      createAsset("email", "follow_up_email.md", "Follow-up email draft", createFollowUpEmail(config)),
      createAsset("diagram", "architecture/architecture.mmd", "Mermaid architecture diagram", createArchitectureDiagram(config)),
      createAsset("env", ".env.example", "Environment variable template", createEnvExample(config)),
      createAsset("demo", "demo_script.md", "Demo script", createDemoScript(config)),
      createAsset("checklist", "checklist.md", "PoC validation checklist", createChecklist(config)),
      createAsset("troubleshooting", "troubleshooting.md", "Troubleshooting guide", createTroubleshooting(config)),
      createAsset("handover", "handover.md", "Handover document", createHandoverDocument(config))
    ]
  };
}
