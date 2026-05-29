# ai-launchpad-for-oracle

AI-powered sales enablement platform, browser client, and local OCI connector for Oracle AI Database, OCI AI services, demos, and PoC acceleration.

## Browser Client MVP

最初の実装対象は Electron ベースの Browser Client です。Electron 実行時は中央の Browser Surface が実ページを読み込みます。Web Platform、Local Connector、OCI、実 RAG にはまだ接続せず、workspace / playbook / AI sidebar は mock データで cockpit 体験を確認します。

現在の MVP では、保存した page / selection / screenshot capture を右カラムの Knowledge に追加し、local keyword retrieval による source selection、chunk preview、deterministic grounded answer を確認できます。これは後続の Web Platform API、Local Connector、Oracle AI Database / Vector Search 連携に差し替えるための UI と state 境界です。

RAG の実行境界は `ragAdapter.askKnowledge` として preload / IPC に分離しています。renderer preview では同じ local keyword adapter を直接呼び、Electron 実行時は main process の `rag:ask-knowledge` handler を経由します。Oracle Vector adapter は Electron 実行時に Local Connector worker の `oracleVectorSearch` request を呼び出し、renderer preview では同じ dry-run contract を local に実行します。RAG Workspace では `Local` と `Oracle Vector` の adapter を切り替えられます。`Oracle Vector` は skeleton のみで、connection / table / vector column / text column / embedding model / top K の設定を local state に保存します。必須項目が揃うまでは `not_configured`、揃った後は既定で `dry_run` を返し、SQL preview と bind contract を表示します。Live モード（後述）を有効にすると、Electron 実行時に worker が Oracle AI Database へ実 Vector Search を発行し、`executed` ステータスと近傍 row を返します。Oracle Vector panel からは `localConnector.health` と `localConnector.ociCheckConfig` を実行でき、現在は mock connector / OCI 未設定の診断結果を表示します。

Local Connector 側には `localConnector` の IPC boundary を追加しています。main process は `utilityProcess` で Local Connector worker を起動し、`health`、`ociCheckConfig`、`sqlclCheck`、`adbWalletCheck`、`objectStorageCheck`、`generatePocAssets`、`oracleVectorSearch` を request / response protocol で呼び出します。`ociCheckConfig` は `OCI_CONFIG_FILE` または `~/.oci/config` を確認し、profile、必須フィールド、key_file の読み取り可否だけを返します。tenancy / user / fingerprint / private key の実値は UI に返しません。現時点では worker 内の `executeOracleVectorSearchDryRun` が設定不足、安全でない Oracle identifier、SQL preview、SQLcl script preview、embedding bind 予定を構造化して返します。Electron 経由の Oracle Vector dry-run では SQLcl と ADB wallet の readiness も同じ execution result に添付します。

### Oracle Vector Search Live モード

Live モードは optional です。既定では dry-run のままで、driver と credential が揃った場合のみ実 DB 呼び出しに切り替わります。有効化手順:

1. `pnpm --filter @ai-launchpad/browser add oracledb` で oracledb driver（thin mode）を追加する。
2. 以下の環境変数を Electron 起動プロセスに設定する。credential は Local Connector worker の `process.env` からのみ読み取り、LLM prompt / renderer / UI には返しません。

   - `AI_LAUNCHPAD_ORACLE_VECTOR_LIVE=1`（Live 実行を有効化）
   - `ORACLE_VECTOR_USER` / `ORACLE_VECTOR_PASSWORD` / `ORACLE_VECTOR_CONNECT_STRING`（必須）
   - `ORACLE_VECTOR_WALLET_DIR` / `ORACLE_VECTOR_WALLET_PASSWORD`（ADB mTLS wallet を使う場合）

3. Oracle Vector panel で connection / table / vector column / text column / embedding model / top K を設定する。table・各 column・embedding model は Oracle identifier として再検証され、`VECTOR_EMBEDDING(<model> USING :query_text AS data)` による in-DB embedding で `VECTOR_DISTANCE` 検索を実行します。

driver 未インストール、credential 不足、接続失敗のいずれの場合も `executeLiveOracleVectorSearch` は安全に dry-run へ fallback し、fallback 理由を execution result の `validationErrors` に残します。実行ロジックは `src/main/oracleVectorSearchExecutor.ts` にあり、純粋関数（readiness 判定・SQL 生成）は単体テスト済みです。

### OCI Generative AI Live モード

Grounded Answer の回答本文は既定では deterministic ですが、OCI Generative AI (Enterprise AI project) を有効にすると、検索済み context を根拠とした実生成回答へ差し替わります。OCI GenAI は OpenAI 互換 API として `openai` SDK 経由で呼び出します（oci-sdk は使用しません）。credential は Local Connector / main の `process.env` からのみ読み取り、renderer / UI / prompt には返しません。有効化手順:

1. `pnpm --filter @ai-launchpad/browser add openai` で openai SDK を追加する。
2. 以下の環境変数を Electron 起動プロセスに設定する。

   - `AI_LAUNCHPAD_OCI_GENAI_LIVE=1`（GenAI 生成を有効化）
   - `OCI_GENAI_BASE_URL`（Enterprise AI project の OpenAI 互換 inference endpoint）
   - `OCI_GENAI_API_KEY`（project の API key）
   - `OCI_GENAI_MODEL`（モデル / deployment 名、例 `cohere.command-r`）

3. local-keyword / Oracle Vector いずれの adapter でも、検索 context が 1 件以上ある場合に `generateOciGenAiAnswer` が回答を実生成し、`answerProvider: "oci-genai"` を返します。SDK 未インストール・設定不足・呼び出し失敗時は deterministic answer にそのまま fallback します。実行ロジックは `src/main/ociGenAiExecutor.ts` にあり、純粋関数（readiness 判定・prompt 生成）は単体テスト済みです。

PoC Assets panel では、現在の workspace / playbook / connector 設定から README、proposal section、follow-up email、Mermaid architecture diagram、`.env.example`、demo script、SQL、Python、Terraform、checklist、troubleshooting guide、handover document の starter template を生成できます。生成物は preview、clipboard export、Markdown bundle download のみで、OCI API、DB 接続、Terraform apply は実行しません。

Knowledge には browser capture に加えて `.md` / `.txt` 文書を追加できます。Electron 実行時は file dialog から読み込み、renderer preview ではブラウザーの file input で読み込みます。現在の上限は 1 MB です。Grounded Answer は、question、answer、adapter status、source evidence、Oracle Vector dry-run plan を Markdown として clipboard copy / download できます。Oracle Vector dry-run plan の SQL preview は、個別に clipboard copy / `.sql` download できます。

```powershell
pnpm install
pnpm --filter @ai-launchpad/browser dev
```

Electron を起動できない環境で UI だけ確認する場合は、同じ React UI を renderer preview として起動します。この場合、Browser Surface は mock fallback 表示になります。

```powershell
pnpm --filter @ai-launchpad/browser dev:renderer
```

検証:

```powershell
pnpm --filter @ai-launchpad/browser typecheck
pnpm --filter @ai-launchpad/browser lint
pnpm --filter @ai-launchpad/browser test:knowledge
pnpm --filter @ai-launchpad/browser build
```
