import type { ObjectStorageCheckResult } from "../shared/api";

export type ObjectStorageProbeOptions = {
  namespace?: string;
  bucketName?: string;
  region?: string;
};

const bucketNamePattern = /^[A-Za-z0-9._-]{1,255}$/;

function normalize(value: string | undefined): string {
  return value?.trim() ?? "";
}

function getConfig(options: ObjectStorageProbeOptions): Required<ObjectStorageProbeOptions> {
  return {
    namespace: normalize(options.namespace ?? process.env.OCI_OBJECT_STORAGE_NAMESPACE),
    bucketName: normalize(options.bucketName ?? process.env.OCI_OBJECT_STORAGE_BUCKET),
    region: normalize(options.region ?? process.env.OCI_REGION)
  };
}

export function checkObjectStorage(options: ObjectStorageProbeOptions = {}): ObjectStorageCheckResult {
  const config = getConfig(options);
  const checks = [
    {
      name: "namespace",
      ok: Boolean(config.namespace),
      message: config.namespace
        ? "Object Storage namespace を確認しました。"
        : "OCI_OBJECT_STORAGE_NAMESPACE が未設定です。"
    },
    {
      name: "bucket",
      ok: Boolean(config.bucketName) && bucketNamePattern.test(config.bucketName),
      message: !config.bucketName
        ? "OCI_OBJECT_STORAGE_BUCKET が未設定です。"
        : bucketNamePattern.test(config.bucketName)
          ? "Object Storage bucket name の形式を確認しました。"
          : "Object Storage bucket name に使用できない文字、または長すぎる値が含まれています。"
    },
    {
      name: "region",
      ok: Boolean(config.region),
      message: config.region ? "OCI region を確認しました。" : "OCI_REGION が未設定です。"
    }
  ];
  const failedChecks = checks.filter((check) => !check.ok);

  if (failedChecks.length > 0) {
    const missingConfig = failedChecks.some((check) => check.name !== "bucket" || !config.bucketName);
    return {
      status: missingConfig ? "not-configured" : "invalid",
      namespace: config.namespace || undefined,
      bucketName: config.bucketName || undefined,
      region: config.region || undefined,
      message:
        missingConfig
          ? "Object Storage check に必要な設定が不足しています。実 OCI API 呼び出しはまだ実行していません。"
          : "Object Storage bucket name の形式に問題があります。実 OCI API 呼び出しはまだ実行していません。",
      checks
    };
  }

  return {
    status: "ready",
    namespace: config.namespace,
    bucketName: config.bucketName,
    region: config.region,
    message: "Object Storage check の設定を確認しました。実 OCI API 呼び出しはまだ実行していません。",
    checks
  };
}
