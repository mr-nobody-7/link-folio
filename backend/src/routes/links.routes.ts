import { Router } from 'express';
import {
  getLinks,
  createLink,
  updateLinks,
  deleteLink,
} from '../controllers/links.controller.js';
import { authenticateToken } from '../middleware/index.js';
import { validate } from '../middleware/validate.js';
import {
  createLinkSchema,
  updateLinksSchema,
} from '../validation/links.validation.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', getLinks);
router.post('/', validate(createLinkSchema), createLink);
router.put('/', validate(updateLinksSchema), updateLinks);
router.delete('/:linkId', deleteLink);

export default router;
