import { Router } from 'express';
import { getMessages, postMessage } from '../controllers/message.controller';

const router = Router();

router.get('/:username', getMessages);
router.post('/:username', postMessage);

export default router;
