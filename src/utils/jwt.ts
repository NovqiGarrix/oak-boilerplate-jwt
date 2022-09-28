import { createJWT, encodeBase64, verifyJWT, configAsync, decodeBase64 } from '@deps';

const env = await configAsync();

function str2ab(str: string) {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

export interface JWTPayload {
    [propName: string]: unknown
}

class JsonWebToken {
    public key: CryptoKey | undefined = undefined;

    /**
     * Generate CryptoKey
     * @returns CryptoKey
     */
    generateKey(): Promise<CryptoKey> {
        return crypto.subtle.generateKey(
            {
                name: "HMAC",
                hash: "SHA-512"
            },
            true, ["sign", "verify"]
        )
    }

    /**
     * @description Get the exported CryptoKey from Redis, and import it as CryptoKey to be used for signing and verifying
     * This function also will set the CryptoKey to the class variable property.
     */
    async setKey(): Promise<void> {
        const exportedKey = Deno.env.get("JWT_KEY") || env.JWT_KEY;
        if (!exportedKey) throw new Error("JWT Key hasn't initialized yet!");

        const decoder = new TextDecoder();

        const decodedStringKey = decoder.decode(decodeBase64(exportedKey));
        const exportedArrayBuffer = str2ab(decodedStringKey);
        this.key = await crypto.subtle.importKey("raw", exportedArrayBuffer, {
            name: "HMAC",
            hash: "SHA-512"
        }, true, ["sign", "verify"]);
    }

    /**
     * @description Generate a CryptoKey and export it to be stored in Redis
     */
    async exportKey(): Promise<string> {
        const decoder = new TextDecoder();

        const key = await this.generateKey();

        const exportedKey = await crypto.subtle.exportKey("raw", key);
        const exportedString = decoder.decode(exportedKey);
        const exportedBase64 = encodeBase64(exportedString);

        return exportedBase64;
    }

    /**
     * @description Sign a JWT
     * 
     * @param payload 
     * @param expiresIn in seconds
     * @returns 
     */
    async sign(payload: JWTPayload, expiresIn: number) {
        if (!this.key) await this.setKey();
        return createJWT({ alg: "HS512" }, { ...payload, exp: Date.now() + (expiresIn * 1000) }, this.key!);
    }

    /**
     * @description Verify a JWT
     * 
     * @param jwt 
     * @returns 
     */
    async verify<T>(jwt: string): Promise<T | null> {
        if (!this.key) await this.setKey();
        const { _aud, _iat, _iss, _jti, _nbf, _sub, exp, ...payload } = await verifyJWT(jwt, this.key!);

        const now = Date.now();
        if (now >= (exp ?? Date.now())) return null;

        return payload as unknown as T;
    }
}

const jwt = new JsonWebToken();
export default jwt;