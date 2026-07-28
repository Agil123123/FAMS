export interface IUser {
  id: string;
  email: string;
  username: string;
  full_name: string;
  avatar?: string;
  roles: string[];
  permissions: string[];
}

export interface ILoginResponse {
  user: IUser;
  access_token: string;
  refresh_token: string;
}

export interface IToken {
  access_token: string;
  refresh_token: string;
}

export interface LoginCredentials {
  username?: string;
  email?: string;
  password?: string;
}

export type AuthResponse = ILoginResponse;
