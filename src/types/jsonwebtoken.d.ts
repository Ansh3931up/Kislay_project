declare module 'jsonwebtoken' {
  export type Secret = string | Buffer | { key: string | Buffer, passphrase: string };
  
  export interface SignOptions {
    algorithm?: string;
    expiresIn?: string | number;
    notBefore?: string | number;
    audience?: string | string[];
    issuer?: string;
    jwtid?: string;
    subject?: string;
    noTimestamp?: boolean;
    header?: object;
    keyid?: string;
    mutatePayload?: boolean;
  }
  
  export interface VerifyOptions {
    algorithms?: string[];
    audience?: string | RegExp | Array<string | RegExp>;
    complete?: boolean;
    issuer?: string | string[];
    jwtid?: string;
    ignoreExpiration?: boolean;
    ignoreNotBefore?: boolean;
    subject?: string;
    clockTolerance?: number;
    maxAge?: string | number;
    clockTimestamp?: number;
  }
  
  export interface DecodeOptions {
    complete?: boolean;
    json?: boolean;
  }
  
  export type VerifyCallback = (err: Error | null, decoded: object | string | undefined) => void;
  export type SignCallback = (err: Error | null, token: string | undefined) => void;
  
  export function sign(
    payload: string | object | Buffer,
    secretOrPrivateKey: Secret,
    options?: SignOptions
  ): string;
  
  export function sign(
    payload: string | object | Buffer,
    secretOrPrivateKey: Secret,
    callback: SignCallback
  ): void;
  
  export function sign(
    payload: string | object | Buffer,
    secretOrPrivateKey: Secret,
    options: SignOptions,
    callback: SignCallback
  ): void;
  
  export function verify(
    token: string,
    secretOrPublicKey: Secret,
    options?: VerifyOptions
  ): object | string;
  
  export function verify(
    token: string,
    secretOrPublicKey: Secret,
    callback: VerifyCallback
  ): void;
  
  export function verify(
    token: string,
    secretOrPublicKey: Secret,
    options: VerifyOptions,
    callback: VerifyCallback
  ): void;
  
  export function decode(
    token: string,
    options?: DecodeOptions
  ): null | { [key: string]: unknown } | string;
} 