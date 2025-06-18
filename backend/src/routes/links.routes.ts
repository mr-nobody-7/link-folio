import { Router } from 'express';
import {
  getLinks,
  createLink,
  updateLinks,
  deleteLink,
} from '../controllers/links.controller.js';
import { authenticateToken } from '../middleware/index.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', getLinks);
router.post('/', createLink);
router.put('/', updateLinks);
router.delete('/:linkId', deleteLink);

export default router;
