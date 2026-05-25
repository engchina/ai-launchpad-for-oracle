import type {
  AdbWalletCheckResult,
  LocalConnectorHealth,
  GeneratePocAssetsPayload,
  GeneratePocAssetsResult,
  ObjectStorageCheckResult,
  OciCheckConfigResult,
  OracleVectorSearchExecutionPayload,
  OracleVectorSearchExecutionResult,
  SqlclCheckResult
} from "../shared/api";

export type LocalConnectorRequestPayloadByType = {
  health: undefined;
  ociCheckConfig: undefined;
  sqlclCheck: undefined;
  adbWalletCheck: undefined;
  objectStorageCheck: undefined;
  generatePocAssets: GeneratePocAssetsPayload;
  oracleVectorSearch: OracleVectorSearchExecutionPayload;
};

export type LocalConnectorResponsePayloadByType = {
  health: LocalConnectorHealth;
  ociCheckConfig: OciCheckConfigResult;
  sqlclCheck: SqlclCheckResult;
  adbWalletCheck: AdbWalletCheckResult;
  objectStorageCheck: ObjectStorageCheckResult;
  generatePocAssets: GeneratePocAssetsResult;
  oracleVectorSearch: OracleVectorSearchExecutionResult;
};

export type LocalConnectorRequestType = keyof LocalConnectorRequestPayloadByType;

export type LocalConnectorRequestFor<T extends LocalConnectorRequestType> = {
  requestId: string;
  type: T;
  payload: LocalConnectorRequestPayloadByType[T];
};

export type LocalConnectorRequest = {
  [T in LocalConnectorRequestType]: LocalConnectorRequestFor<T>;
}[LocalConnectorRequestType];

export type LocalConnectorSuccessResponseFor<T extends LocalConnectorRequestType> = {
  requestId: string;
  type: T;
  ok: true;
  payload: LocalConnectorResponsePayloadByType[T];
};

export type LocalConnectorErrorResponseFor<T extends LocalConnectorRequestType> = {
  requestId: string;
  type: T;
  ok: false;
  error: {
    message: string;
  };
};

export type LocalConnectorSuccessResponse = {
  [T in LocalConnectorRequestType]: LocalConnectorSuccessResponseFor<T>;
}[LocalConnectorRequestType];

export type LocalConnectorErrorResponse = {
  [T in LocalConnectorRequestType]: LocalConnectorErrorResponseFor<T>;
}[LocalConnectorRequestType];

export type LocalConnectorResponse = LocalConnectorSuccessResponse | LocalConnectorErrorResponse;
