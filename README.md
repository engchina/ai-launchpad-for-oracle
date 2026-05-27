# ai-launchpad-for-oracle

AI-powered sales enablement platform, browser client, and local OCI connector for Oracle AI Database, OCI AI services, demos, and PoC acceleration.

## Browser Client MVP

最初の実装対象は Electron ベースの Browser Client です。Electron 実行時は中央の Browser Surface が実ページを読み込みます。Web Platform、Local Connector、OCI、実 RAG にはまだ接続せず、workspace / playbook / AI sidebar は mock データで cockpit 体験を確認します。

現在の MVP では、保存した page / selection / screenshot capture を右カラムの Knowledge に追加し、local keyword retrieval による source selection、chunk preview、deterministic grounded answer を確認できます。これは後続の Web Platform API、Local Connector、Oracle AI Database / Vector Search 連携に差し替えるための UI と state 境界です。

RAG の実行境界は `ragAdapter.askKnowledge` として preload / IPC に分離しています。renderer preview では同じ local keyword adapter を直接呼び、Electron 実行時は main process の `rag:ask-knowledge` handler を経由します。Oracle Vector adapter は Electron 実行時に Local Connector worker の `oracleVectorSearch` request を呼び出し、renderer preview では同じ dry-run contract を local に実行します。RAG Workspace では `Local` と `Oracle Vector` の adapter を切り替えられます。`Oracle Vector` は skeleton のみで、connection / table / vector column / text column / embedding model / top K の設定を local state に保存します。必須項目が揃うまでは `not_configured`、揃った後は `dry_run` を返し、SQL preview と bind contract を表示します。実 DB 呼び出しはまだ行いません。Oracle Vector panel からは `localConnector.health` と `localConnector.ociCheckConfig` を実行でき、現在は mock connector / OCI 未設定の診断結果を表示します。

Local Connector 側には `localConnector` の IPC boundary を追加しています。main process は `utilityProcess` で Local Connector worker を起動し、`health`、`ociCheckConfig`、`sqlclCheck`、`adbWalletCheck`、`objectStorageCheck`、`generatePocAssets`、`oracleVectorSearch` を request / response protocol で呼び出します。`ociCheckConfig` は `OCI_CONFIG_FILE` または `~/.oci/config` を確認し、profile、必須フィールド、key_file の読み取り可否だけを返します。tenancy / user / fingerprint / private key の実値は UI に返しません。現時点では worker 内の `executeOracleVectorSearchDryRun` が設定不足、安全でない Oracle identifier、SQL preview、embedding bind 予定を構造化して返します。次フェーズではこの worker に実 Oracle DB call を追加します。

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
