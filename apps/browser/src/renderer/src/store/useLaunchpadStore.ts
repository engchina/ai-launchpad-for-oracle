import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  defaultOracleVectorSearchConfig,
  normalizeOracleVectorSearchConfig,
  type OracleVectorSearchConfig,
  type RagChunk
} from "../../../shared/rag";
import type { CapturedPage } from "@renderer/data/mockData";
import { defaultUrl, detectSourceType, mockPlaybooks, mockWorkspaces, titleForUrl } from "@renderer/data/mockData";

type AssistantMode = "idle" | "summary" | "checklist" | "selection" | "ask";

type LaunchpadState = {
  currentUrl: string;
  currentTitle: string;
  selectedWorkspaceId: string;
  selectedPlaybookId: string;
  captures: CapturedPage[];
  knowledgeCaptureIds: string[];
  knowledgeDocumentChunks: RagChunk[];
  oracleVectorSearchConfig: OracleVectorSearchConfig;
  summary: string;
  checklist: string[];
  selectionExplanation: string;
  askPageAnswer: string;
  askPageSources: Array<{ title: string; url: string }>;
  assistantMode: AssistantMode;
  setUrl: (url: string) => void;
  setPageMetadata: (url: string, title: string) => void;
  setWorkspace: (workspaceId: string) => void;
  setPlaybook: (playbookId: string) => void;
  summarizePage: () => void;
  extractChecklist: () => void;
  explainSelection: (selectedText?: string) => void;
  setAskPageAnswer: (answer: string, sources: Array<{ title: string; url: string }>) => void;
  addCapture: (capture: CapturedPage) => void;
  clearCaptures: () => void;
  addCaptureToKnowledge: (captureId: string) => void;
  addAllCapturesToKnowledge: () => void;
  removeCaptureFromKnowledge: (captureId: string) => void;
  addKnowledgeDocumentChunks: (chunks: RagChunk[]) => void;
  removeKnowledgeDocument: (documentId: string) => void;
  setOracleVectorSearchConfig: (patch: Partial<OracleVectorSearchConfig>) => void;
  resetOracleVectorSearchConfig: () => void;
  clearKnowledge: () => void;
};

const initialTitle = titleForUrl(defaultUrl);

export const useLaunchpadStore = create<LaunchpadState>()(
  persist(
    (set, get) => ({
      currentUrl: defaultUrl,
      currentTitle: initialTitle,
      selectedWorkspaceId: mockWorkspaces[0].id,
      selectedPlaybookId: mockPlaybooks[0].id,
      captures: [],
      knowledgeCaptureIds: [],
      knowledgeDocumentChunks: [],
      oracleVectorSearchConfig: defaultOracleVectorSearchConfig,
      summary: "",
      checklist: [],
      selectionExplanation: "",
      askPageAnswer: "",
      askPageSources: [],
      assistantMode: "idle",
      setUrl: (url) =>
        set({
          currentUrl: url,
          currentTitle: titleForUrl(url),
          summary: "",
          checklist: [],
          selectionExplanation: "",
          askPageAnswer: "",
          askPageSources: [],
          assistantMode: "idle"
        }),
      setPageMetadata: (url, title) =>
        set({
          currentUrl: url,
          currentTitle: title.trim() || titleForUrl(url)
        }),
      setWorkspace: (workspaceId) => set({ selectedWorkspaceId: workspaceId }),
      setPlaybook: (playbookId) => set({ selectedPlaybookId: playbookId }),
      summarizePage: () => {
        const { currentTitle } = get();
        set({
          assistantMode: "summary",
          summary: `${currentTitle} は、Oracle AI Database / OCI AI サービスの提案準備に使える技術情報です。MVP ではページ本文の取得は mock ですが、要約、前提条件、顧客向け説明、PoC checklist へ変換する流れを確認できます。`
        });
      },
      extractChecklist: () => {
        const playbook = mockPlaybooks.find((item) => item.id === get().selectedPlaybookId) ?? mockPlaybooks[0];
        set({
          assistantMode: "checklist",
          checklist: [
            "現在のページ URL と顧客 workspace の関連付けを確認する",
            "提案対象の Oracle サービスと前提条件を整理する",
            ...playbook.demoSteps,
            "保存済み capture から follow-up と PoC package を生成する"
          ]
        });
      },
      explainSelection: (selectedText) =>
        set({
          assistantMode: "selection",
          selectionExplanation: selectedText?.trim()
            ? `選択テキストを顧客説明向けに整理します: ${selectedText.trim()}`
            : "選択テキストが取得できませんでした。Electron 実行時は実ページ内でテキストを選択してから実行してください。"
        }),
      setAskPageAnswer: (answer, sources) =>
        set({
          assistantMode: "ask",
          askPageAnswer: answer,
          askPageSources: sources
        }),
      addCapture: (capture) =>
        set((state) => ({
          captures: [
            {
              ...capture,
              sourceType: detectSourceType(capture.url)
            },
            ...state.captures
          ]
        })),
      clearCaptures: () => set({ captures: [], knowledgeCaptureIds: [] }),
      addCaptureToKnowledge: (captureId) =>
        set((state) => ({
          knowledgeCaptureIds: state.knowledgeCaptureIds.includes(captureId)
            ? state.knowledgeCaptureIds
            : [captureId, ...state.knowledgeCaptureIds]
        })),
      addAllCapturesToKnowledge: () =>
        set((state) => ({
          knowledgeCaptureIds: Array.from(new Set([...state.captures.map((capture) => capture.id), ...state.knowledgeCaptureIds]))
        })),
      removeCaptureFromKnowledge: (captureId) =>
        set((state) => ({
          knowledgeCaptureIds: state.knowledgeCaptureIds.filter((id) => id !== captureId)
        })),
      addKnowledgeDocumentChunks: (chunks) =>
        set((state) => {
          const documentIds = new Set(chunks.map((chunk) => chunk.captureId));
          return {
            knowledgeDocumentChunks: [
              ...chunks,
              ...state.knowledgeDocumentChunks.filter((chunk) => !documentIds.has(chunk.captureId))
            ]
          };
        }),
      removeKnowledgeDocument: (documentId) =>
        set((state) => ({
          knowledgeDocumentChunks: state.knowledgeDocumentChunks.filter((chunk) => chunk.captureId !== documentId)
        })),
      setOracleVectorSearchConfig: (patch) =>
        set((state) => ({
          oracleVectorSearchConfig: normalizeOracleVectorSearchConfig({
            ...state.oracleVectorSearchConfig,
            ...patch
          })
        })),
      resetOracleVectorSearchConfig: () =>
        set({
          oracleVectorSearchConfig: defaultOracleVectorSearchConfig
        }),
      clearKnowledge: () => set({ knowledgeCaptureIds: [], knowledgeDocumentChunks: [] })
    }),
    {
      name: "ai-launchpad-browser-state",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        captures: state.captures,
        currentUrl: state.currentUrl,
        currentTitle: state.currentTitle,
        selectedWorkspaceId: state.selectedWorkspaceId,
        selectedPlaybookId: state.selectedPlaybookId,
        knowledgeCaptureIds: state.knowledgeCaptureIds,
        knowledgeDocumentChunks: state.knowledgeDocumentChunks,
        oracleVectorSearchConfig: state.oracleVectorSearchConfig
      })
    }
  )
);
