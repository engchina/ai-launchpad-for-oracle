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
    id: "local-oracle-poc",
    name: "Oracle PoC Workspace",
    customerName: "Local Workspace",
    stage: "MVP",
    industry: "Oracle AI"
  }
];

export const mockPlaybooks: Playbook[] = [
  {
    id: "pb-oci-genai-enterprise-ai",
    title: "OCI GenAI Enterprise AI Assistant",
    category: "OCI GenAI",
    services: ["OCI Generative AI", "Enterprise AI Project"],
    demoSteps: [
      "現在ページと保存済み capture を確認する",
      "OCI GenAI endpoint、model、API key 管理を確認する",
      "質問に対して引用付き回答を生成する",
      "次回までの確認事項を整理する"
    ]
  }
];

export const defaultUrl = "https://docs.oracle.com/en-us/iaas/Content/generative-ai/home.htm";

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
    return "Oracle LiveLabs - OCI Generative AI Workshop";
  }

  if (sourceType === "github") {
    return "GitHub Sample - Oracle AI Demo";
  }

  return "OCI Generative AI Documentation";
}
