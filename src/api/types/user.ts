export interface LoginResponse {
  session_id: string;
  access_token: string;
  access_token_expires_at: string;
  RefreshToken: string;
  RefreshTokenExpiresAt: string;
}

export interface LoadUserResponse {
  uid: string;
  name: string;
  role: string;
  walletAddress: string;
  signature: string;
}

export interface UserDetailResponse {
  referral_storage: number;
  storage_used: number;
}
