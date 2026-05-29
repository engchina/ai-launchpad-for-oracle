export type AgenticModeId = "chat" | "captures";

export type AgenticMode = {
  id: AgenticModeId;
  label: string;
  summary: string;
  stateLabel: string;
};

export const agenticModes: AgenticMode[] = [
  {
    id: "chat",
    label: "Chat / Hub",
    summary: "現在ページと保存した capture を使って、OCI GenAI Enterprise AI の検討メモを整理するモード。",
    stateLabel: "OCI GenAI 専用"
  },
  {
    id: "captures",
    label: "Captures",
    summary: "現在ページ、選択テキスト、スクリーンショットを Electron local store に保存するモード。",
    stateLabel: "Local 保存のみ"
  }
];
