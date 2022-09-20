import { Router } from '@deps';

import { getBooks } from '@controllers/books.controller.ts';

const router = new Router();

router.get("/", getBooks);

export default router.routes();