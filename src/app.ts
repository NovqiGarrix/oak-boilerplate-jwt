// deno-lint-ignore-file no-explicit-any
import { Application, Router, configAsync, oakCors } from '@deps';

import V1Router from '@routers/v1/index.ts';
import requestLogger from '@middlewares/requestLogger.ts';
import jwt from './utils/jwt.ts';

const env = await configAsync();

export default function createServer(): Application<Record<string, any>> {
    const CLIENT_URL = Deno.env.get("CLIENT_URL") || env.CLIENT_URL;
    const DASHBOARD_URL = Deno.env.get("DASHBOARD_URL") || env.DASHBOARD_URL;

    const DENO_ENV = Deno.env.get("DENO_ENV") || env.DENO_ENV || "dev";
    const IS_PROD = DENO_ENV === "prod";

    const app = new Application({ state: { IS_PROD } });
    const router = new Router();

    app.use(oakCors({
        credentials: true,
        methods: ["GET", "POST", "DELETE"],
        origin: [CLIENT_URL, DASHBOARD_URL],
        preflightContinue: true
    }));

    // Logger
    app.use(requestLogger);

    router.get("/", async ({ response }) => {
        response.status = 200;
        response.body = {
            data: "Hello, World",
            error: null,
            jwt: await jwt.sign({ data: "Hello, World" }, 60)
        }
    });

    router.use("/api/v1", V1Router);

    app.use(router.routes());
    app.use(router.allowedMethods())

    return app;
}