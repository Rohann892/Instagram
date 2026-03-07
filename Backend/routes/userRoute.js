import express from 'express'
import { editProfile, followOrUnfollow, getMyProfile, getSuggestedUser, login, logout, register } from '../controllers/userController.js';
import isAuthenticated from '../middlewares/Auth.js';
import upload from '../middlewares/multer.js';

const router = express.Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/profile').get(isAuthenticated, getMyProfile)
router.route('/profile/edit').post(isAuthenticated, upload.single('profileImage'), editProfile)
router.route('/suggested').get(isAuthenticated, getSuggestedUser);
router.route('/followOrUnfollow/:id').post(isAuthenticated, followOrUnfollow)


export default router;