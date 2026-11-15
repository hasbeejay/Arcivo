export type TokenType = 'access' | 'refresh' | 'extension';

export interface JwtPayload {
  sub: string;
  email: string;
  type: TokenType;
  iat?: number;
  exp?: number;
}

export interface AuthRequestUser {
  id: string;
  email: string;
  tokenType: Exclude<TokenType, 'refresh'>;
}
