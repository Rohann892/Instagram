import express from 'express'
import isAuthenticated from '../middlewares/Auth.js';
import upload from '../middlewares/multer.js';
import { addComment, addPost, bookmarkPost, deletePost, dislikePost, getAllpost, getCommentOfPost, getUserPost, likePost } from '../controllers/postController.js';

const router = express.Router();


router.route('/addPost').post(isAuthenticated, upload.single('image'), addPost);
router.route('/all').get(isAuthenticated, getAllpost);
router.route('/userPost/all').get(isAuthenticated, getUserPost);
router.route('/:id/like').post(isAuthenticated, likePost);
router.route('/:id/dislike').post(isAuthenticated, dislikePost);
router.route('/:id/comment').post(isAuthenticated, addComment);
router.route('/:id/comment/all').get(isAuthenticated, getCommentOfPost);
router.route('/delete/:id').post(isAuthenticated, deletePost);
router.route('/:id/bookmark').post(isAuthenticated, bookmarkPost);


export default router;