export interface CliLoginState {
  message: string;
  isComplete: boolean;
  isLoading: boolean;
  error?: string;
}

export interface CliTokenExchangeResponse {
  customToken: string;
}

export interface CliTokenRequest {
  token: string;
}