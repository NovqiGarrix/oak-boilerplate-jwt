import { fail, describe, it, expect, equal, afterAll, beforeAll } from '@testDeps';

import jwt from '@utils/jwt.ts';
import { RedisClient } from '@utils/redisClient.ts';
import { Redis } from '../deps.ts';

describe("JSON Web Token Utility Unit Tests", () => {

    let redisClient: Redis;
    beforeAll(async () => {
        redisClient = await RedisClient.getClient();
    })


    it("Should generate CryptoKey", async () => {
        const key = await jwt.generateKey();

        const isKey = key instanceof CryptoKey;
        if (!isKey) fail("Key is not an instance of CryptoKey");
    })

    it("Should export CryptoKey", async () => {

        await jwt.exportKey();

        const jwtKey = await redisClient.get(jwt.redisKey);

        expect(jwtKey).toBeDefined();

        await redisClient.del(jwt.redisKey);

    })

    it("It should set the exported CyrptoKey to the class key variable", async () => {

        await jwt.exportKey();

        await jwt.setKey();

        const jwtKey = await redisClient.get(jwt.redisKey);

        expect(jwtKey).toBeDefined();
        expect(jwt.key).toBeDefined();

        expect(jwt.key).toBeInstanceOf(CryptoKey);

        await redisClient.del(jwt.redisKey);

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

        afterAll(async () => {
            await redisClient.del(jwt.redisKey);
        })

    })

    afterAll(() => RedisClient.closeClient());

})