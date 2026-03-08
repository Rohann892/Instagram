import express from 'express'
import isAuthenticated from '../middlewares/Auth.js';
import { getMessages, sendMessage } from '../controllers/messageController.js';

const router = express.Router();


router.route('/sendMessage/:id').post(isAuthenticated, sendMessage);
router.route('/getMessage/:id').get(isAuthenticated, getMessages);


export default router;