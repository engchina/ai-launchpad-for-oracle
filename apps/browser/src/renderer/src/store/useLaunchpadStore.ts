import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { RagChunk } from "../../../shared/rag";
import type { CapturedPage } from "@renderer/data/mockData";
import { defaultUrl, detectSourceType, mockPlaybooks, mockWorkspaces, titleForUrl } from "@renderer/data/mockData";

type LaunchpadState = {
  currentUrl: string;
  currentTitle: string;
  selectedWorkspaceId: string;
  selectedPlaybookId: string;
  captures: CapturedPage[];
  knowledgeCaptureIds: string[];
  knowledgeDocumentChunks: RagChunk[];
  setUrl: (url: string) => void;
  setPageMetadata: (url: string, title: string) => void;
  hydrateCaptures: (captures: CapturedPage[]) => void;
  addCapture: (capture: CapturedPage) => void;
  clearCaptures: () => void;
  addCaptureToKnowledge: (captureId: string) => void;
  addAllCapturesToKnowledge: () => void;
  removeCaptureFromKnowledge: (captureId: string) => void;
  addKnowledgeDocumentChunks: (chunks: RagChunk[]) => void;
  removeKnowledgeDocument: (documentId: string) => void;
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
      setUrl: (url) =>
        set({
          currentUrl: url,
          currentTitle: titleForUrl(url)
        }),
      setPageMetadata: (url, title) =>
        set({
          currentUrl: url,
          currentTitle: title.trim() || titleForUrl(url)
        }),
      hydrateCaptures: (captures) =>
        set({
          captures,
          knowledgeCaptureIds: get().knowledgeCaptureIds.filter((captureId) => captures.some((capture) => capture.id === captureId))
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
        knowledgeDocumentChunks: state.knowledgeDocumentChunks
      })
    }
  )
);
