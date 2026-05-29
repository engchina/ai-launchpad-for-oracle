export type BrowserToolCategory =
  | "navigation"
  | "input"
  | "observation"
  | "screenshot"
  | "evaluation"
  | "pages"
  | "windows"
  | "bookmarks"
  | "history"
  | "tab_groups"
  | "filesystem"
  | "memory"
  | "dom"
  | "console"
  | "browser_info";

export type BrowserToolSafety = "read" | "browser_write" | "local_write" | "destructive";
export type BrowserToolApproval = "not_required" | "required" | "blocked_by_default";
export type BrowserToolRuntimeScope = "browser" | "local_workspace" | "memory_store" | "oci_genai_context";

export type BrowserToolDefinition = {
  id: string;
  compatibleName: string;
  category: BrowserToolCategory;
  label: string;
  runtimeScope: BrowserToolRuntimeScope;
  safety: BrowserToolSafety;
  approval: BrowserToolApproval;
  description: string;
};

export type BrowserToolCategorySummary = {
  category: BrowserToolCategory;
  total: number;
  reviewRequired: number;
  blockedByDefault: number;
};

export type BrowserToolCatalogSummary = {
  totalTools: number;
  notRequired: number;
  reviewRequired: number;
  blockedByDefault: number;
  categories: BrowserToolCategorySummary[];
};

type BrowserToolSeed = Omit<BrowserToolDefinition, "id" | "approval">;

const categoryLabels: Record<BrowserToolCategory, string> = {
  navigation: "Navigation",
  input: "Input",
  observation: "Observation",
  screenshot: "Screenshots",
  evaluation: "Evaluation",
  pages: "Pages",
  windows: "Windows",
  bookmarks: "Bookmarks",
  history: "History",
  tab_groups: "Tab Groups",
  filesystem: "Filesystem",
  memory: "Memory",
  dom: "DOM",
  console: "Console",
  browser_info: "Browser Info"
};

const browserTools: BrowserToolSeed[] = [
  ...toolGroup("navigation", "browser", "browser_write", [
    ["new_page", "New page", "新しい browser page の作成候補。"],
    ["navigate", "Navigate", "指定 URL への移動候補。"],
    ["go_back", "Go back", "現在 page の履歴を戻る候補。"],
    ["go_forward", "Go forward", "現在 page の履歴を進む候補。"],
    ["reload", "Reload", "現在 page の再読み込み候補。"]
  ]),
  ...toolGroup("input", "browser", "browser_write", [
    ["click", "Click", "選択済み要素の click 候補。"],
    ["type", "Type", "focused field への文字入力候補。"],
    ["press_key", "Press key", "keyboard shortcut または key press 候補。"],
    ["hover", "Hover", "対象要素への hover 候補。"],
    ["scroll", "Scroll", "page または element の scroll 候補。"],
    ["drag", "Drag", "drag and drop 操作候補。"],
    ["fill", "Fill", "form field の値設定候補。"],
    ["clear", "Clear", "form field の値消去候補。"],
    ["focus", "Focus", "対象要素への focus 移動候補。"],
    ["check", "Check", "checkbox または radio の選択候補。"],
    ["uncheck", "Uncheck", "checkbox の選択解除候補。"],
    ["select_option", "Select option", "select field の option 選択候補。"],
    ["upload_file", "Upload file", "local workspace file の upload 候補。"]
  ]),
  ...toolGroup("observation", "browser", "read", [
    ["take_snapshot", "Take snapshot", "現在 page の accessibility snapshot 取得。"],
    ["take_enhanced_snapshot", "Take enhanced snapshot", "DOM と表示状態を統合した snapshot 取得。"],
    ["extract_text", "Extract text", "page text の抽出。"],
    ["extract_links", "Extract links", "page link の抽出。"]
  ]),
  ...toolGroup("screenshot", "browser", "read", [
    ["take_screenshot", "Take screenshot", "現在 page の screenshot 取得。"],
    ["save_screenshot", "Save screenshot", "screenshot を local capture 候補として保存。"]
  ]),
  ...toolGroup("evaluation", "browser", "browser_write", [
    ["evaluate_script", "Evaluate script", "page context で script を評価する候補。"]
  ]),
  ...toolGroup("pages", "browser", "browser_write", [
    ["list_pages", "List pages", "開いている page の一覧取得。"],
    ["active_page", "Active page", "active page の取得または切り替え候補。"],
    ["close_page", "Close page", "page close 候補。"],
    ["new_hidden_page", "New hidden page", "hidden page の作成候補。"],
    ["select_page", "Select page", "操作対象 page の切り替え候補。"]
  ]),
  ...toolGroup("windows", "browser", "browser_write", [
    ["window_list", "Window list", "browser window の一覧取得。"],
    ["window_create", "Window create", "新規 window 作成候補。"],
    ["window_close", "Window close", "window close 候補。"],
    ["window_activate", "Window activate", "window activation 候補。"]
  ]),
  ...toolGroup("bookmarks", "browser", "browser_write", [
    ["bookmark_list", "Bookmark list", "bookmark の一覧取得。"],
    ["bookmark_create", "Bookmark create", "bookmark 作成候補。"],
    ["bookmark_remove", "Bookmark remove", "bookmark 削除候補。"],
    ["bookmark_update", "Bookmark update", "bookmark 更新候補。"],
    ["bookmark_move", "Bookmark move", "bookmark 移動候補。"],
    ["bookmark_search", "Bookmark search", "bookmark 検索。"],
    ["bookmark_folder_create", "Bookmark folder create", "bookmark folder 作成候補。"]
  ]),
  ...toolGroup("history", "browser", "read", [
    ["history_search", "History search", "browser history の検索。"],
    ["history_recent", "History recent", "最近の browser history 取得。"]
  ]),
  ...toolGroup("history", "browser", "destructive", [
    ["history_delete", "History delete", "browser history の個別削除候補。"],
    ["history_delete_range", "History delete range", "browser history の範囲削除候補。"]
  ]),
  ...toolGroup("tab_groups", "browser", "browser_write", [
    ["group_list", "Group list", "tab group の一覧取得。"],
    ["group_create", "Group create", "tab group 作成候補。"],
    ["group_update", "Group update", "tab group 更新候補。"],
    ["group_ungroup", "Group ungroup", "tab group 解除候補。"],
    ["group_close", "Group close", "tab group close 候補。"]
  ]),
  ...toolGroup("filesystem", "local_workspace", "read", [
    ["ls", "List files", "許可 workspace 内の file listing。"],
    ["read", "Read file", "許可 workspace 内の file read。"],
    ["find", "Find file", "許可 workspace 内の file search。"],
    ["grep", "Search text", "許可 workspace 内の text search。"]
  ]),
  ...toolGroup("filesystem", "local_workspace", "local_write", [
    ["write", "Write file", "許可 workspace 内の file write 候補。"],
    ["edit", "Edit file", "許可 workspace 内の file edit 候補。"],
    ["bash", "Run command", "許可 workspace 内の command 実行候補。"]
  ]),
  ...toolGroup("memory", "memory_store", "read", [
    ["read_core", "Read core memory", "workspace memory core の read。"],
    ["read_soul", "Read instructions", "agent instruction markdown の read。"],
    ["search_memory", "Search memory", "memory store の検索。"]
  ]),
  ...toolGroup("memory", "memory_store", "local_write", [
    ["update_core", "Update core memory", "workspace memory core の更新候補。"],
    ["update_soul", "Update instructions", "agent instruction markdown の更新候補。"],
    ["write_memory", "Write memory", "日次 memory note の保存候補。"]
  ]),
  ...toolGroup("dom", "browser", "read", [
    ["dom", "DOM inspect", "DOM tree の取得。"],
    ["dom_search", "DOM search", "DOM element の検索。"]
  ]),
  ...toolGroup("console", "browser", "read", [["get_console_messages", "Console messages", "browser console message の取得。"]]),
  ...toolGroup("browser_info", "browser", "read", [
    ["browser_info", "Browser info", "browser runtime 情報の取得。"],
    ["nudges", "Smart nudges", "現在 context に応じた提案候補の取得。"]
  ]),
  ...toolGroup("browser_info", "browser", "browser_write", [
    ["handle_dialog", "Handle dialog", "browser dialog の応答候補。"],
    ["wait_for", "Wait for", "selector、text、network 条件の待機候補。"],
    ["download", "Download", "browser download の開始または保存候補。"],
    ["export_pdf", "Export PDF", "page PDF export 候補。"],
    ["output_file", "Output file", "agent output を workspace file に保存する候補。"]
  ])
];

function toolGroup(
  category: BrowserToolCategory,
  runtimeScope: BrowserToolRuntimeScope,
  safety: BrowserToolSafety,
  entries: Array<[compatibleName: string, label: string, description: string]>
): BrowserToolSeed[] {
  return entries.map(([compatibleName, label, description]) => ({
    compatibleName,
    category,
    label,
    runtimeScope,
    safety,
    description
  }));
}

function approvalForSafety(safety: BrowserToolSafety): BrowserToolApproval {
  if (safety === "read") {
    return "not_required";
  }

  if (safety === "destructive") {
    return "blocked_by_default";
  }

  return "required";
}

function toolId(tool: BrowserToolSeed, index: number): string {
  return `oracle-browser.${tool.category}.${tool.compatibleName}.${index + 1}`;
}

export function createBrowserToolCatalog(): BrowserToolDefinition[] {
  return browserTools.map((tool, index) => ({
    ...tool,
    id: toolId(tool, index),
    approval: approvalForSafety(tool.safety)
  }));
}

export function summarizeBrowserToolCatalog(tools = createBrowserToolCatalog()): BrowserToolCatalogSummary {
  const categories = Object.keys(categoryLabels).map((category) => {
    const categoryTools = tools.filter((tool) => tool.category === category);

    return {
      category: category as BrowserToolCategory,
      total: categoryTools.length,
      reviewRequired: categoryTools.filter((tool) => tool.approval === "required").length,
      blockedByDefault: categoryTools.filter((tool) => tool.approval === "blocked_by_default").length
    };
  });

  return {
    totalTools: tools.length,
    notRequired: tools.filter((tool) => tool.approval === "not_required").length,
    reviewRequired: tools.filter((tool) => tool.approval === "required").length,
    blockedByDefault: tools.filter((tool) => tool.approval === "blocked_by_default").length,
    categories
  };
}

export function formatBrowserToolCategorySummary(summary: BrowserToolCategorySummary): string {
  const label = categoryLabels[summary.category];

  return `${label}: ${summary.total} tools / review ${summary.reviewRequired} / blocked ${summary.blockedByDefault}`;
}
