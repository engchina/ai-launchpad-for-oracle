# BrowserOS 型機能の clean-room 実装ロードマップ

## 目的

AI Launchpad for Oracle Browser Client を、Oracle enterprise AI 向けの agentic browser として拡張する。公開ドキュメントで確認できる BrowserOS 型の機能カテゴリを参考にしつつ、実装、UI、データ構造、文言、asset はこのリポジトリ内で独自に設計する。

## Clean-room ルール

- BrowserOS の source code、asset、UI 実装、内部命名、テスト、設定ファイルは使用しない。
- 参考にするのは公開ドキュメント上の機能カテゴリとユーザー体験の要件だけに限定する。
- 本プロジェクトの既定 AI provider は OCI Generative AI / Enterprise AI Project とする。
- browser action、MCP、scheduler、memory は、既存の Electron / React / local connector 構成に合わせて独自に実装する。
- destructive action、credential、外部送信、OCI Console の変更操作は、必ず human approval gate を通す。

## 機能対応表

| 領域 | 本プロジェクトでの実装方針 |
| --- | --- |
| Chat / Hub | 現在ページ、capture、screenshot、Knowledge を OCI Generative AI に渡し、引用付き回答と比較 pane を提供する。 |
| Agent | webview の観測結果から action plan を作り、承認済み browser action だけを実行する。 |
| Workflow Graph | Oracle 提案 playbook を、Observe / Plan / Approve / Act / Record の保存可能な graph に変換する。 |
| Scheduled Tasks | prompt、cadence、workspace、approval policy を local scheduler に登録し、run history を capture に残す。 |
| Memory | CORE.md と日次 Markdown に workspace facts と短期 notes を保存し、回答前に検索する。 |
| MCP / Apps | browser control と Oracle connector を別 tool catalog として公開し、権限と audit log を分離する。 |
| Cowork | 選択 workspace 配下に限定した file read/write/search/command 実行を追加する。 |
| Skills | Oracle sales / PoC / RAG / Select AI 用の Markdown skill catalog を持たせる。 |

## 第1実装切片

1. Renderer に Agentic Browser OS Layer を追加し、6つの mode を切り替え可能にする。
2. Clean-room、OCI GenAI、local-first、approval gate の状態を UI に明示する。
3. Workflow graph、MCP connector、scheduled task の設計 preview を表示する。
4. 既存の BrowserSurface、RAG Workspace、Oracle Vector dry-run と衝突しない形で段階的に接続する。

## 次の実装順

1. Agent action IPC schema と approval gate。
2. OCI Generative AI provider 設定と request/response audit。
3. Workflow JSON schema と local store。
4. Scheduler registry と run history。
5. Local memory store と memory search adapter。
6. MCP endpoint と browser tool catalog。

## 第2実装切片

1. `shared/agentActions.ts` に clean-room agent plan contract を追加する。
2. browser action を `safe`、`review`、`blocked` に分類する。
3. OCI Generative AI への context 送信、PoC artifact 生成、MCP scope、scheduler draft は approval required にする。
4. 削除、送信、購入、権限変更などの destructive action は blocked として扱う。
5. Renderer の Agentic Browser OS Layer に Agent Plan Preview を追加し、現在 workspace / playbook / URL / source type と連動させる。

## 第3実装切片

1. `shared/agentRuns.ts` に local dry-run の実行履歴 contract を追加する。
2. 未承認の `review` step は skipped、承認済み step は approved、破壊的 step は blocked として event 化する。
3. Renderer で approval 対象 step を選択し、実ブラウザ操作や OCI 送信を行わない run history preview を生成する。
4. dry-run の結果は次の切片で local capture / scheduler registry / audit log に接続する。

## 第4実装切片

1. `shared/browserToolCatalog.ts` に BrowserOS 型の browser tool surface を独自 typed catalog として定義する。
2. Navigation、Input、Observation、Screenshot、Evaluation、Pages、Windows、Bookmarks、History、Tab Groups、Filesystem、Memory、DOM、Console、Browser Info をカテゴリ化する。
3. 各 tool に `not_required`、`required`、`blocked_by_default` の approval policy を割り当てる。
4. Renderer には Tool Catalog Readiness とカテゴリ別 summary だけを表示し、実 tool 実行は次の MCP / agent loop 切片で接続する。

## 第5実装切片

1. `shared/browserToolInvocation.ts` に tool invocation draft と audit event contract を追加する。
2. catalog tool を `ready`、`waiting_approval`、`blocked`、`unknown_tool` に分類する。
3. `read` tool は dry-run executor に渡せる候補、browser / local write は approval required、destructive / unknown は blocked とする。
4. Renderer では代表的な invocation preview を表示し、次の切片で local executor と MCP endpoint に接続する。

## 第6実装切片

1. `shared/browserToolExecutor.ts` に read-only dry-run executor contract を追加する。
2. `ready` tool は completed、`waiting_approval` は停止、`blocked` / `unknown_tool` は blocked audit として扱う。
3. 承認済み write tool もこの段階では実操作せず、dry-run event のみ生成する。
4. Renderer で Catalog、Invocation、Executor の3段階 preview を並べ、次の切片で MCP endpoint / local connector に接続する。

## 第7実装切片

1. `shared/browserMcpProtocol.ts` に MCP-like request / response contract を追加する。
2. `tools/list` は独自 catalog descriptor と summary を返す。
3. `tools/call` は invocation draft と read-only dry-run executor を通し、audit event を返す。
4. unknown method と invalid params を error response として固定する。
5. Renderer で `MCP Protocol Preview` を表示し、次の切片で local connector または HTTP/SSE endpoint に接続する。

## 第8実装切片

1. `main/localConnectorBrowserMcp.ts` に Local Connector 用の Browser MCP bridge を追加する。
2. `tools/list` / `tools/call` の response を Local Connector summary と一緒に返す。
3. approval-gated tool は Local Connector 経由でも `waiting_approval` のまま保持する。
4. `localConnector.browserMcpRequest` を preload API と IPC handler に公開する。
5. 次の切片では HTTP/SSE endpoint、外部 MCP client、または renderer の live connector preview に接続する。

## 第9実装切片

1. `main/localConnectorBrowserMcpHttp.ts` に Browser MCP HTTP transport skeleton を追加する。
2. `GET /health` は local connector bridge と endpoint path を返す。
3. `POST /mcp` は JSON body の Browser MCP request を Local Connector bridge に渡す。
4. invalid JSON、invalid request、method mismatch、payload too large、unknown path は HTTP error として固定する。
5. HTTP server factory は自動起動せず、次の切片で user opt-in の local endpoint 設定または SSE stream に接続する。

## 第10実装切片

1. `main/browserMcpHttpEndpointController.ts` に Browser MCP HTTP endpoint lifecycle controller を追加する。
2. endpoint は user opt-in の `start` まで起動せず、host は `127.0.0.1` に固定する。
3. `status` / `start` / `stop` を IPC と preload API に公開する。
4. default port は `9239` とし、test では ephemeral port `0` を許可する。
5. 次の切片では Renderer の MCP settings / live preview から endpoint URL を表示し、外部 MCP client 接続手順に接続する。

## 第11実装切片

1. `shared/browserMcpEndpointCommands.ts` に external MCP client command formatter を追加する。
2. Renderer の Agentic Browser OS Layer に `MCP Endpoint Settings` panel を追加する。
3. panel は endpoint state、URL、health URL、start / stop、copy action、Codex / Claude Code / Gemini CLI / OpenClaw command を表示する。
4. Electron preload がない renderer preview では endpoint 操作を disabled とし、実際の listen は行わない。
5. 次の切片では running endpoint への live ping と SSE stream preview を追加する。

## 第12実装切片

1. `main/localConnectorBrowserMcpHttp.ts` に `GET /sse` の SSE status preview を追加する。
2. endpoint config / state に `streamPath` と `streamUrl` を追加する。
3. HTTP controller は `streamPath` を server factory に渡し、running state で SSE URL を返す。
4. Renderer の `MCP Endpoint Settings` panel に live probe と SSE preview 表示を追加する。
5. 次の切片では MCP client 接続 session / request log を local audit store に保存する。

## 第13実装切片

1. `main/localBrowserMcpAuditStore.ts` に Browser MCP endpoint 専用の local audit store を追加する。
2. endpoint start / stop、health check、SSE preview、`tools/list` / `tools/call` を audit event として保存する。
3. audit event には session、HTTP path、MCP method、request id、workspace、tool、execution status を含める。
4. Electron preload API から audit event の list / clear を呼び出せるようにする。
5. Renderer の `MCP Endpoint Settings` panel に最新 audit log を表示し、Refresh / Clear 操作を追加する。
6. 次の切片では audit event を agent run history と接続し、承認待ち tool call から UI approval queue に遷移できるようにする。

## 第14実装切片

1. `shared/browserMcpApprovalQueue.ts` に audit event から approval queue item を生成する pure contract を追加する。
2. `waiting_approval` の `mcp_request` だけを queue 化し、method、tool、request、workspace、session を保持する。
3. queue item から `BrowserAgentRun` preview を生成し、承認前は `needs_approval`、承認 preview 後は `completed` として表示する。
4. Renderer の `MCP Endpoint Settings` panel に `Approval Queue` section を追加し、Approve preview / Undo preview / Run history を操作できるようにする。
5. 次の切片では approval queue の選択結果を永続化し、実行前 confirmation と policy reason を別 panel に分離する。

## 第15実装切片

1. `shared/browserMcpApprovalDecision.ts` に approval decision と実行前 confirmation の pure contract を追加する。
2. approval queue の選択結果は `approved_preview` / `revoked_preview` として audit event とは別の local store に保存する。
3. `main/localBrowserMcpApprovalStore.ts` を追加し、最新 decision を audit event id 単位で upsert する。
4. Electron preload API から approval decision の list / save / clear を呼び出せるようにする。
5. Renderer の `MCP Endpoint Settings` panel に `Execution Confirmation` section を追加し、policy reason、最終確認、保存済み decision、run history preview を分離して表示する。
6. 次の切片では保存済み approval decision を endpoint の tools/call response に接続し、承認済み request だけを guarded executor に渡す。

## 第16実装切片

1. `shared/browserMcpProtocol.ts` に approval decision context を追加し、`tools/call` の request id、workspace、method、tool が保存済み decision と一致するか判定する。
2. `approved_preview` の decision がある request だけを `approved` invocation として guarded dry-run executor に渡す。
3. `revoked_preview` または decision なしの request は従来どおり `waiting_approval` のまま停止する。
4. `main/localConnectorBrowserMcpHttp.ts` は route / server options から approval decisions を受け取り、audit event に approval decision id / status を残す。
5. `main/browserMcpHttpEndpointController.ts` は endpoint 処理時に local approval store を読み込み、外部 MCP client からの再試行 request に接続する。
6. Renderer の `MCP Endpoint Settings` panel に `Guarded Execution` section を追加し、承認済み request が dry-run executor に到達したことを audit log から確認できるようにする。
7. 次の切片では guarded dry-run executor の結果を scheduler / workflow run history と同じ履歴 contract に統合する。

## 第17実装切片

1. `shared/browserMcpRunHistory.ts` に MCP audit event を `BrowserAgentRun` 互換の履歴 entry に変換する pure contract を追加する。
2. `waiting_approval` は `approval_gate`、承認済み dry-run 完了は `recorded`、error / blocked は `blocked` run として正規化する。
3. 保存済み approval decision は audit event id 単位で最新 decision を参照し、preview history 側の status 判定に使う。
4. scheduler へはまだ登録せず、`manual_preview_only` policy として workflow / scheduler が後続切片で同じ履歴 shape を読める状態にする。
5. Renderer の `MCP Endpoint Settings` panel に `MCP Run History` section を追加し、audit log、approval decision、guarded executor result の接続結果を compact に確認できるようにする。
6. 次の切片ではこの履歴 contract を local scheduler registry の dry-run plan と接続する。

## 第18実装切片

1. `shared/browserSchedulerRegistry.ts` に scheduled task draft、cadence、approval policy、run history cap の pure contract を追加する。
2. cadence は daily / hourly / minutes を扱い、次回実行時刻は preview として計算する。
3. MCP run history から scheduler task draft を生成し、`recorded` / completed の履歴だけを `ready` として扱う。
4. `needs_approval` と `blocked` の履歴は自動実行せず、scheduler registry では disabled preview として残す。
5. run history は BrowserOS の公開仕様に合わせて task あたり最大 15 件に丸めるが、実装は独自 contract として保持する。
6. Renderer の `MCP Endpoint Settings` panel に `Scheduler Registry Draft` section を追加し、ready / approval / blocked の状態、cadence、next run、履歴件数を確認できるようにする。
7. 次の切片では schedule draft を local store に保存し、conversation から schedule card を提案する UI に接続する。

## 第19実装切片

1. `main/localBrowserSchedulerStore.ts` に schedule task draft の local JSON store を追加する。
2. store は task id と source run history id の両方で重複を避け、最新 draft を先頭に保存する。
3. Electron preload API に `schedulerRegistry.listTasks` / `saveTask` / `clearTasks` を追加し、renderer から保存済み task draft を参照できるようにする。
4. Renderer の `Scheduler Registry Draft` section に `Save ready` / `Clear saved` を追加し、ready task だけを local store に保存できるようにする。
5. 保存は schedule draft のみであり、hidden browser window、alarm、OCI 呼び出し、外部 MCP 実行は開始しない。
6. 次の切片では conversation から schedule card を提案し、保存済み draft の詳細確認 view に接続する。

## 第20実装切片

1. `shared/browserSchedulerRegistry.ts` に conversation 由来の schedule suggestion card と saved task detail の pure contract を追加する。
2. suggestion card は ready task だけを `Review and save` 可能にし、approval / blocked / disabled draft は review-only として理由を表示する。
3. saved task detail は local scheduler store に保存された draft の workspace、cadence、status、policy、run history 件数、最新 run summary を表示する。
4. Renderer の `Scheduler Registry Draft` section に `Schedule Suggestion Card` と `Saved Task Detail` を追加する。
5. この切片では alarm、hidden browser window、OCI 呼び出し、外部 MCP 実行、cloud sync は開始しない。
6. 次の切片では schedule card の editable fields と enable / disable 操作を local store に接続する。

## 第21実装切片

1. `shared/browserSchedulerRegistry.ts` に schedule card edit draft、edit apply、enable / disable toggle の pure contract を追加する。
2. edit draft は task name、prompt、cadence、enabled を保持し、ready / disabled draft だけを有効化可能にする。
3. approval / blocked draft は編集 preview を表示しても enable できず、保存時にも status と next run を変更しない。
4. Renderer の `Schedule Suggestion Card` 配下に `Editable Schedule Draft` form を追加し、name、prompt、schedule type、daily time または interval、enabled を調整できるようにする。
5. `Save edited draft` は Electron IPC がある場合だけ local scheduler store に保存し、alarm、hidden browser window、OCI 呼び出し、外部 MCP 実行は開始しない。
6. 次の切片では Scheduled Tasks page 相当の list / detail 操作を独立 panel として切り出す。

## 第22実装切片

1. `shared/browserSchedulerRegistry.ts` に Scheduled Tasks page 相当の list / detail preview contract を追加する。
2. task count、enabled / disabled / review / blocked の集計、選択 task、preview action、run history を UI から参照できる形に正規化する。
3. Renderer の `MCP Endpoint Settings` panel に `Scheduled Tasks Manager` を追加し、task list から detail を切り替えられるようにする。
4. `Test preview` / `Retry preview` / `Cancel preview` は availability の表示だけに限定し、alarm、hidden browser window、OCI 呼び出し、外部 MCP 実行は開始しない。
5. 保存済み task がある場合は saved store を優先し、未保存時は scheduler draft を読み取り専用の manager preview として表示する。
6. 次の切片では manual test preview を guarded dry-run と接続する前提で、実行前 confirmation と policy reason の contract を分離する。

## 第23実装切片

1. `shared/browserSchedulerRegistry.ts` に manual test / retry 用の `BrowserScheduledTaskManualRunConfirmation` contract を追加する。
2. `test_preview` は enabled ready task、`retry_preview` は blocked run、`cancel_preview` は running task 未実装のため not applicable として policy reason を分離する。
3. confirmation は timeout、expected run status、guardrails、dry-run steps を保持し、次の guarded dry-run 接続前に UI から確認できる形にする。
4. Renderer の `Scheduled Tasks Manager` に `Manual Run Confirmation` section を追加し、preview action の選択に応じて policy reason と steps を切り替える。
5. この切片では confirmation の作成だけを行い、alarm、hidden browser window、OCI 呼び出し、外部 MCP 実行、run history 追記は開始しない。
6. 次の切片では confirmation を `BrowserAgentRun` dry-run preview に変換し、手動 test / retry の履歴候補を生成する。

## 第24実装切片

1. `shared/browserSchedulerRegistry.ts` に `BrowserScheduledTaskDryRunHistoryCandidate` contract を追加する。
2. manual run confirmation から `BrowserAgentRun` 互換の dry-run preview を生成し、step、event、status、history append 可否を保持する。
3. `ready_to_preview` は `needs_approval` の run candidate、`not_applicable` / blocked policy は blocked candidate として扱う。
4. Renderer の `Scheduled Tasks Manager` に `Dry-run History Candidate` section を追加し、run id、status、event count、step status、notes を表示する。
5. この切片では run candidate の表示だけを行い、scheduler store、alarm、hidden browser window、OCI 呼び出し、external MCP、run history 永続化は更新しない。
6. 次の切片では dry-run candidate をユーザー操作で local run history preview に反映する一時 state を追加する。

## 第25実装切片

1. `shared/browserSchedulerRegistry.ts` に dry-run history candidate を scheduled task list へ一時反映する pure contract を追加する。
2. `canAppendToHistory` が true の candidate だけを対象 task の先頭 run history preview に追加し、既存の最大15件 cap を維持する。
3. blocked / not applicable candidate、対象 task 不在、同一 run id の重複追加は state を変更せず reason を返す。
4. Renderer の `Scheduled Tasks Manager` に `Add to local preview` / `Clear preview` を追加し、preview message と `local preview active` state を表示する。
5. この切片では React state だけを更新し、local scheduler store、alarm、hidden browser window、OCI 呼び出し、external MCP、cloud sync、永続 run history は更新しない。
6. 次の切片では local preview と保存済み scheduler draft の差分表示、または task history detail の full output preview に進む。

## 第26実装切片

1. `shared/browserSchedulerRegistry.ts` に scheduled task run の output preview contract を追加する。
2. 選択 run から tool usage、finding event、metadata、plain text output を生成し、latest run と指定 run の両方を選べるようにする。
3. Renderer の `Scheduled Tasks Manager` で run history item を clickable にし、選択 run を `Run Output Preview` に展開する。
4. `Run Output Preview` は tools used、findings、raw output text を表示するが、scheduler store、alarm、hidden browser window、OCI 呼び出し、external MCP、永続 run history は更新しない。
5. 次の切片では selected run output を export / capture preview へ接続するか、scheduled task detail の filter / search を追加する。

## 第27実装切片

1. `shared/browserSchedulerRegistry.ts` に scheduled task run output から Markdown capture 候補を生成する preview contract を追加する。
2. capture preview は summary、tools used、findings、raw output を Markdown にまとめ、metadata と preview-only warning を保持する。
3. Renderer の `Scheduled Tasks Manager` に `Capture / Export Preview` section を追加し、Markdown preview と copy action を表示する。
4. `Save capture` は未接続の disabled state とし、local capture store、scheduler store、alarm、hidden browser window、OCI 呼び出し、external MCP、cloud sync は更新しない。
5. 次の切片では capture preview を renderer の既存 capture list へ保存する前の confirmation、または scheduled task detail の filter / search を追加する。

## 第28実装切片

1. `shared/browserSchedulerRegistry.ts` に scheduled task run capture の保存前 confirmation contract を追加する。
2. Markdown capture 候補から proposed capture record、確認 checklist、metadata、preview-only policy reason を生成する。
3. Renderer の `Scheduled Tasks Manager` に `Capture Save Confirmation` section を追加し、`Confirm preview only` と disabled の `Persist later` を表示する。
4. confirmation 操作は renderer state の message だけを更新し、local capture store、scheduler store、alarm、hidden browser window、OCI 呼び出し、external MCP、cloud sync は更新しない。
5. 次の切片では confirmation 済み capture を local capture store へ保存する contract、または scheduled task detail の filter / search を追加する。

## 第29実装切片

1. `shared/browserSchedulerRegistry.ts` に confirmed scheduled task capture を local capture store 用の selection payload へ変換する contract を追加する。
2. payload は既存の `saveSelection` schema を使い、Markdown run output を `selectedText` として保存できる形にする。
3. Renderer の `Capture Save Confirmation` section で `Confirm preview only` 後に `Save to local captures` を有効化する。
4. Electron API がある場合は `browserApi.saveSelection` へ接続し、renderer preview では同形状の capture record を local state に追加する。
5. 保存後は right sidebar の `Captures` list に反映するが、scheduler store、alarm、hidden browser window、OCI GenAI、external MCP、cloud sync は更新しない。
6. 次の切片では saved capture を knowledge chunk へ追加する導線、または scheduled task detail の filter / search を追加する。

## 第30実装切片

1. `shared/browserSchedulerRegistry.ts` に保存済み scheduled task capture を knowledge preview へ渡す handoff contract を追加する。
2. handoff は local capture store に保存済みの capture id だけを対象にし、保存前 capture は knowledge に追加しない。
3. Renderer の `Capture Save Confirmation` section に `Add to knowledge` を追加し、`Saved to captures` 後だけ有効化する。
4. 追加後は既存の renderer knowledge pipeline が chunk preview を生成し、右 sidebar の `Knowledge` count に反映する。
5. この操作では Oracle Vector Search、OCI GenAI、external MCP、scheduler store、alarm、hidden browser window、cloud sync は起動しない。
6. 次の切片では scheduled task detail の filter / search、または knowledge chunk から run output へ戻る traceability を追加する。

## 第31実装切片

1. `shared/browserSchedulerRegistry.ts` に scheduled task run output を New Tab 相当の result card へ変換する preview contract を追加する。
2. result card は summary、tools count、findings count、local-only sync scope、run history への参照を保持する。
3. Renderer の `Scheduled Tasks Manager` に `New Tab Result Preview` section を追加し、run history から選択された結果を compact card として表示する。
4. `Open full output` は既存 run output preview へ接続し、capture / knowledge の状態は同 section の action badge として同期する。
5. run output は端末 local preview に限定し、schedule setup の cloud sync、scheduler store、alarm、hidden browser window、OCI GenAI、external MCP は起動しない。
6. 次の切片では New Tab results の filter / search、または result card から capture / knowledge 操作への直接導線を追加する。

## 第32実装切片

1. Renderer の `New Tab Result Preview` card にある `Capture result` / `Add to knowledge` を既存の capture confirmation / knowledge handoff flow に接続する。
2. `Capture result` は card から保存前確認を開始し、下部の `Capture Save Confirmation` で local capture store への保存を続行できる状態にする。
3. `Add to knowledge` は capture が local captures に保存済みの場合だけ有効化し、保存前の run output は knowledge preview に渡さない。
4. `Open full output` は従来どおり run output detail を選択し、3つの action は同じ result card 上で状態 label と disabled state を同期する。
5. この切片では renderer の既存 flow 接続だけを行い、scheduler store、alarm、hidden browser window、OCI GenAI、external MCP、cloud sync は起動しない。
6. 次の切片では New Tab results の filter / search、または result card からの direct save confirmation を追加する。

## 第33実装切片

1. `shared/browserSchedulerRegistry.ts` に New Tab result card の local filter preview contract を追加する。
2. filter は title、summary、metadata、highlights、actions、run id を対象にし、run output を外部送信せず renderer 内の local-only preview として判定する。
3. Renderer の `New Tab Result Preview` に常時見える search input、clear button、match count、matched field chips、empty state を追加する。
4. React 側は `useDeferredValue` で入力反映を遅延し、検索 UI の hover / disabled / focus state を既存の compact card 表現に合わせる。
5. この切片では検索表示だけを行い、scheduler store、alarm、hidden browser window、OCI GenAI、external MCP、cloud sync、永続 run history は更新しない。
6. 次の切片では filtered result から run output detail への traceability、または result card からの direct save confirmation を追加する。

## 第34実装切片

1. `shared/browserSchedulerRegistry.ts` に New Tab result から run history / full output / capture / knowledge へ戻る local trace preview contract を追加する。
2. trace node は `current`、`available`、`completed`、`locked` の状態を持ち、capture / knowledge の保存状態と同期する。
3. Renderer の `New Tab Result Preview` card に `Local result trace` strip を追加し、New Tab result、Run history、Full output、Capture、Knowledge の5段階を compact に表示する。
4. `Full output`、未保存の `Capture`、保存後の `Knowledge` node は既存 action flow に接続し、disabled / completed node は状態表示だけに限定する。
5. この切片では trace 表示と既存 renderer action の再利用だけを行い、scheduler store、alarm、hidden browser window、OCI GenAI、external MCP、cloud sync は起動しない。
6. 次の切片では trace node から detail section を focus する UI、または result card からの direct save confirmation を追加する。

## 第35実装切片

1. `shared/browserSchedulerRegistry.ts` に New Tab 用の recent results stack preview contract を追加する。
2. stack は選択 task の local run history から最大5件を表示し、BrowserOS 公開仕様の last 15 runs のうち New Tab で扱う compact subset として表現する。
3. Renderer の `New Tab Result Preview` に `Recent New Tab results` strip を追加し、latest / previous run を stable run id で切り替えられるようにする。
4. 選択中の run は disabled state、他の run は hover / focus 可能な button とし、status、position、steps、events を compact metadata で表示する。
5. この切片では既存 local run history preview の読み取りと選択だけを行い、scheduler store、alarm、hidden browser window、OCI GenAI、external MCP、cloud sync、永続 run history は更新しない。
6. 次の切片では recent results から failed / blocked retry preview への導線、または result card の direct save confirmation を追加する。

## 第36実装切片

1. 公開ドキュメントで確認できる `Chat & Hub` の side chat、provider switch、page context copy、screenshot attach、multi-pane comparison を clean-room preview として整理する。
2. `shared/browserChatHub.ts` に Chat panel / Hub comparison の独自 contract を追加し、既定 provider は `OCI GenAI Project` に固定する。
3. Renderer の Chat tab に `Chat & Hub Preview` を追加し、provider segmented control、toolbar actions、context source summary、1/2/3 pane selector を表示する。
4. `Oracle Vector Grounding` と `Local Keyword Baseline` は比較 lane として扱い、BrowserOS 側の外部 provider 実装や名称体系は使用しない。
5. screenshot attach と reset は local preview state のみを変更し、実 screenshot 取得、外部 provider 起動、OCI 送信は行わない。
6. secret、wallet、private key は prompt context から除外する guardrail を UI に表示する。

## 第37実装切片

1. 公開ドキュメントで確認できる `Vertical Tabs` の左側 tab rail、full title row、collapse、tab group を clean-room preview として整理する。
2. `shared/browserVerticalTabs.ts` に tab / group / rail state の独自 contract を追加し、current page、Oracle Docs、OCI Console、LiveLabs、GitHub sample を workspace 用に構成する。
3. Renderer の Browser Surface 左側に `Vertical Tabs` rail を追加し、active tab、captured tab、pinned tab、group collapse、rail icon-only toggle を表示する。
4. tab row の click は renderer preview の URL / title を切り替えるだけにし、実 Chromium tab strip、drag reorder、context menu、pin/mute/close 操作はまだ実行しない。
5. captured 状態は local capture URL との照合だけで判定し、cloud sync、browser history、bookmark、external MCP、OCI GenAI 送信は更新しない。
6. UI は semantic `button` / `nav` / `aria-current` / `aria-expanded` を使い、compact でも title tooltip を保持する。

## 第38実装切片

1. 公開ドキュメントで確認できる `Memory` の two-tier memory、local Markdown、recall before answer、forget / promote review を clean-room preview として整理する。
2. `shared/browserMemory.ts` に CORE / daily note / recall / review action の独自 contract を追加し、Oracle workspace 向けの memory 候補を生成する。
3. Renderer の Memory tab に `Local Memory Preview` を追加し、CORE.md、daily note、recall search、review actions、guardrails を表示する。
4. search input は `useDeferredValue` による delayed query で local recall matches だけを絞り込み、実ファイル検索、OCI GenAI 送信、cloud sync は行わない。
5. CORE は permanent facts、daily note は 30 日 expire の session notes として表示し、promote / forget は review-only button に限定する。
6. secret、wallet、private key、token は memory 候補に保存しない guardrail を明示する。

## 第39実装切片

1. 公開ドキュメントで確認できる `Smart Nudges` の app connection card、schedule suggestion、local declined state、Chat / scheduled background run での非表示条件を clean-room preview として整理する。
2. `shared/browserSmartNudges.ts` に nudge card、actions、suppressed reasons、local state key の独自 contract を追加し、Oracle workspace の follow-up / readiness task から候補を生成する。
3. Renderer の Agentic Control Panel に `Smart Nudges Preview` を追加し、Connect / Do manually、Schedule task / Maybe later の preview-only action と guardrails を表示する。
4. UI は `ui-ux-pro-max` の React / accessibility guidance に合わせ、明示的な action title、focus ring、local-only notice、安定した compact card layout を維持する。
5. `test:knowledge` に Smart Nudges contract tests を追加し、app connection、declined app suppression、schedule suggestion、Chat mode suppression、scheduled background suppression を検証する。

## 第40実装切片

1. 公開ドキュメントで確認できる `SOUL.md` の local Markdown、会話前 read、assistant personality / tone / boundaries、Memory との分離、150 lines limit を clean-room preview として整理する。
2. `shared/browserSoul.ts` に section、rewrite preview、actions、guardrails、line budget の独自 contract を追加し、Oracle workspace 向けの assistant behavior 候補を生成する。
3. Renderer の Memory mode に `Agent Soul Preview` を追加し、SOUL.md path、section viewer、instruction draft、rewrite target、review-only actions を表示する。
4. `ui-ux-pro-max` の accessibility guidance に合わせ、textarea label、aria-live summary、visible focus ring、single-column compact card layout を維持する。
5. `test:knowledge` に SOUL contract tests を追加し、local path、Memory separation、boundary classification、provider preference classification、empty instruction disabled state を検証する。

## 第41実装切片

1. 公開ドキュメントで確認できる `Connect Apps` の MCP / OAuth 接続、conversation 内 connection card、sidebar からの事前接続、manual browser fallback、local credential boundary を clean-room preview として整理する。
2. `shared/browserAppConnectors.ts` に connector、scope decision、status、actions、guardrails の独自 contract を追加し、OCI GenAI Project を既定 provider として固定する。
3. Renderer の MCP / Apps mode に `Connect Apps Preview` を追加し、recommended connectors、status stats、scope review、Connect / Do manually action、manual fallback を表示する。
4. UI は `ui-ux-pro-max` の enterprise / accessibility guidance に合わせ、visible focus ring、aria label、compact app cards、credential 非表示 notice を維持する。
5. `test:knowledge` に Connect Apps contract tests を追加し、OCI GenAI default、business app auth required、manual fallback、blocked connector、status stats を検証する。

## 第42実装切片

1. ユーザー提供 screenshot の可観測 layout を元に、BrowserOS-like な左 tab rail、上部 browser toolbar、onboarding hero、orange brand accent を clean-room UI として整理する。
2. `AppShell` の初期画面を `chrome://ai-launchpad/onboarding` 相当の onboarding preview に変更し、既存 Oracle Browser Client workspace は `Get Started` / `Assistant` から開けるように保持する。
3. 左 rail は Browser tab 風の compact list、active state、close affordance、new tab button を表示し、実 Chromium tab 操作や BrowserOS source / asset は使用しない。
4. 上部 toolbar は back / forward / reload / home、URL pill、workspace selector、Chat / Council / Assistant actions を表示し、keyboard focus ring と aria label を維持する。
5. hero は AI Launchpad brand、agentic browser badge、primary CTA、docs / GitHub link、footer を表示し、BrowserOS の logo、copy、source code、asset は使用しない。

## 第43実装切片

1. ユーザー提供 screenshot の browser chrome にさらに近づけるため、左 tab rail を system / active / assistant / recent の visual group に分ける。
2. tab row は favicon 風 icon tile、active state、close affordance、title tooltip を持つ semantic button とし、実 Chromium tab 操作は行わない。
3. 上部 toolbar は search / bookmark / Chat / Council / Assistant / profile / more の compact action cluster を追加し、icon-only button には aria-label を付ける。
4. address bar の submit は内蔵 icon button に寄せ、onboarding 中は workspace selector を隠して BrowserOS 参考 screenshot に近い chrome 密度へ調整する。
5. onboarding hero は中央 fade grid、78px headline、orange CTA、white secondary CTA に調整し、BrowserOS logo / source / asset は使わず AI Launchpad brand として表現する。
6. `ui-ux-pro-max` の accessibility guidance に合わせ、focus ring、hover state、semantic nav、readable contrast を維持する。

## 第44実装切片

1. 参考 screenshot の browser chrome 高さに近づけるため、top toolbar と left rail header を 64px rhythm に揃える。
2. onboarding header は 80px に保ち、64px chrome と組み合わせて logo / nav の縦位置を screenshot の first viewport density に寄せる。
3. onboarding hero body は 32px 上へ補正し、badge、headline、CTA の中心位置を BrowserOS 参考 screenshot に近づける。
4. footer は bottom padding を増やして、参考 screenshot のように画面下端から少し浮いた位置で見えるようにする。
5. left rail 下部の new tab button は浅い pill + shadow に調整し、rail 内の tab affordance と同じ keyboard focus 方針を維持する。
6. BrowserOS の source、asset、UI 実装は使わず、AI Launchpad / OCI GenAI 前提の clean-room 表現として継続する。

## 第45実装切片

1. left rail の sidebar button を実際の collapse / expand control にし、BrowserOS 風の icon-only rail を clean-room で実装する。
2. search tabs button は tab search panel を開閉し、入力 query に応じて system / active / assistant / recent の tab rows を filter する。
3. tab search には可視 label、match count、no-results hint を持たせ、`ui-ux-pro-max` の ARIA label / input label / no-results guidance を満たす。
4. collapsed rail では favicon 風 icon tile だけを表示し、title tooltip と keyboard focus ring で操作性を維持する。
5. grid view button は onboarding route に戻る軽い navigation として扱い、実 Chromium tab strip や BrowserOS 実装には依存しない。

## 第46実装切片

1. top toolbar の `Chat` / `Council` / `Assistant` を Agentic Control Panel の mode selection と同期する。
2. `Chat` は Chat & Hub preview、`Council` は Workflow mode、`Assistant` は Agent mode に対応させ、クリック時は onboarding から workspace route へ遷移する。
3. Agentic Control Panel は optional controlled mode props を受け取り、内部 tab 操作と top toolbar 操作が同じ state を更新する。
4. active toolbar action は `aria-pressed` と focus ring を持つ semantic button とし、compact browser chrome 上でも現在の AI mode が分かる状態にする。
5. この切片では UI state wiring だけを行い、外部 provider 実行、OCI GenAI 送信、BrowserOS source / asset / implementation reuse は行わない。

## 第47実装切片

1. 右側の旧 `AI Sidebar` を BrowserOS-like な assistant rail として再構成し、top chrome と同じ `Chat` / `Council` / `Assistant` mode state を表示する。
2. assistant rail 上部に mode segmented control、local execution badge、active mode summary、OCI GenAI Project / secret exclusion chips を追加する。
3. `Ask this page` composer は controlled textarea とし、`Run preview` は既存 `askPage` preview flow に接続して現在 page title / URL / workspace context を使う。
4. current page context、playbook selector、既存 quick actions、capture / knowledge / PoC panels は保持しつつ、border、background、spacing を browser chrome の compact density に寄せる。
5. この切片では renderer-local preview の UX 接続だけを行い、外部 provider 実行、BrowserOS source / asset / implementation reuse は行わない。

## 第48実装切片

1. left browser tab rail の `Chat` / `Council` / `Assistant` rows を static tab から assistant mode entrypoint に変更する。
2. `Chat` は Chat mode、`Council` は Workflow mode、`Assistant` は Agent mode を選択し、クリック時に workspace route へ移動する。
3. route tab と assistant mode tab の active 判定を分離し、mode tab は `aria-pressed`、route tab は `aria-current` で現在状態を表現する。
4. collapsed rail でも同じ mode selection を維持し、title tooltip、focus ring、icon-only affordance を保持する。
5. この切片では renderer UI state wiring だけを行い、実 Chromium tab 操作、外部 provider 実行、BrowserOS source / asset / implementation reuse は行わない。

## 第49実装切片

1. left browser tab rail の Cloud / Docs / GitHub / Models / 日本語 Docs rows を static label から page navigation target に変更する。
2. page target row は現在 URL と照合して `aria-current` と active style を表示し、クリック時に Browser Surface の URL / title / route を同期する。
3. `Run history preview` は Scheduled Tasks mode entrypoint とし、assistant mode selection と同じ state wiring を使う。
4. tab search は label / id だけでなく target title / URL も検索対象に含め、page tab と mode tab の発見性を上げる。
5. この切片では renderer UI state wiring だけを行い、実 Chromium tab strip、外部 provider 実行、BrowserOS source / asset / implementation reuse は行わない。

## 第50実装切片

1. left browser tab rail の close affordance を装飾 icon から独立した semantic close button に変更する。
2. closeable な onboarding / docs / GitHub / Models / 日本語 Docs rows は renderer-local state で非表示にし、active tab を閉じた場合は default Oracle Docs workspace に戻す。
3. `New workspace tab` は default Oracle Docs workspace を開き、閉じた preview tab rows を再表示する lightweight restore action とする。
4. page target tab が active の場合は workspace route row の active state を抑制し、BrowserOS 風 rail で active row が重複しないようにする。
5. tab open / close / restore の状態変更は `aria-live` で通知し、React accessibility guidance の dynamic content announcement を満たす。
6. この切片では renderer-local tab lifecycle preview だけを扱い、実 Chromium tab close / history mutation / BrowserOS source / asset / implementation reuse は行わない。

## 第51実装切片

1. left browser tab rail に renderer-local `activeTabId` と dynamic local tab list を追加し、固定 row の表示切替から browser tab model に近い状態管理へ進める。
2. `New workspace tab` は `local-tab-*` を active section に追加し、default Oracle Docs URL / title を持つ closeable tab として表示する。
3. closeable tab を閉じた場合、active tab であれば隣接する次 tab、なければ前 tab、さらに fallback として workspace tab へ切り替える。
4. top toolbar の Chat / Council / Assistant と onboarding CTA は同じ tab selection handler を使い、rail の active state と workspace route を同期する。
5. 同一 URL を持つ local tab と fixed page tab が重複 active にならないよう、active tab id を優先して page target active row を決定する。
6. この切片では renderer-local tab lifecycle のみを扱い、実 Chromium tab creation / close、BrowserOS source / asset / implementation reuse は行わない。

## 第52実装切片

1. left browser tab rail の lifecycle logic を `shared/browserRailTabs.ts` の clean-room contract に抽出し、React component から状態計算を分離する。
2. local tab insertion は active section の workspace tab 直後に固定し、BrowserOS 風の vertical tab ordering に近い preview behavior として保持する。
3. close fallback は visible tabs だけを対象に、次 tab、前 tab、workspace fallback の順で決定する pure function にする。
4. 同一 URL を持つ fixed page tab と local tab は active tab id を優先して page-active row を決め、重複 active 表示を防ぐ。
5. `test:knowledge` に rail lifecycle tests を追加し、local insertion、close fallback、closed tab 除外、active page 優先、URL normalize、local tab draft を検証する。
6. この切片では clean-room contract / renderer wiring のみを扱い、実 Chromium tab lifecycle、BrowserOS source / asset / implementation reuse は行わない。

## 第53実装切片

1. 公開ドキュメントで確認できる Chat / Hub toolbar shortcut を clean-room shortcut contract として整理する。
2. `Option/Alt+K` は Chat panel entrypoint、`Option/Alt+L` は Chat provider cycle、`Cmd/Ctrl+Shift+U` は Council / Hub entrypoint として扱う。
3. shortcut 判定は `shared/browserShortcuts.ts` に分離し、input / textarea / contenteditable / repeated keydown では発火しないようにする。
4. Chat provider state は `AppShell` から `AgenticControlPanel` に controlled prop として渡し、toolbar shortcut と panel provider button が同じ provider state を更新する。
5. toolbar action は `aria-keyshortcuts` と title hint を持たせ、compact chrome layout を崩さず keyboard discoverability を上げる。
6. この切片では renderer-local shortcut / provider selection のみを扱い、BrowserOS source / asset / implementation reuse、外部 provider 実行、実 browser permission 変更は行わない。

## 第54実装切片

1. 公開 README で確認できる `apps/agent` の side panel chat 構成を clean-room UI state として整理する。
2. `shared/browserAssistantPanel.ts` に side panel open / close / mode selection / workspace-only rendering の contract を追加する。
3. toolbar、left rail、shortcut から Chat / Council / Assistant を開くと、右側 Assistant side panel が表示されるようにする。
4. side panel header に semantic close button を追加し、閉じた後は main workspace を full-width 表示に戻す。
5. Assistant panel 内の mode segmented control と `AgenticControlPanel` は同じ active mode state を使い、閉じても最後の mode を保持する。
6. この切片では renderer-local side panel lifecycle のみを扱い、BrowserOS source / asset / implementation reuse、実 browser side panel API、外部 provider 実行は行わない。

## 第55実装切片

1. top chrome 右側の `Profile` / `More` icon を BrowserOS-like な account / browser menu entrypoint として clean-room 実装する。
2. `shared/browserTopMenu.ts` に profile / more panel の open、toggle、close reason、aria title を扱う pure state contract を追加する。
3. `Profile` menu は project workspace、Chat provider、Local Connector diagnostics へ接続し、OCI GenAI Enterprise AI project 前提の状態確認を compact に表示する。
4. `More` menu は page save、screenshot save、selection explain、tab search、clean-room roadmap の既存 preview action へ接続する。
5. menu は outside click / Escape / close button で閉じ、`aria-expanded`、`aria-controls`、`role="menu"` / `role="menuitem"` を使って compact browser chrome 上の keyboard 操作性を保つ。
6. この切片では renderer-local top menu lifecycle のみを扱い、BrowserOS source / asset / implementation reuse、実 browser profile API、外部 provider 実行は行わない。

## 第56実装切片

1. BrowserOS の公開 README で確認できる bookmarks / side-panel browser tool surface を参考に、top chrome の `Search page` / `Bookmark` icon を clean-room page tools として実装する。
2. `shared/browserPageTools.ts` に page search / bookmark panel の open、query、bookmark URL normalize、search preview matching を扱う pure state contract を追加する。
3. `Search page` panel は現在ページ title / URL、summary、selection note、capture preview から候補を表示し、検索入力は label 付き control として React accessibility guidance を満たす。
4. `Bookmark` panel は現在ページの bookmark toggle と saved bookmark list を表示し、保存済み URL から workspace page preview へ戻れるようにする。
5. page tools と profile / more menu は同時に開かないようにし、outside click / Escape / close button で閉じる compact browser chrome behavior を維持する。
6. この切片では renderer-local page tools lifecycle のみを扱い、BrowserOS source / asset / implementation reuse、実 browser bookmarks API、外部 provider 実行は行わない。

## 第57実装切片

1. BrowserOS の公開 README で確認できる side panel agent / browser tool surface の連携を参考に、page tools から Assistant side panel へ context を渡す clean-room handoff を実装する。
2. `shared/browserAssistantContext.ts` に current page / page search / bookmark context item、recent context、prompt formatting、source label の pure state contract を追加する。
3. `Search page` panel の `Chat` action は検索 query と match preview を attached browser context として Chat panel に渡す。
4. `Bookmark` panel は現在 bookmark を Chat に添付でき、Assistant side panel は attached context card、source chip、query chip、matched evidence preview、clear button を表示する。
5. `Run preview` は base prompt に attached browser context を付与し、既存 `askPage` preview flow に渡す。
6. この切片では renderer-local context handoff のみを扱い、BrowserOS source / asset / implementation reuse、実 browser bookmarks API、外部 provider 実行は行わない。

## 第58実装切片

1. BrowserOS の公開 UI で確認できる assistant context handoff の考え方を参考にしつつ、実装は clean-room の pure state contract として再設計する。
2. `shared/browserAssistantContextHandoff.ts` に attached browser context から `Council` workflow draft と `Schedule` scheduled-task draft を生成する draft-only handoff preview を追加する。
3. handoff prompt には workspace、source、title、URL、query、matched evidence を含め、OCI GenAI Enterprise AI Project を既定 provider として扱う前提を明示する。
4. Assistant side panel の attached context card に `Council` と `Schedule` の compact action を追加し、選択時は対応する mode を開き、prompt textarea に draft prompt を展開する。
5. Schedule handoff は自動保存・自動実行せず、credential / secret を prompt から除外する guardrail を UI state と shared contract 側で保持する。
6. 検証は `pnpm typecheck`、`pnpm --filter @ai-launchpad/browser test:knowledge`、`pnpm lint`、`pnpm --filter @ai-launchpad/browser build`、`git diff --check`、Playwright smoke（Council / Schedule handoff）で行う。
7. この切片では attached context の workflow / schedule draft handoff のみを扱い、BrowserOS source / asset / implementation reuse、永続 scheduler 書き込み、外部 provider 実行は行わない。

## 第59実装切片

1. 第58切片の attached browser context `Schedule` handoff を、既存の schedule suggestion card / editor draft と同じ review path に接続する。
2. `BrowserSchedulerTaskSource` に `assistant_context` を追加し、MCP run history 由来の task と区別できるようにする。
3. `shared/browserAssistantContextHandoff.ts` は attached context から `BrowserSchedulerTaskDraft` と `BrowserScheduleSuggestionCard` を生成し、日次 08:00 / Asia/Tokyo、manual review required、run history なしの draft として扱う。
4. `AgenticControlPanel` は MCP run history tasks の前に assistant context task を差し込み、Schedule mode の suggestion card / editable draft / Scheduled Tasks preview に同じ contract で表示する。
5. card copy は attached browser context 由来であることを明示し、保存しても alarm、hidden browser window、OCI call、外部 provider 実行を開始しない guardrail を維持する。
6. 検証は `pnpm typecheck`、`pnpm --filter @ai-launchpad/browser test:knowledge`、`pnpm lint`、`pnpm --filter @ai-launchpad/browser build`、`git diff --check`、Playwright smoke（context schedule suggestion card）で行う。
7. この切片では attached context から schedule review card への clean-room bridge のみを扱い、BrowserOS source / asset / implementation reuse、永続 scheduler 自動実行、外部 provider 実行は行わない。

## 第60実装切片

1. BrowserOS の公開 README で確認できる Visual Workflows / graph builder の UX を、clean-room の typed workflow graph draft として整理する。
2. `shared/browserWorkflowGraph.ts` に workflow source、node、edge、approval gate、review-only guardrail、save action readiness の独自 contract を追加する。
3. default playbook 由来の workflow graph は Observe / Compare / Plan / Approval Gate / Act / Record の 6 node として扱い、OCI GenAI Enterprise AI Project を既定 provider とする。
4. attached browser context の `Council` handoff は `assistant_context` source の graph draft に変換し、page search / bookmark evidence を Compare node に渡す。
5. Renderer の `Workflow Graph Draft` は static blueprint ではなく typed graph draft を表示し、node status、approval gate、tool / input / output、edge label、review-only save state を確認できるようにする。
6. 検証は `pnpm --filter @ai-launchpad/browser test:knowledge`、`pnpm typecheck`、`pnpm lint`、`pnpm --filter @ai-launchpad/browser build`、`git diff --check`、Playwright smoke（Council workflow graph context）で行う。
7. この切片では graph draft preview のみを扱い、workflow local store、実 browser action、外部 provider 実行、BrowserOS source / asset / implementation reuse は行わない。

## 第61実装切片

1. BrowserOS の公開 README で確認できる `Cowork`（browser automation と local file operations の組み合わせ）を、clean-room の workspace-scoped preview として整理する。
2. `shared/browserCowork.ts` に browser research、workspace file read、file write draft、command preview、artifact review の operation contract を追加する。
3. file write と artifact review は review-required、shell command は blocked とし、workspace 配下以外への read/write、absolute path、parent directory traversal を許可しない方針を UI と contract に明示する。
4. Renderer の Agent mode に `Cowork Workspace Preview` を追加し、ready / review / blocked の集計、operation detail、artifact draft、guardrails を確認できるようにする。
5. OCI GenAI Enterprise AI Project は planning provider として扱うが、この切片では provider 呼び出し、file write、shell command、external MCP、cloud sync を開始しない。
6. 検証は `pnpm --filter @ai-launchpad/browser test:knowledge`、`pnpm typecheck`、`pnpm lint`、`pnpm --filter @ai-launchpad/browser build`、`git diff --check`、Playwright smoke（Agent Cowork Workspace Preview）で行う。
7. BrowserOS source、asset、UI implementation、内部命名は使用せず、公開 feature category だけを参考にする。

## 第62実装切片

1. BrowserOS の公開 README で確認できる `Skills`（custom instruction sets）を、clean-room の local skills catalog preview として整理する。
2. `shared/browserSkillsCatalog.ts` に skill category、status、risk、instruction preview、local Markdown path、output contract、review guardrail の独自 contract を追加する。
3. default catalog は Oracle Docs Researcher、PoC Package Builder、RAG Evidence Reviewer、Browser Action Guard、Credential Safety Reviewer の 5 種とし、OCI GenAI Enterprise AI Project 前提の workspace behavior に合わせる。
4. Memory mode に `Skills Catalog Preview` を追加し、Memory / SOUL.md / Skills の責務分離、recommended skill、active / available / review 集計、local instruction path を確認できるようにする。
5. skill preview は実ファイル更新、cloud sync、OCI GenAI call、browser automation を開始せず、activation は review-only action として扱う。
6. 検証は `pnpm --filter @ai-launchpad/browser test:knowledge`、`pnpm typecheck`、`pnpm lint`、`pnpm --filter @ai-launchpad/browser build`、`git diff --check`、Playwright smoke（Memory Skills Catalog Preview）で行う。
7. BrowserOS source、asset、skill file、UI implementation は使用せず、公開 feature category だけを参考にする。

## 第63実装切片

1. BrowserOS の公開 README で確認できる `Ad Blocking` / browser protection の feature category を、clean-room の Privacy Shield preview として整理する。
2. `shared/browserPrivacyShield.ts` に mode、rule category、decision、request preview event、review-only action、guardrail の独自 contract を追加する。
3. default mode は balanced とし、third-party tracking、ad slots、fingerprinting、cookie banner、first-party enterprise page を local classifier の decision として表示する。
4. top chrome の page tools group に `Privacy Shield` icon を追加し、現在ページの blocked / review / allowed 集計、rule detail、request preview、clean-room guardrail を popover で確認できるようにする。
5. この切片では network request blocking、uBlock rule import、extension install、cloud sync、browser profile write は開始しない。
6. 検証は `pnpm --filter @ai-launchpad/browser test:knowledge`、`pnpm typecheck`、`pnpm lint`、`pnpm --filter @ai-launchpad/browser build`、`git diff --check`、Playwright smoke（Privacy Shield Preview）で行う。
7. BrowserOS source、asset、uBlock rule、UI implementation は使用せず、公開 feature category だけを参考にする。

## 第64実装切片

1. BrowserOS の公開 docs で確認できる `Sync to Cloud` を、clean-room の local-first Cloud Sync preview として整理する。
2. `shared/browserCloudSync.ts` に signed-out / ready / paused status、sync candidate / local-only / excluded scope、review-only action、guardrail の独自 contract を追加する。
3. sync candidate は conversations、AI model settings、scheduled tasks、profile とし、workspace folders、MCP connections、workflow drafts、run outputs、Memory / SOUL.md、page captures は local-only として表示する。
4. credential、API key、OCI wallet、token、private key は常に excluded とし、cloud sync scope から外す。
5. Profile menu に `Cloud Sync Preview` を追加し、signed-out local-first 状態、sync / local / excluded 集計、scope detail、review-only action を確認できるようにする。
6. この切片では account 作成、magic link、OAuth、cloud request、browser profile write は開始しない。
7. 検証は `pnpm --filter @ai-launchpad/browser test:knowledge`、`pnpm typecheck`、`pnpm lint`、`pnpm --filter @ai-launchpad/browser build`、`git diff --check`、Playwright smoke（Cloud Sync Preview）で行う。
8. BrowserOS source、asset、cloud implementation、UI implementation は使用せず、公開 feature category と docs behavior だけを参考にする。

## 第65実装切片

1. BrowserOS の公開 README / docs で確認できる CLI / MCP developer workflow category を、clean-room の `CLI Control Preview` として整理する。
2. `shared/browserCliControl.ts` に command kind、ready / review / blocked status、risk、output preview、review-only action、guardrail の独自 contract を追加する。
3. default command は open current page、ask current page、draft workflow、draft schedule、MCP bridge status の 5 種とし、OCI GenAI Enterprise AI Project を既定 provider として扱う。
4. URL query に token、secret、wallet、private key などの sensitive key が含まれる場合は command preview から redaction し、CLI args に credential を出さない。
5. top chrome の `More` menu に `CLI Control Preview` を追加し、ready / review / blocked 集計、command preview、review-only action、clean-room guardrail を確認できるようにする。
6. この切片では shell command、external MCP、OCI call、file write、cloud sync を開始せず、execute action は常に disabled とする。
7. 検証は `pnpm --filter @ai-launchpad/browser test:knowledge`、`pnpm typecheck`、`pnpm lint`、`pnpm --filter @ai-launchpad/browser build`、`git diff --check`、Playwright smoke（CLI Control Preview）で行う。
8. BrowserOS source、asset、CLI implementation、UI implementation は使用せず、公開 feature category だけを参考にする。

## 第66実装切片

1. BrowserOS の公開 docs で確認できる Chrome extension compatibility / Chrome import category を、clean-room の `Extensions Preview` として整理する。
2. `shared/browserExtensionPermissions.ts` に extension source、permission scope、allowed / review / blocked decision、risk、site access、review-only action、guardrail の独自 contract を追加する。
3. default extension set は Oracle Docs Capture Helper、uBlock Origin Compatibility、Enterprise Password Manager、AI Autofill Agent、Local MCP Native Host の 5 種とし、OCI GenAI Enterprise AI Project の enterprise review boundary に合わせる。
4. all sites、cookies、history、native messaging は allowed にせず、review または blocked として扱い、password、cookie、wallet、token、private key は extension context に渡さない。
5. top chrome の page tool group に Extensions icon を追加し、allowed / review / blocked 集計、extension detail、permission scope、review-only action、clean-room guardrail を確認できるようにする。
6. この切片では Chrome Web Store request、extension install、update、uninstall、browser profile write、BrowserOS manifest reuse は開始しない。
7. 検証は `pnpm --filter @ai-launchpad/browser test:knowledge`、`pnpm typecheck`、`pnpm lint`、`pnpm --filter @ai-launchpad/browser build`、`git diff --check`、Playwright smoke（Extensions Preview）で行う。
8. BrowserOS source、asset、extension manifest、UI implementation は使用せず、公開 feature category と docs behavior だけを参考にする。

## 第67実装切片

1. BrowserOS の公開 docs / README で確認できる built-in highlighter / semantic search / history-bookmark recall category を、clean-room の `Highlights Preview` として整理する。
2. `shared/browserHighlights.ts` に highlight source、color、saved / review / local-only decision、semantic tags、local recall、review-only action、guardrail の独自 contract を追加する。
3. current selection、page summary、local captures、bookmark preview を入力にし、highlight 候補と semantic recall を生成するが、embedding、vector DB、external search、OCI call は開始しない。
4. password、cookie、wallet、token、private key は highlight text / semantic recall から redaction し、cloud sync scope には含めない。
5. top chrome の page tool group に Highlighter icon を追加し、saved / review / local-only 集計、highlight detail、semantic recall、review-only action、clean-room guardrail を popover で確認できるようにする。
6. この切片では DOM annotation、browser history DB、bookmark DB、profile、cloud sync、BrowserOS highlighter implementation reuse は開始しない。
7. 検証は `pnpm --filter @ai-launchpad/browser test:knowledge`、`pnpm typecheck`、`pnpm lint`、`pnpm --filter @ai-launchpad/browser build`、`git diff --check`、Playwright smoke（Highlights Preview）で行う。
8. BrowserOS source、asset、highlighter implementation、UI implementation は使用せず、公開 feature category と screenshot-level layout behavior だけを参考にする。

## 第68実装切片

1. BrowserOS の公開 onboarding / docs で確認できる Chrome data import category を、clean-room の `Chrome Import Preview` として整理する。
2. `shared/browserChromeImport.ts` に bookmarks、history、passwords、extensions、settings の import map、ready / review / blocked decision、review-only action、guardrail の独自 contract を追加する。
3. bookmarks は review、history と passwords は blocked、extensions は permission review 連携、settings は draft-only とし、Chrome profile を直接読まない。
4. Profile menu に `Chrome Import Preview` を追加し、ready / review / blocked 集計、data kind detail、review-only action、clean-room guardrail を確認できるようにする。
5. password、cookie、session token、wallet、private key、passkey は import scope から除外し、profile label でも redaction する。
6. この切片では Chrome profile read/write、History SQLite、Login Data、Cookies、Secure Preferences、chrome://settings/importData navigation、BrowserOS import implementation reuse は開始しない。
7. 検証は `pnpm --filter @ai-launchpad/browser test:knowledge`、`pnpm typecheck`、`pnpm lint`、`pnpm --filter @ai-launchpad/browser build`、`git diff --check`、Playwright smoke（Chrome Import Preview）で行う。
8. BrowserOS source、asset、import implementation、UI implementation は使用せず、公開 onboarding / docs behavior だけを参考にする。

## 第69実装切片

1. BrowserOS の公開 Bring Your Own LLM / provider settings category を、clean-room の `AI Provider Settings Preview` として整理する。
2. `shared/browserProviderSettings.ts` に primary provider、agent routing、grounding、local fallback、external BYOK、secrets の setting contract を追加する。
3. 既定 provider は `OCI GenAI Enterprise AI Project` に固定し、Chat / Agent / Council / Schedule routing は OCI provider 前提の review draft として扱う。
4. Gemini、Claude、OpenAI、OpenRouter、Ollama などの external BYOK providers は blocked とし、この project の renderer settings には保存しない。
5. API key、token、wallet、private key、cookie、credential は provider settings preview から redaction / exclusion し、secret store は更新しない。
6. Profile menu に `AI Provider Settings Preview` を追加し、ready / review / blocked 集計、setting detail、review-only action、clean-room guardrail を確認できるようにする。
7. この切片では provider settings store、OCI GenAI call、external provider call、local model process、cloud sync は開始しない。
8. BrowserOS source、asset、provider implementation、UI implementation は使用せず、公開 provider category と screenshot-level layout behavior だけを参考にする。

## 第70実装切片

1. BrowserOS の公開 LLM Hub / multi-response comparison category を、clean-room の `LLM Hub Response Lane Preview` として拡張する。
2. `shared/browserChatHub.ts` の Hub pane に response state、response preview、evidence label、privacy label、execution label、disabled action を追加する。
3. Claude、ChatGPT、Gemini などの external BYOK lane ではなく、OCI GenAI Enterprise AI Project、Oracle Vector Grounding、Local Keyword Baseline の 3 lane に置き換える。
4. 各 lane は同じ prompt / page context を mirror するが、OCI GenAI call、Oracle Vector query、local model process、external provider call は開始しない。
5. Knowledge / capture evidence がない場合、Oracle Vector Grounding lane は `needs_evidence` として表示し、送信可能な状態とは扱わない。
6. Chat mode の `Chat & Hub Preview` に response draft、evidence / privacy chip、disabled review action、comparison check、clean-room guardrail を表示する。
7. この切片では response UI preview のみを扱い、provider request、streaming response、BYOK provider routing、BrowserOS Hub implementation reuse は行わない。

## 第71実装切片

1. BrowserOS の公開 Smart Nudges docs で確認できる app connection / schedule suggestion の contextual card を、clean-room の `Smart Nudges Chrome Preview` として top chrome に昇格する。
2. `shared/browserSmartNudges.ts` に mode label、suggested / suppressed / action 集計、top-level guardrail を追加し、toolbar popover で扱える contract に拡張する。
3. Renderer の top chrome に Smart Nudges icon を追加し、現在 mode、workspace、local-only notice、nudge card、suppressed reason、review-only action を popover で確認できるようにする。
4. default task context は OCI GenAI Enterprise AI Project 向けの follow-up email / daily readiness digest preview とし、Business Email app connection と recurring schedule の候補を生成する。
5. Chat mode と scheduled run mode では nudge を表示しないという公開 behavior を contract 側で維持し、UI でも suppressed reason として確認できる。
6. この切片では app auth、email 送信、schedule 保存、cloud sync、BrowserOS source / asset / UI implementation reuse は行わない。
7. 検証は `pnpm --filter @ai-launchpad/browser test:knowledge`、`pnpm typecheck`、`pnpm lint`、`pnpm --filter @ai-launchpad/browser build`、`git diff --check`、Playwright smoke（Smart Nudges Chrome Preview）で行う。

## 第72実装切片

1. BrowserOS の公開 docs で確認できる Agent Mode の form filling / workflow form automation を、clean-room の `Form Autofill Guard Preview` として整理する。
2. `shared/browserFormAutofill.ts` に field kind、ready / review / blocked decision、suggested value、evidence label、action、guardrail の独自 contract を追加する。
3. password、API key、wallet、token、private key、payment field は常に blocked / redacted とし、summary や selection 由来の値にも redaction を適用する。
4. Renderer の top chrome に Autofill icon を追加し、現在ページの form field plan、ready / review / blocked 集計、review-only action、local-only notice を popover で確認できるようにする。
5. OCI Console source では tenant / compartment 誤操作を避けるため review field と credential blocked field を追加する。
6. この切片では DOM input、submit、password manager、Chrome profile autofill、OCI GenAI call、BrowserOS source / asset / autofill implementation reuse は行わない。
7. 検証は `pnpm --filter @ai-launchpad/browser test:knowledge`、`pnpm typecheck`、`pnpm lint`、`pnpm --filter @ai-launchpad/browser build`、`git diff --check`、Playwright smoke（Form Autofill Guard Preview）で行う。

## 第73実装切片

1. BrowserOS の公開 Workflows docs で確認できる reusable visual workflow / graph automation を、clean-room の `Workflow Recorder Preview` として top chrome に追加する。
2. `shared/browserWorkflowRecorder.ts` に observe / extract / loop / fill / approval / record step、captured / suggested / review / blocked status、action、graph summary、guardrail の独自 contract を追加する。
3. 現在 tab、workspace、captures、knowledge count、assistant prompt から recorder draft を生成し、repeatable task と form workflow の候補を graph node として提案する。
4. OCI Console、credential、payment、delete などの sensitive context は blocked approval gate に分離する。
5. Renderer の top chrome に Recorder icon を追加し、step timeline、target/evidence、approval gate、preview-only action、local-only notice を popover で確認できるようにする。
6. この切片では DOM event listener、実 browser recording、click / fill / submit、workflow store write、OCI GenAI call、external MCP、BrowserOS source / asset / workflow implementation reuse は行わない。
7. 検証は `pnpm --filter @ai-launchpad/browser test:knowledge`、`pnpm typecheck`、`pnpm lint`、`pnpm --filter @ai-launchpad/browser build`、`git diff --check`、Playwright smoke（Workflow Recorder Preview）で行う。

## 第74実装切片

1. BrowserOS の公開 Scheduled Tasks docs で確認できる alarm trigger / hidden background window / agent execution / New Tab result / run history flow を、clean-room の `Background Run Preview` として Scheduled Tasks Manager に追加する。
2. `shared/browserSchedulerRegistry.ts` に background run stage、ready / waiting / needs_review / blocked status、action、metadata、guardrail の独自 contract を追加する。
3. ready task は alarm trigger と timeout guard を ready、hidden window と agent execution を review、result save を waiting として表示する。
4. blocked / approval-gated task は background execution 前に blocked stage へ分離し、credential、wallet、token、cookie、private key は metadata に含めない。
5. Renderer の Scheduled Tasks Manager に background run flow、stage timeline、cloud sync scope、local-only run result、disabled hidden-window action を表示する。
6. この切片では browser alarm、hidden BrowserWindow、timer、browser automation、OCI GenAI call、external MCP、profile write、BrowserOS source / asset / scheduled-task implementation reuse は行わない。
7. 検証は `pnpm --filter @ai-launchpad/browser test:knowledge`、`pnpm typecheck`、`pnpm lint`、`pnpm --filter @ai-launchpad/browser build`、`git diff --check`、Playwright smoke（Background Run Preview）で行う。

## 第75実装切片

1. BrowserOS の公開 MCP Clients / Connect Apps docs で確認できる Codex、Claude Code、Gemini CLI、OpenClaw、Claude Desktop、custom MCP server onboarding を、clean-room の `MCP Client Onboarding Preview` として MCP panel に追加する。
2. `shared/browserMcpEndpointCommands.ts` に client onboarding status、setup step、tool category、external app group、custom MCP server、guardrail の独自 contract を追加する。
3. endpoint running 時は CLI client を ready、JSON / desktop config を copy_required、test prompt を review_required として表示し、endpoint stopped 時は client setup を endpoint_stopped に落とす。
4. Browser tool category は 53 tool surface の公開 category alignment として Navigation、Content、Interaction、File、Window、Tab Groups、Bookmarks、History に分け、History destructive scope は blocked とする。
5. Renderer の MCP panel に onboarding card、client list、setup flow、custom MCP server placeholder、external app groups、guardrail を表示する。
6. この切片では外部 CLI 実行、Claude / Gemini / Codex / OpenClaw config 書き込み、OAuth proxy、remote MCP process、BrowserOS source / asset / MCP implementation reuse は行わない。
7. 検証は `pnpm --filter @ai-launchpad/browser test:knowledge`、`pnpm typecheck`、`pnpm lint`、`pnpm --filter @ai-launchpad/browser build`、`git diff --check`、Playwright smoke（MCP Client Onboarding Preview）で行う。

## 第76実装切片

1. BrowserOS の公開 docs で確認できる `Three Ways to Use AI`（Chat Mode / Agent Mode / Graph Mode）を、clean-room の `AI Mode Onboarding Preview` として onboarding page に追加する。
2. `shared/browserAiModeOnboarding.ts` に mode status、quick start step、stat、guardrail の独自 contract を追加し、OCI GenAI Enterprise AI Project を既定 provider として扱う。
3. Chat は page context ready、Agent は approval gate review、Graph は preview-only planned を既定状態とし、missing prerequisite 時は needs_review / planned に落とす。
4. onboarding hero の下に Chat / Agent / Graph の 3 card、mode stats、evidence label、review-only action を表示し、BrowserOS-like な入口構造へ近づける。
5. この切片では OCI GenAI call、browser automation、workflow 保存、外部 provider 設定、BrowserOS source / asset / UI implementation reuse は行わない。
6. 検証は `pnpm --filter @ai-launchpad/browser test:knowledge`、`pnpm typecheck`、`pnpm lint`、`pnpm --filter @ai-launchpad/browser build`、`git diff --check`、Playwright smoke（AI Mode Onboarding Preview）で行う。

## 第77実装切片

1. BrowserOS の公開 Sync to Cloud docs と screenshot-level sidebar behavior で確認できる `Cloud Sign In` entry を、clean-room の internal sign-in preview page として実装する。
2. `shared/browserCloudSignIn.ts` に magic link / Google / Oracle SSO method、sign-in step、sync bucket、excluded credential、guardrail の独自 contract を追加する。
3. 既存 `Cloud Sync Preview` の sync candidate / local-only / excluded scope を sign-in page に集約し、credentials、wallet、private key は常に excluded として表示する。
4. 左 rail の `Cloud Sign In` を外部 `cloud.oracle.com` page target ではなく internal `cloudSignIn` route に変更し、address bar は `chrome://ai-launchpad/cloud-sign-in` を表示する。
5. この切片では magic link、OAuth、Oracle SSO、cloud request、cookie write、browser profile write、BrowserOS source / asset / auth implementation reuse は行わない。
6. 検証は `pnpm --filter @ai-launchpad/browser test:knowledge`、`pnpm typecheck`、`pnpm lint`、`pnpm --filter @ai-launchpad/browser build`、`git diff --check`、Playwright smoke（Cloud Sign In Preview）で行う。

## 第78実装切片

1. BrowserOS の公開 quick start docs で確認できる Download / Import from Chrome / Configure AI / Try it out の onboarding flow を、clean-room の `Quick Start Preview` として onboarding page に追加する。
2. `shared/browserQuickStartOnboarding.ts` に sign in、Chrome import、AI configure、try assistant の step、status、metric、guardrail の独自 contract を追加する。
3. Configure AI は external BYOK ではなく `OCI GenAI Enterprise AI Project` を既定 provider とし、Chrome import は bookmarks / extensions review-only、history / password / cookie は blocked として扱う。
4. onboarding hero と Three Ways to Use AI の下に Quick Start checklist を表示し、Try Assistant だけ workspace へ遷移可能、他の step は preview-only action として disabled にする。
5. この切片では installer、Chrome profile read、OAuth、provider settings write、OCI GenAI call、browser automation、BrowserOS source / asset / onboarding implementation reuse は行わない。
6. 検証は `pnpm --filter @ai-launchpad/browser test:knowledge`、`pnpm typecheck`、`pnpm lint`、`pnpm --filter @ai-launchpad/browser build`、`git diff --check`、Playwright smoke（Quick Start Preview）で行う。

## 第79実装切片

1. BrowserOS の公開 docs / README で確認できる「plain English で browser task を依頼する」「Chat / Agent / Graph で試す」導線を、clean-room の `Try Assistant Prompts` として onboarding page に追加する。
2. `shared/browserAssistantPromptLauncher.ts` に summarize page、extract data、translate selection、fill form with approval、save repeatable report の prompt template、mode、risk、metric、guardrail の独自 contract を追加する。
3. 既定 provider は `OCI GenAI Enterprise AI Project` に固定し、provider label に含まれる token / api_key / password / secret / cookie は redaction する。
4. UI は Quick Start の下に prompt launcher cards を表示し、safe / review prompt は workspace へ遷移可能、blocked prompt は disabled として approval gate が必要なことを示す。
5. この切片では DOM click / type / submit、file write、scheduler 登録、OCI GenAI call、BrowserOS source / asset / prompt implementation reuse は行わない。
6. 検証は `pnpm --filter @ai-launchpad/browser test:knowledge`、`pnpm typecheck`、`pnpm lint`、`pnpm --filter @ai-launchpad/browser build`、`git diff --check`、Playwright smoke（Try Assistant Prompts）で行う。

## 第80実装切片

1. BrowserOS の公開 README で確認できる「53+ browser automation tools」「natural language で navigate / click / type / extract data」の agentic loop を、clean-room の `Assistant Action Plan` として onboarding page に追加する。
2. `shared/browserAssistantActionPlan.ts` に observe / plan / approve / act / record stage、tool category、ready / needs_review / blocked status、metric、guardrail の独自 contract を追加する。
3. `Try Assistant Prompts` の `fill form with approval` を代表 prompt とし、browser write / submit は approval なしでは blocked、file write / scheduler 登録は review-only として扱う。
4. UI は prompt launcher の下に action plan stage cards と tool route cards を表示し、自然言語 prompt がどの browser tool route と approval gate に変換されるかを確認できるようにする。
5. この切片では BrowserOS の agent loop implementation、tool implementation、DOM click / type / submit、file write、scheduler 登録、OCI GenAI call は開始しない。
6. 検証は `pnpm --filter @ai-launchpad/browser test:knowledge`、`pnpm typecheck`、`pnpm lint`、`pnpm --filter @ai-launchpad/browser build`、`git diff --check`、Playwright smoke（Assistant Action Plan）で行う。

## 第81実装切片

1. 第79 / 第80切片で分離していた `Try Assistant Prompts` と `Assistant Action Plan` を接続し、prompt card の選択で action plan が即時更新される onboarding interaction にする。
2. 既定選択は `fill form with approval` のままとし、read-only prompt を選択すると act / approve / record が ready へ変化し、form prompt を選択すると approval pending / automation blocked に戻る。
3. prompt card は selected state、keyboard selection、focus ring を持つ interactive card として扱い、既存の workspace CTA は safe / review prompt の action button に残す。
4. この切片では prompt 選択と local preview の再計算だけを扱い、BrowserOS source / UI implementation、OCI GenAI call、browser automation、DOM write、scheduler 登録は開始しない。
5. 検証は `pnpm --filter @ai-launchpad/browser test:knowledge`、`pnpm typecheck`、`pnpm lint`、`pnpm --filter @ai-launchpad/browser build`、`git diff --check`、Playwright smoke（Prompt-to-Action Plan selection）で行う。

## 第82実装切片

1. `Assistant Action Plan` に local-only approval preview を追加し、approval pending / granted の状態で stage と tool route が即時に切り替わる interaction にする。
2. `shared/browserAssistantActionPlan.ts` に approval summary、action label、enabled state、granted state を持つ独自 contract を追加する。
3. `fill form with approval` は approval 後に Draft values / Type fields を dry-run ready へ昇格し、Submit form は最終確認が必要な needs_review のまま維持する。
4. `save repeatable report` は approval 後に report file candidate を ready にし、scheduler 登録は別 confirmation の needs_review として分離する。
5. UI は action plan header に approval card と toggle button を追加し、prompt card の変更時には approval state を reset する。
6. この切片では approval state の local preview だけを扱い、DOM click / type / submit、file write、scheduler 登録、OCI GenAI call、BrowserOS source / asset / UI implementation reuse は行わない。
7. 検証は `pnpm --filter @ai-launchpad/browser test:knowledge`、`pnpm typecheck`、`pnpm lint`、`pnpm --filter @ai-launchpad/browser build`、`git diff --check`、Playwright smoke（Assistant Action Approval Preview）で行う。

## 第83実装切片

1. 第82切片の approval state を、local-only の `Local Dry-run Timeline` として action plan 内に接続する。
2. `shared/browserAssistantActionPlan.ts` に run preview、run step、output label、policy reason、run metric の独自 contract を追加する。
3. run preview は observe / plan / approve stage と tool route、record stage を同じ timeline で表示し、blocked / needs_review / ready を即時に再計算する。
4. approval 未付与の write-capable tool は dry-run stopped、approval 後に残る submit / scheduler / file confirmation は confirmation required として分離する。
5. UI は `Assistant Action Plan` の下に run status、policy reason、step timeline、metric を表示し、状態変化は `aria-live` で通知できるようにする。
6. この切片では local preview の timeline contract と renderer 表示だけを扱い、DOM click / type / submit、file write、scheduler 登録、OCI GenAI call、BrowserOS source / asset / UI implementation reuse は行わない。
7. 検証は `pnpm --filter @ai-launchpad/browser test:knowledge`、`pnpm typecheck`、`pnpm lint`、`pnpm --filter @ai-launchpad/browser build`、`git diff --check`、Playwright smoke（Local Dry-run Timeline）で行う。

## 第84実装切片

1. 第83切片の `Local Dry-run Timeline` を、既存の `BrowserAgentRun` contract に変換する local-only `Run History Candidate` として接続する。
2. `shared/browserAssistantActionPlan.ts` に history candidate、record 可否、local-only notice、run metric、guardrail の独自 contract を追加する。
3. `ready` は `completed`、`needs_review` は `needs_approval`、`blocked` は `blocked` として変換し、step / event / actionKind は既存 history surface で読める形に正規化する。
4. approval 未付与の browser write は record disabled、approval 後に残る submit / scheduler は approval event として残し、read-only prompt は completed candidate として扱う。
5. UI は `Local Dry-run Timeline` の下に candidate status、record 可否、local-only notice、event preview、metric を表示する。
6. この切片では history 永続化、DOM click / type / submit、file write、scheduler 登録、OCI GenAI call、BrowserOS source / asset / UI implementation reuse は行わない。
7. 検証は `pnpm --filter @ai-launchpad/browser test:knowledge`、`pnpm typecheck`、`pnpm lint`、`pnpm --filter @ai-launchpad/browser build`、`git diff --check`、Playwright smoke（Run History Candidate）で行う。

## 第85実装切片

1. 第84切片の `Run History Candidate` を、renderer state の `Local Run History Preview` に追加できる local-only interaction として接続する。
2. `shared/browserAssistantActionPlan.ts` に local history preview、apply result、duplicate guard、blocked guard、max history cap の独自 contract を追加する。
3. recordable candidate は `BrowserAgentRun` として local preview list の先頭に追加し、blocked candidate と duplicate candidate は reason 付きで拒否する。
4. UI は candidate card の record action を有効化し、追加結果 message、history metrics、clear preview、直近 run cards を表示する。
5. prompt 変更や approval toggle では candidate timestamp を更新し、同じ preview を重複追加しない一方で、新しい preview は別 run として扱う。
6. この切片では disk store、cloud sync、browser profile、DOM click / type / submit、file write、scheduler 登録、OCI GenAI call、BrowserOS source / asset / UI implementation reuse は行わない。
7. 検証は `pnpm --filter @ai-launchpad/browser test:knowledge`、`pnpm typecheck`、`pnpm lint`、`pnpm --filter @ai-launchpad/browser build`、`git diff --check`、Playwright smoke（Local Run History Preview）で行う。

## 第86実装切片

1. 第85切片の `Local Run History Preview` を、既存 `BrowserSchedulerTaskDraft` / `ScheduleSuggestionCard` contract に接続する `Assistant Schedule Handoff Preview` として追加する。
2. `shared/browserSchedulerRegistry.ts` に `assistant_run_history` source と assistant run history から schedule task draft を作る独自 contract を追加する。
3. completed run は `read_only_auto_preview` / ready / 12時間ごと、needs_approval run は `manual_review_required` / needs_approval として扱い、next run は ready のみ計算する。
4. UI は local run history の最新 run から schedule handoff card、status、policy、cadence、next run、details を表示する。
5. この切片では schedule 永続化、alarm、hidden window、browser automation、OCI GenAI call、external MCP、profile write、BrowserOS source / asset / implementation reuse は行わない。
6. 検証は `pnpm --filter @ai-launchpad/browser test:knowledge`、`pnpm typecheck`、`pnpm lint`、`pnpm --filter @ai-launchpad/browser build`、`git diff --check`、Playwright smoke（Assistant Schedule Handoff Preview）で行う。

## 第87実装切片

1. 第86切片の `Assistant Schedule Handoff Preview` を、Workspace の Schedule mode / Scheduled Tasks Manager に渡せる local-only handoff として接続する。
2. `shared/browserSchedulerRegistry.ts` に handoff draft を既存 task list の先頭へ重複なしで merge する独自 contract を追加する。
3. Schedule mode は assistant handoff draft を ready task より優先して suggestion / editor / task list に表示し、saved task が存在する場合でも handoff draft を一時 preview として先頭に保持する。
4. Onboarding UI は run history から作った schedule draft を `Schedule preview に渡す` button で Workspace に送り、Schedule panel と rail status に反映する。
5. この切片では schedule 永続化、alarm、hidden window、browser automation、OCI GenAI call、external MCP、profile write、BrowserOS source / asset / implementation reuse は行わない。
6. 検証は `pnpm --filter @ai-launchpad/browser test:knowledge`、`pnpm typecheck`、`pnpm lint`、`pnpm --filter @ai-launchpad/browser build`、`git diff --check`、Playwright smoke（Onboarding Schedule Handoff to Scheduled Tasks Manager）で行う。

## 第88実装切片

1. 第87切片で Schedule mode に渡した `assistant_run_history` handoff draft を、approval 待ちの review draft として扱う gate を Scheduler Registry に追加する。
2. `shared/browserSchedulerRegistry.ts` に `ScheduleHandoffReview` contract と `createBrowserScheduleHandoffReviewDraft` を追加し、needs_approval / manual_review_required / next run なしを維持する。
3. Schedule panel は active handoff draft が needs_approval の場合に `Schedule Handoff Review Gate` を表示し、通常の `Save ready` は active ready draft だけを保存対象にする。
4. Electron IPC がある場合だけ review draft を local scheduler store に保存でき、保存後も alarm、hidden window、agent execution は開始しない。
5. この切片では approval bypass、schedule 有効化、alarm、hidden window、browser automation、OCI GenAI call、external MCP、cloud sync、BrowserOS source / asset / implementation reuse は行わない。
6. 検証は `pnpm --filter @ai-launchpad/browser test:knowledge`、`pnpm typecheck`、`pnpm lint`、`pnpm --filter @ai-launchpad/browser build`、`git diff --check`、Playwright smoke（Schedule Handoff Review Gate）で行う。

## 第89実装切片

1. 第88切片で保存対象にした `needs_approval` scheduler review draft を、明示的な approval preview から disabled draft へ昇格できる contract にする。
2. `shared/browserSchedulerRegistry.ts` に `ScheduleReviewApprovalPreview` と `createBrowserScheduleApprovedReviewDraft` を追加し、承認後も enabled=false / manual_review_required / next run なしを維持する。
3. Scheduled Tasks Manager の detail view に `Schedule Review Approval` を追加し、対象 task の current status、approved status、policy、guardrail を確認できるようにする。
4. Electron IPC がある場合だけ approved disabled draft を local scheduler store に保存し、保存後の enable 化は既存の Editable Schedule Draft で別途確認する。
5. この切片では schedule 自動有効化、approval bypass、alarm、hidden window、browser automation、OCI GenAI call、external MCP、cloud sync、BrowserOS source / asset / implementation reuse は行わない。
6. 検証は `pnpm --filter @ai-launchpad/browser test:knowledge`、`pnpm typecheck`、`pnpm lint`、`pnpm --filter @ai-launchpad/browser build`、`git diff --check`、Playwright smoke（Schedule Review Approval）で行う。

## 第90実装切片

1. 第89切片で approved disabled draft として保存した scheduler task を、選択中 task として `Editable Schedule Draft` の source に優先できるようにする。
2. `shared/browserSchedulerRegistry.ts` に `selectBrowserScheduleEditorSource` contract を追加し、selected ready / disabled task、assistant handoff、ready task、fallback の順で editor source を決める。
3. selected task が `needs_approval` / `blocked` の場合は従来どおり review gate 側に残し、approved disabled task だけを editor で enable 可能にする。
4. Renderer は Scheduled Tasks Manager で選択した approved disabled task を editor に反映し、`Enabled` checkbox と `Save edited draft` から ready draft へ進める。
5. この切片では schedule 自動有効化、alarm、hidden window、browser automation、OCI GenAI call、external MCP、cloud sync、BrowserOS source / asset / implementation reuse は行わない。
6. 検証は `pnpm --filter @ai-launchpad/browser test:knowledge`、`pnpm typecheck`、`pnpm lint`、`pnpm --filter @ai-launchpad/browser build`、`git diff --check`、Playwright smoke（Approved Disabled Draft Editor Source）で行う。

## 第91実装切片

1. 第90切片で ready 化した scheduler task の manual dry-run history preview を、明示操作で local scheduler store に保存できるようにする。
2. `shared/browserSchedulerRegistry.ts` に `BrowserScheduledTaskHistoryStoreCommitPreview` contract を追加し、base task と preview task の run history 差分がある場合だけ保存可能にする。
3. Scheduled Tasks Manager の `Dry-run History Candidate` に `Store Commit Preview` を追加し、追加 run 数、base run 数、preview run 数、local-only guardrail を確認できるようにする。
4. Electron IPC がある場合だけ preview 済み task draft を `schedulerRegistry.saveTask` へ渡し、保存後は preview state を clear して local scheduler store の内容を再読込する。
5. この切片では alarm、hidden window、browser automation、OCI GenAI call、external MCP、cloud sync、BrowserOS source / asset / implementation reuse は行わない。
6. 検証は `pnpm --filter @ai-launchpad/browser test:knowledge`、`pnpm typecheck`、`pnpm lint`、`pnpm --filter @ai-launchpad/browser build`、`git diff --check`、Playwright smoke（Run History Store Commit Preview）で行う。

## 第92実装切片

1. 保存済みまたは preview 中の全 scheduled task から、New Tab 相当の recent result inbox を生成する。
2. `shared/browserSchedulerRegistry.ts` に `BrowserScheduledTaskNewTabInboxPreview` contract を追加し、task 横断で run history を新しい順に集約し、completed / needs approval / blocked の件数を返す。
3. Scheduled Tasks Manager の `New Tab Result Preview` に `New Tab result inbox` を追加し、各 result card から task と run を選択できるようにする。
4. inbox は local run history preview の読み取り専用で、run output は cloud sync 対象にせず、選択操作も renderer state の切替だけに限定する。
5. この切片では alarm、hidden window、browser automation、OCI GenAI call、external MCP、cloud sync、BrowserOS source / asset / UI implementation reuse は行わない。
6. 検証は `pnpm --filter @ai-launchpad/browser test:knowledge`、`pnpm typecheck`、`pnpm lint`、`pnpm --filter @ai-launchpad/browser build`、`git diff --check`、Playwright smoke（New Tab Result Inbox）で行う。

## 第93実装切片

1. 第92切片の `New Tab result inbox` に local search/filter を追加する。
2. `shared/browserSchedulerRegistry.ts` に `BrowserScheduledTaskNewTabInboxFilterPreview` contract を追加し、task、workspace、title、summary、status、run id、metadata を検索対象にする。
3. Renderer は既存の `New Tab result` search input を inbox filter にも接続し、visible/total match count、matched field chips、empty state を表示する。
4. filter は renderer local state のみを対象にし、run output、capture、knowledge、scheduler store、OCI GenAI、external MCP、cloud sync は更新しない。
5. この切片では alarm、hidden window、browser automation、OCI GenAI call、external MCP、cloud sync、BrowserOS source / asset / UI implementation reuse は行わない。
6. 検証は `pnpm --filter @ai-launchpad/browser test:knowledge`、`pnpm typecheck`、`pnpm lint`、`pnpm --filter @ai-launchpad/browser build`、`git diff --check`、Playwright smoke（New Tab Result Inbox Filter）で行う。

## 第94実装切片

1. 第93切片の `New Tab result inbox` に status segment filter を追加し、All / Done / Review / Blocked で local results を triage できるようにする。
2. `shared/browserSchedulerRegistry.ts` の `BrowserScheduledTaskNewTabInboxFilterPreview` を `statusFilter` 対応に拡張し、query と status segment を同時に適用する。
3. Renderer は inbox header に segmented control を追加し、query 後の status counts、visible/total count、status empty state を表示する。
4. status segment は renderer local state のみを対象にし、run output、capture、knowledge、scheduler store、OCI GenAI、external MCP、cloud sync は更新しない。
5. この切片では alarm、hidden window、browser automation、OCI GenAI call、external MCP、cloud sync、BrowserOS source / asset / UI implementation reuse は行わない。
6. 検証は `pnpm --filter @ai-launchpad/browser test:knowledge`、`pnpm typecheck`、`pnpm lint`、`pnpm --filter @ai-launchpad/browser build`、`git diff --check`、Playwright smoke（New Tab Result Inbox Status Segment）で行う。

## 第95実装切片

1. 第94切片の `New Tab result inbox` に local triage preview を追加し、現在の query / status segment に対する次の確認対象を提示する。
2. `shared/browserSchedulerRegistry.ts` に `BrowserScheduledTaskNewTabInboxTriagePreview` contract を追加し、review、blocked、completed の順で local next action を選ぶ。
3. Renderer は inbox header に `Inbox triage` を表示し、visible / review / done / blocked metrics と local-only guardrail、選択対象を開く button を追加する。
4. triage action は renderer state の task / run selection だけを更新し、run output、capture、knowledge、scheduler store、OCI GenAI、external MCP、cloud sync は更新しない。
5. この切片では alarm、hidden window、browser automation、OCI GenAI call、external MCP、cloud sync、BrowserOS source / asset / UI implementation reuse は行わない。
6. 検証は `pnpm --filter @ai-launchpad/browser test:knowledge`、`pnpm typecheck`、`pnpm lint`、`pnpm --filter @ai-launchpad/browser build`、`git diff --check`、Playwright smoke（New Tab Result Inbox Triage）で行う。

## 第96実装切片

1. 第95切片の `Inbox triage` を複数候補の local action queue に拡張し、filtered inbox result を Review / Blocked / Done の優先順で並べる。
2. `shared/browserSchedulerRegistry.ts` に `BrowserScheduledTaskNewTabInboxActionQueuePreview` contract を追加し、visible result から最大 action 件数、優先度、選択状態、local-only guardrail を返す。
3. Renderer は inbox header に `Inbox action queue` を表示し、各 action button から task / run を renderer state で選択できるようにする。
4. action queue は renderer state の task / run selection だけを更新し、run output、capture、knowledge、scheduler store、OCI GenAI、external MCP、cloud sync は更新しない。
5. この切片では alarm、hidden window、browser automation、OCI GenAI call、external MCP、cloud sync、BrowserOS source / asset / UI implementation reuse は行わない。
6. 検証は `pnpm --filter @ai-launchpad/browser test:knowledge`、`pnpm typecheck`、`pnpm lint`、`pnpm --filter @ai-launchpad/browser build`、`git diff --check`、Playwright smoke（New Tab Result Inbox Action Queue）で行う。

## 第97実装切片

1. 第96切片の `Inbox action queue` から、選択中または最優先 action を対象にした local assistant handoff draft を生成する。
2. `shared/browserSchedulerRegistry.ts` に `BrowserScheduledTaskNewTabInboxActionHandoffPreview` contract を追加し、source action、prompt preview、metadata、copy-only primary action、local-only guardrail を返す。
3. Renderer は `Action handoff draft` を action queue 内に表示し、prompt preview、actions / visible / source metadata、`Copy handoff prompt` button を提供する。
4. handoff draft は clipboard 用 prompt のみを生成し、assistant 実行、browser automation、run output、capture、knowledge、scheduler store、OCI GenAI、external MCP、cloud sync は更新しない。
5. この切片では alarm、hidden window、browser automation、assistant auto-run、OCI GenAI call、external MCP、cloud sync、BrowserOS source / asset / UI implementation reuse は行わない。
6. 検証は `pnpm --filter @ai-launchpad/browser test:knowledge`、`pnpm typecheck`、`pnpm lint`、`pnpm --filter @ai-launchpad/browser build`、`git diff --check`、Playwright smoke（New Tab Result Inbox Action Handoff）で行う。

## 第98実装切片

1. 第97切片の `Action handoff draft` を、prompt だけではなく source metadata と clean-room guardrail を含む local handoff packet に拡張する。
2. `shared/browserSchedulerRegistry.ts` の `BrowserScheduledTaskNewTabInboxActionHandoffPreview` に `handoffPacket`、packet preview、review checklist、blocked operations を追加する。
3. Renderer は `Action handoff draft` に checklist chips と blocked operations summary を表示し、`Copy handoff packet` で packet 全体を clipboard にコピーする。
4. review checklist は source action、local scope、execution guard、clean-room reuse prohibition を明示し、空 queue では packet copy を無効化する。
5. この切片では assistant 実行、browser automation、scheduler store write、cloud sync、external MCP、OCI GenAI call、BrowserOS source / asset / UI implementation reuse は行わない。
6. 検証は `pnpm --filter @ai-launchpad/browser test:knowledge`、`pnpm typecheck`、`pnpm lint`、`pnpm --filter @ai-launchpad/browser build`、`git diff --check`、Playwright smoke（New Tab Result Inbox Handoff Packet）で行う。

## 第99実装切片

1. 第98切片の local handoff packet を、assistant へ渡す前に人が確認できる `Review draft preview` として再構成する。
2. `shared/browserSchedulerRegistry.ts` に `BrowserScheduledTaskNewTabInboxActionReviewDraftPreview` contract を追加し、packet、回答形式、禁止事項、output sections、metadata、copy-only action を返す。
3. Renderer は `Action handoff draft` 内に `Review draft preview` を表示し、draft preview、packet / checks / blocked metadata、output section cards、`Copy review draft` button を提供する。
4. review draft は clipboard 用 local text のみを生成し、assistant auto-run、browser automation、scheduler store write、cloud sync、external MCP、OCI GenAI call は開始しない。
5. この切片では assistant 実行、browser automation、scheduler store write、cloud sync、external MCP、OCI GenAI call、BrowserOS source / asset / UI implementation reuse は行わない。
6. 検証は `pnpm --filter @ai-launchpad/browser test:knowledge`、`pnpm typecheck`、`pnpm lint`、`pnpm --filter @ai-launchpad/browser build`、`git diff --check`、Playwright smoke（New Tab Result Inbox Review Draft）で行う。

## 第100実装切片

1. 第99切片の `Review draft preview` を、human review の次アクションに変換する `Review decision preview` として拡張する。
2. `shared/browserSchedulerRegistry.ts` に `BrowserScheduledTaskNewTabInboxActionReviewDecisionPreview` contract を追加し、source priority から推奨 decision、decision note、next actions、metadata、copy-only action を返す。
3. Renderer は `Review draft preview` 内に `Review decision preview` を表示し、decision badge、reason、decision note preview、metadata、next action cards、`Copy decision note` button を提供する。
4. decision preview は renderer local state の提案だけを表示し、保存、assistant auto-run、browser automation、scheduler store write、cloud sync、external MCP、OCI GenAI call は開始しない。
5. この切片では assistant 実行、browser automation、scheduler store write、cloud sync、external MCP、OCI GenAI call、BrowserOS source / asset / UI implementation reuse は行わない。
6. 検証は `pnpm --filter @ai-launchpad/browser test:knowledge`、`pnpm typecheck`、`pnpm lint`、`pnpm --filter @ai-launchpad/browser build`、`git diff --check`、Playwright smoke（New Tab Result Inbox Review Decision）で行う。

## 第101実装切片

1. 第100切片の `Review decision preview` を、source result に戻る local route として扱える `Decision route preview` に拡張する。
2. `shared/browserSchedulerRegistry.ts` に `BrowserScheduledTaskNewTabInboxActionDecisionRoutePreview` contract を追加し、handoff の source action、decision metadata、route cards、renderer state 更新用 primary action を返す。
3. Renderer は `Review decision preview` 内に `Decision route preview` を表示し、decision / source / routes metadata、route card、`Open source result` button を提供する。
4. `Open source result` は renderer state の `taskId` / `runId` 選択だけを更新し、assistant 実行、browser automation、scheduler store write、cloud sync、external MCP、OCI GenAI call は開始しない。
5. この切片では BrowserOS source / asset / UI implementation reuse は行わず、clean-room の local review flow だけを本リポジトリの型と UI で実装する。
6. 検証は `pnpm --filter @ai-launchpad/browser test:knowledge`、`pnpm typecheck`、`pnpm lint`、`pnpm --filter @ai-launchpad/browser build`、`git diff --check`、Playwright smoke（New Tab Result Inbox Decision Route）で行う。
