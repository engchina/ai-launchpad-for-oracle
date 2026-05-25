import type { GeneratePocAssetsPayload, GeneratePocAssetsResult, GeneratedPocAsset } from "../shared/api";

type NormalizedPocAssetConfig = Required<GeneratePocAssetsPayload>;

const oracleIdentifierPattern = /^[A-Za-z][A-Za-z0-9_$#]*$/;

function normalize(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

function normalizeOracleIdentifier(value: string | undefined, fallback: string): string {
  const normalized = normalize(value, fallback).replace(/[^A-Za-z0-9_$#]/g, "_").toUpperCase();
  return oracleIdentifierPattern.test(normalized) ? normalized : fallback;
}

function normalizeConfig(payload: GeneratePocAssetsPayload): NormalizedPocAssetConfig {
  return {
    workspaceName: normalize(payload.workspaceName, "AI Launchpad PoC"),
    playbookTitle: normalize(payload.playbookTitle, "RAG Chatbot on Oracle AI Database 26ai"),
    useCase: normalize(payload.useCase, "Oracle AI Vector Search PoC"),
    dbSchema: normalizeOracleIdentifier(payload.dbSchema, "AI_LAUNCHPAD"),
    vectorTable: normalizeOracleIdentifier(payload.vectorTable, "AI_LAUNCHPAD_CHUNKS"),
    objectStorageNamespace: normalize(payload.objectStorageNamespace, "<object-storage-namespace>"),
    objectStorageBucket: normalize(payload.objectStorageBucket, "<object-storage-bucket>"),
    ociRegion: normalize(payload.ociRegion, "ap-tokyo-1"),
    embeddingModel: normalize(payload.embeddingModel, "cohere.embed-multilingual-v3.0")
  };
}

function createWarnings(config: NormalizedPocAssetConfig): string[] {
  const warnings = [
    "生成した asset は template です。実 OCI API、DB 接続、Terraform apply は実行していません。",
    "顧客データ、password、wallet、private key は template に含めないでください。"
  ];

  if (config.objectStorageNamespace.startsWith("<") || config.objectStorageBucket.startsWith("<")) {
    warnings.push("Object Storage namespace / bucket は placeholder です。実行前に環境固有の値へ置き換えてください。");
  }

  return warnings;
}

function createReadme(config: NormalizedPocAssetConfig): string {
  return [
    `# ${config.workspaceName}`,
    "",
    `## Use case`,
    "",
    config.useCase,
    "",
    `## Playbook`,
    "",
    config.playbookTitle,
    "",
    "## Assets",
    "",
    "- `sql/setup_vector_search.sql`: AI Vector Search table と sample query の SQL template",
    "- `python/ingest_documents.py`: Object Storage から文書を読み込む Python skeleton",
    "- `terraform/object_storage.tf`: PoC 用 Object Storage bucket の Terraform skeleton",
    "- `checklist.md`: PoC 実行前の readiness と validation checklist",
    "- `proposal.md`: 顧客説明に使う提案 section の draft",
    "- `follow_up_email.md`: 次アクション確認用の follow-up email draft",
    "- `architecture/architecture.mmd`: Mermaid architecture diagram の draft",
    "- `.env.example`: Local Connector と PoC 実行前確認用の環境変数 template",
    "- `troubleshooting.md`: 初期切り分け用 troubleshooting guide",
    "- `demo_script.md`: 顧客向け demo の進行 script",
    "- `handover.md`: PoC 後の引き継ぎ document",
    "",
    "## Safety",
    "",
    "- OCI private key、ADB wallet、password、顧客データはこの package に含めない",
    "- SQL / Python / Terraform は実行前に tenancy、compartment、IAM policy、network を確認する",
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
    "- 実 DB / OCI 操作が未準備の場合は、SQL preview、Mermaid diagram、checklist で前提と成功条件を確認します。",
    "",
    "## Flow",
    "",
    "1. Workspace と playbook の前提を確認する",
    "2. Oracle Docs / capture から Knowledge chunk と source evidence を確認する",
    `3. Object Storage と target table の前提を確認する: ${config.objectStorageNamespace}/${config.objectStorageBucket} -> ${config.dbSchema}.${config.vectorTable}`,
    `4. Embedding model と vector search の説明を行う: ${config.embeddingModel}`,
    "5. PoC package の README、SQL、Python、Terraform、checklist をレビューする",
    "6. proposal section と follow-up email の next action を確認する",
    "",
    "## Expected outcome",
    "",
    "- 顧客が PoC の scope、必要権限、実行前確認事項を理解している",
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
    `- Target table: ${config.dbSchema}.${config.vectorTable}`,
    `- Object Storage: ${config.objectStorageNamespace}/${config.objectStorageBucket}`,
    "",
    "## Included assets",
    "",
    "- README / proposal / follow-up email",
    "- Mermaid architecture diagram",
    "- SQL / Python / Terraform starter templates",
    "- `.env.example`、checklist、troubleshooting guide",
    "- Demo script",
    "",
    "## Open items",
    "",
    "- [ ] compartment、IAM policy、network、ADB wallet の owner を確定する",
    "- [ ] 顧客データ利用可否と anonymization 方針を確認する",
    "- [ ] PoC 成功条件、fallback、期限を顧客と合意する",
    "- [ ] 本番化に向けた security / governance review の要否を判断する",
    "",
    "## Handover notes",
    "",
    "- この package は starter template です。実 OCI API、DB 接続、Terraform apply は実行していません。",
    "- secret、wallet、private key、顧客データは別管理とし、この package には含めません。"
  ].join("\n");
}

function createEnvExample(config: NormalizedPocAssetConfig): string {
  return [
    "# AI Launchpad for Oracle PoC environment template",
    "# 実値、password、wallet zip、private key はこの file に保存しないでください。",
    "",
    "OCI_CLI_PROFILE=DEFAULT",
    `OCI_REGION=${config.ociRegion}`,
    `OCI_OBJECT_STORAGE_NAMESPACE=${config.objectStorageNamespace}`,
    `OCI_OBJECT_STORAGE_BUCKET=${config.objectStorageBucket}`,
    "",
    "SQLCL_PATH=<path-to-sqlcl>",
    "ADB_WALLET_PATH=<path-to-wallet-directory-or-zip>",
    "TNS_ADMIN=<path-to-wallet-directory>",
    "",
    `AI_LAUNCHPAD_DB_SCHEMA=${config.dbSchema}`,
    `AI_LAUNCHPAD_VECTOR_TABLE=${config.vectorTable}`,
    `AI_LAUNCHPAD_EMBEDDING_MODEL=${config.embeddingModel}`
  ].join("\n");
}

function createArchitectureDiagram(config: NormalizedPocAssetConfig): string {
  return [
    "flowchart LR",
    `  user["Business user / Pre-sales"]`,
    `  browser["AI Launchpad Browser Client"]`,
    `  docs["Oracle Docs / Captured pages"]`,
    `  objectStorage["OCI Object Storage\\n${config.objectStorageNamespace}/${config.objectStorageBucket}"]`,
    `  db["Oracle AI Database 26ai\\n${config.dbSchema}.${config.vectorTable}"]`,
    `  genai["OCI Generative AI\\n${config.embeddingModel}"]`,
    `  package["PoC package\\nREADME / SQL / Python / Terraform / Checklist"]`,
    "",
    "  user --> browser",
    "  browser --> docs",
    "  browser --> package",
    "  docs --> objectStorage",
    "  objectStorage --> db",
    "  genai --> db",
    "  db --> browser",
    "  browser --> user"
  ].join("\n");
}

function createTroubleshooting(config: NormalizedPocAssetConfig): string {
  return [
    `# ${config.workspaceName} Troubleshooting Guide`,
    "",
    "## Local Connector",
    "",
    "- `health` が unavailable の場合は Browser Client と worker process の起動状態を確認する",
    "- `OCI_CONFIG_FILE` または `~/.oci/config` が読めるか確認する",
    "- tenancy、user、fingerprint、private key の実値を UI や package に貼り付けない",
    "",
    "## Object Storage",
    "",
    `- namespace / bucket: ${config.objectStorageNamespace}/${config.objectStorageBucket}`,
    "- placeholder の場合は `.env.example` を環境固有の値に置き換える",
    "- bucket name、region、IAM policy、compartment を確認する",
    "",
    "## ADB / SQLcl",
    "",
    "- `ADB_WALLET_PATH` または `TNS_ADMIN` が wallet directory / zip を指しているか確認する",
    "- `SQLCL_PATH` または PATH 上の SQLcl executable を確認する",
    `- target table: ${config.dbSchema}.${config.vectorTable}`,
    "- VECTOR column、DB version、DBMS_CLOUD 権限を確認する",
    "",
    "## Demo fallback",
    "",
    "- 実 DB 接続が未準備の場合は SQL preview と Mermaid diagram で demo flow を説明する",
    "- 顧客データを使えない場合は匿名化した sample text で chunking と retrieval flow を確認する",
    "- 失敗時は原因、owner、次回確認事項を follow-up email に追記する"
  ].join("\n");
}

function createSql(config: NormalizedPocAssetConfig): string {
  return [
    `-- ${config.useCase}`,
    `-- Schema: ${config.dbSchema}`,
    "-- 実行前に DB version、VECTOR support、DBMS_CLOUD 権限を確認してください。",
    "",
    `CREATE TABLE ${config.dbSchema}.${config.vectorTable} (`,
    "  ID NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,",
    "  TITLE VARCHAR2(4000),",
    "  SOURCE_URL VARCHAR2(4000),",
    "  CHUNK_TEXT CLOB,",
    "  VECTOR_EMBEDDING VECTOR",
    ");",
    "",
    `-- Embedding model: ${config.embeddingModel}`,
    `-- SELECT ID, TITLE, VECTOR_DISTANCE(VECTOR_EMBEDDING, :query_embedding, COSINE) AS DISTANCE`,
    `-- FROM ${config.dbSchema}.${config.vectorTable}`,
    "-- ORDER BY DISTANCE",
    "-- FETCH FIRST 5 ROWS ONLY;"
  ].join("\n");
}

function createPython(config: NormalizedPocAssetConfig): string {
  return [
    '"""Document ingestion skeleton for AI Launchpad PoC.',
    "",
    "This file intentionally avoids embedding credentials. Use OCI config,",
    "instance principals, resource principals, or a controlled secret store.",
    '"""',
    "",
    "from __future__ import annotations",
    "",
    "OBJECT_STORAGE_NAMESPACE = " + JSON.stringify(config.objectStorageNamespace),
    "OBJECT_STORAGE_BUCKET = " + JSON.stringify(config.objectStorageBucket),
    "OCI_REGION = " + JSON.stringify(config.ociRegion),
    "VECTOR_TABLE = " + JSON.stringify(`${config.dbSchema}.${config.vectorTable}`),
    "",
    "",
    "def main() -> None:",
    '    print("Prepare Object Storage download, chunking, embedding, and DB insert steps.")',
    '    print(f"Bucket: {OBJECT_STORAGE_NAMESPACE}/{OBJECT_STORAGE_BUCKET} in {OCI_REGION}")',
    '    print(f"Target table: {VECTOR_TABLE}")',
    "",
    "",
    'if __name__ == "__main__":',
    "    main()"
  ].join("\n");
}

function createTerraform(config: NormalizedPocAssetConfig): string {
  return [
    `# ${config.useCase}`,
    "# Terraform skeleton only. Review compartment_id and IAM policy before apply.",
    "",
    'variable "compartment_id" {',
    "  type = string",
    "}",
    "",
    'variable "bucket_name" {',
    "  type    = string",
    `  default = "${config.objectStorageBucket}"`,
    "}",
    "",
    'resource "oci_objectstorage_bucket" "poc_bucket" {',
    "  compartment_id = var.compartment_id",
    `  namespace      = "${config.objectStorageNamespace}"`,
    "  name           = var.bucket_name",
    '  access_type    = "NoPublicAccess"',
    "}"
  ].join("\n");
}

function createProposal(config: NormalizedPocAssetConfig): string {
  return [
    `# ${config.workspaceName} Proposal Section`,
    "",
    "## 提案要旨",
    "",
    `${config.playbookTitle} をベースに、${config.useCase} の PoC を短期間で検証します。`,
    "既存文書や業務ナレッジを Oracle AI Database / OCI AI services に接続し、引用付き回答、検索品質、運用前提を顧客と同じ画面で確認できる状態を目指します。",
    "",
    "## 期待効果",
    "",
    "- PoC 前提、demo 手順、検証観点を顧客と共有しやすくする",
    "- Oracle AI Database / OCI の採用判断に必要な technical evidence を早期に揃える",
    "- 本番化に向けた security、network、data governance の確認事項を明確にする",
    "",
    "## 確認が必要な前提",
    "",
    `- Target vector table: ${config.dbSchema}.${config.vectorTable}`,
    `- Object Storage: ${config.objectStorageNamespace}/${config.objectStorageBucket}`,
    `- Embedding model: ${config.embeddingModel}`,
    "- 実顧客データを使う場合は、事前に data handling と secret 管理の承認を取得する"
  ].join("\n");
}

function createFollowUpEmail(config: NormalizedPocAssetConfig): string {
  return [
    `件名: ${config.workspaceName} PoC package の次アクション確認`,
    "",
    "お客様各位",
    "",
    `本日は ${config.playbookTitle} の PoC 準備についてお時間をいただき、ありがとうございました。`,
    `${config.useCase} の検証に向け、以下の starter assets を整理しました。`,
    "",
    "- README / 提案 section draft",
    "- SQL、Python、Terraform の template",
    "- OCI setup と validation checklist",
    "",
    "次の確認事項:",
    "",
    "1. PoC で扱うデータ範囲と secret / wallet の取り扱い",
    "2. ADB、Object Storage、IAM policy、network の準備状況",
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
    `## Scope`,
    "",
    `- Playbook: ${config.playbookTitle}`,
    `- Use case: ${config.useCase}`,
    `- Target table: ${config.dbSchema}.${config.vectorTable}`,
    `- Object Storage: ${config.objectStorageNamespace}/${config.objectStorageBucket}`,
    "",
    "## Readiness",
    "",
    "- [ ] OCI config profile と compartment を確認する",
    "- [ ] ADB wallet、network、DB user 権限を確認する",
    "- [ ] Object Storage bucket と IAM policy を確認する",
    "- [ ] 顧客データ、secret、private key を package に含めていないことを確認する",
    "",
    "## Demo validation",
    "",
    "- [ ] SQL table と VECTOR column の作成手順をレビューする",
    "- [ ] document chunking と embedding model の前提を説明できる",
    "- [ ] similarity query の結果と引用 source を確認する",
    "- [ ] PoC 後の follow-up action と owner を整理する"
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
    message: "PoC asset templates を生成しました。実行や外部接続は行っていません。",
    generatedAt: new Date().toISOString(),
    warnings: createWarnings(config),
    assets: [
      createAsset("readme", "README.md", "PoC README", createReadme(config)),
      createAsset("proposal", "proposal.md", "Proposal section draft", createProposal(config)),
      createAsset("email", "follow_up_email.md", "Follow-up email draft", createFollowUpEmail(config)),
      createAsset("diagram", "architecture/architecture.mmd", "Mermaid architecture diagram", createArchitectureDiagram(config)),
      createAsset("env", ".env.example", "Environment variable template", createEnvExample(config)),
      createAsset("demo", "demo_script.md", "Demo script", createDemoScript(config)),
      createAsset("sql", "sql/setup_vector_search.sql", "AI Vector Search SQL", createSql(config)),
      createAsset("python", "python/ingest_documents.py", "Document ingestion Python", createPython(config)),
      createAsset("terraform", "terraform/object_storage.tf", "Object Storage Terraform", createTerraform(config)),
      createAsset("checklist", "checklist.md", "PoC validation checklist", createChecklist(config)),
      createAsset("troubleshooting", "troubleshooting.md", "Troubleshooting guide", createTroubleshooting(config)),
      createAsset("handover", "handover.md", "Handover document", createHandoverDocument(config))
    ]
  };
}
