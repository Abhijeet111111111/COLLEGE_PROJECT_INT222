import authController from '../controllers/authController.js'
import express from 'express';
import userController from '../controllers/userControllers.js';

const router = express.Router();



router.route('/signup').post(authController.signup)
router.route('/login').post(authController.login);
router.get('/logout', authController.logout);


router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetPassword/:token').patch(authController.resetPassword); // should be patch , know why ??????

// protect all routes after this middleware :-
router.use(authController.protect);

router.patch('/updatePassword', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);
router.put('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe)

// Access only by admin :-
router.use(authController.restrictTo('admin'))
router
    .route('/')
    .get(userController.getUsers)
    .post(userController.makeUser)


router
    .route('/:id')
    .delete(userController.deleteUser)
    .patch(userController.updateUser)
    .get(userController.getUser);

export default router