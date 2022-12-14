import { configAsync } from '@deps';

import createServer from '@app';
import logger from '@utils/logger.ts';
import jwt from '@utils/jwt.ts';

const env = await configAsync();
const abortController = new AbortController();

const DENO_ENV = Deno.env.get("DENO_ENV") || env.DENO_ENV || "dev";
const IS_PROD = DENO_ENV === "prod";

const PORT = +(Deno.env.get("PORT") || env.PORT) || 4000;

const app = createServer();

const signals = ["SIGINT", "SIGTERM"];
for (let systemSignal of signals) {
    if (Deno.build.os === "windows" && systemSignal === "SIGTERM") {
        systemSignal = "SIGBREAK"
    }
    Deno.addSignalListener(systemSignal as Deno.Signal, () => {
        logger.warning(`Received ${systemSignal}, exiting...`.toUpperCase());
        Deno.exit(0);
    })
}

globalThis.addEventListener("unload", () => {
    // Close the server everytime Deno exits or restarts, to prevent duplicate opened ports
    abortController.abort();
})

app.addEventListener("listen", ({ hostname, port, serverType }) => {
    logger.info(`Listening on ${hostname}:${port} with ${serverType} SERVER`.toUpperCase());

    logger.info(`SETTING UP JWT KEY`);
    jwt.setKey()
        .then(() => logger.info(`JWT KEY IS SET UP!`))
        .catch((error) => {
            logger.error(error.message);
            Deno.exit(1);
        });
})

await app.listen({
    port: PORT,
    // Use localhost instead of localhost ip addr (127.0.0.1) in development mode
    hostname: IS_PROD ? undefined : "localhost",
    signal: abortController.signal
});