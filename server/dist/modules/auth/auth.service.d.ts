interface TokenPayload {
    id: string;
    email: string;
    role: string;
}
export declare class AuthService {
    static generateAccessToken(payload: TokenPayload): string;
    static generateRefreshToken(payload: TokenPayload): string;
    static verifyAccessToken(token: string): TokenPayload;
    static verifyRefreshToken(token: string): TokenPayload;
}
export {};
//# sourceMappingURL=auth.service.d.ts.map