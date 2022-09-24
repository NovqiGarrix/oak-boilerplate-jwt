import { fail, describe, it, expect, equal, beforeAll } from '@testDeps';

import jwt from '@utils/jwt.ts';

describe("JSON Web Token Utility Unit Tests", () => {

    it("Should generate CryptoKey", async () => {
        const key = await jwt.generateKey();

        const isKey = key instanceof CryptoKey;
        if (!isKey) fail("Key is not an instance of CryptoKey");
    })

    it("It should set the exported CyrptoKey to the class key variable", async () => {

        await jwt.exportKey();
        await jwt.setKey();

        expect(jwt.key).toBeDefined();
        expect(jwt.key).toBeInstanceOf(CryptoKey);

    })

    describe("Sign & Verify JWT Token", () => {

        beforeAll(async () => {
            await jwt.exportKey();
            await jwt.setKey();
        })

        const payload = {
            name: "John Doe",
            email: "johdoe@gmail.com"
        }

        let jwtToken: string;

        it("Should create a JWT Token", async () => {
            jwtToken = await jwt.sign(payload, 60);
            expect(jwtToken).toBeDefined();
        })

        it("Should return the original payload", async () => {
            const decodedPayload = await jwt.verify<typeof payload>(jwtToken);
            equal(payload, decodedPayload);
        })

    })

})