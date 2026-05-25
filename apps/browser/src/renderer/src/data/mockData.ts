import type { CapturedPageRecord, PageSourceType } from "../../../shared/api";

export type Workspace = {
  id: string;
  name: string;
  customerName: string;
  stage: string;
  industry: string;
};

export type Playbook = {
  id: string;
  title: string;
  category: string;
  services: string[];
  demoSteps: string[];
};

export type CapturedPage = CapturedPageRecord;

export const mockWorkspaces: Workspace[] = [
  {
    id: "ws-finance-ai",
    name: "金融向け RAG 提案",
    customerName: "Example Bank",
    stage: "PoC 準備",
    industry: "Financial Services"
  },
  {
    id: "ws-manufacturing-vector",
    name: "製造業 AI Search",
    customerName: "Example Manufacturing",
    stage: "Demo 設計",
    industry: "Manufacturing"
  },
  {
    id: "ws-public-sector",
    name: "公共機関 Select AI",
    customerName: "Example Agency",
    stage: "要件整理",
    industry: "Public Sector"
  }
];

export const mockPlaybooks: Playbook[] = [
  {
    id: "pb-rag-vector-search",
    title: "RAG Chatbot on Oracle AI Database 26ai",
    category: "RAG",
    services: ["Oracle AI Database 26ai", "AI Vector Search", "OCI Generative AI"],
    demoSteps: [
      "顧客文書をアップロードし、チャンク方針を確認する",
      "Embedding と vector index の作成手順を説明する",
      "質問に対して引用付き回答を生成する",
      "PoC package と follow-up email を出力する"
    ]
  },
  {
    id: "pb-select-ai",
    title: "Select AI / NL2SQL Demo",
    category: "Database AI",
    services: ["Autonomous Database", "DBMS_CLOUD_AI", "SQLcl"],
    demoSteps: [
      "DB user と必要権限を確認する",
      "AI profile 作成 SQL を準備する",
      "自然言語から SQL を生成して実行する",
      "制約と監査観点を顧客向けに整理する"
    ]
  },
  {
    id: "pb-oci-agents",
    title: "OCI Generative AI Agents Readiness",
    category: "Agent",
    services: ["OCI Generative AI Agents", "Object Storage", "Identity Policies"],
    demoSteps: [
      "Object Storage bucket と IAM policy を確認する",
      "RAG Tool / SQL Tool の前提条件を整理する",
      "Agent endpoint の検証 checklist を作成する",
      "本番導入時の責任分界を説明する"
    ]
  }
];

export const defaultUrl = "https://docs.oracle.com/en/database/oracle/oracle-database/26/vecse/";

export function detectSourceType(url: string): PageSourceType {
  if (url.includes("docs.oracle.com")) {
    return "oracle_docs";
  }

  if (url.includes("cloud.oracle.com")) {
    return "oci_console";
  }

  if (url.includes("livelabs.oracle.com")) {
    return "livelabs";
  }

  if (url.includes("github.com")) {
    return "github";
  }

  return "other";
}

export function titleForUrl(url: string): string {
  const sourceType = detectSourceType(url);

  if (sourceType === "oci_console") {
    return "OCI Console - Generative AI";
  }

  if (sourceType === "livelabs") {
    return "Oracle LiveLabs - AI Database Workshop";
  }

  if (sourceType === "github") {
    return "GitHub Sample - Oracle AI Demo";
  }

  return "Oracle AI Vector Search Documentation";
}
