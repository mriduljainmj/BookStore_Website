const express = require('express');

const { check,body} = require('express-validator/check');

const authController = require('../controllers/auth')
const router = express.Router();

router.get('/login',authController.getLogin);

router.post('/login',
check('email').isEmail().withMessage('Please enter a valid E-mail'),
authController.postLogin);

router.post('/logout',authController.postLogout);

router.get('/signup',authController.getSignup);

router.post('/signup', 
check('email').isEmail().withMessage('Please enter a valid E-mail').normalizeEmail(),
check('password','Please enter a password more than 5 characters').isLength({min:5}).isAlphanumeric(),
body('confirmpassword').custom((value,{req})=> {
    if(value !==  req.body.password){
        throw new Error('Password does not match.');
    }
    return true;
}),
authController.postSignup);

router.get('/resetpass',authController.getReset);

router.post('/resetpass',authController.postReset);

router.get('/resetpass/:token',authController.getNewPass); 

router.post('/newpass',authController.postNewpass); 

module.exports = router