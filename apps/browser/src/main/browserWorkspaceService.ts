import type {
  CapturedPagePayload,
  CapturedPageRecord,
  CapturedPageResult,
  ClearCapturesResult,
  ListCapturesResult,
  SaveScreenshotPayload,
  SaveSelectionPayload
} from "../shared/api";
import {
  clearStoredCaptures,
  listStoredCaptures,
  savePageCapture,
  saveScreenshotCapture,
  saveSelectionCapture
} from "./localCaptureStore";

type LocalStoreBaseDirProvider = () => string;

function toCapturedPageResult(capture: CapturedPageRecord): CapturedPageResult {
  return {
    ok: true,
    id: capture.id,
    savedAt: capture.savedAt,
    capture
  };
}

export class BrowserWorkspaceService {
  constructor(private readonly getLocalStoreBaseDir: LocalStoreBaseDirProvider) {}

  async listCaptures(): Promise<ListCapturesResult> {
    return {
      captures: await listStoredCaptures(this.getLocalStoreBaseDir())
    };
  }

  async savePage(payload: CapturedPagePayload): Promise<CapturedPageResult> {
    return toCapturedPageResult(await savePageCapture(this.getLocalStoreBaseDir(), payload));
  }

  async saveSelection(payload: SaveSelectionPayload): Promise<CapturedPageResult> {
    return toCapturedPageResult(await saveSelectionCapture(this.getLocalStoreBaseDir(), payload));
  }

  async saveScreenshot(payload: SaveScreenshotPayload): Promise<CapturedPageResult> {
    return toCapturedPageResult(await saveScreenshotCapture(this.getLocalStoreBaseDir(), payload));
  }

  async clearCaptures(): Promise<ClearCapturesResult> {
    await clearStoredCaptures(this.getLocalStoreBaseDir());
    return {
      ok: true,
      clearedAt: new Date().toISOString()
    };
  }

}
