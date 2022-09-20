import { Router } from '@deps';

import BooksRoutes from './books.route.ts'

const router = new Router();

router.use("/books", BooksRoutes);

export default router.routes();