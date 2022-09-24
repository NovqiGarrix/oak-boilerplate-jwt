import jwt from "@utils/jwt.ts";
import logger from "@utils/logger.ts";

/**
 * Run this function by using `deno tasks pre`
 * 
 * It will store the JWT Key in Redis, so when the server is restarted, the JWT Key will still be the same.
 * You can use something other than Redis, such as File, Mongodb, or another such thing.
 * 
 * I'd like to use Redis because it's fast and easy to use.
 */
await jwt.exportKey()
    .then((jwtKey) => {
        logger.success(`🔑 YOUR JWT KEY: ${jwtKey}`);
        Deno.exit(0);
    })
    .catch((error) => {
        logger.error(`${error.message} in Pre.ts`);
        Deno.exit(1);
    })