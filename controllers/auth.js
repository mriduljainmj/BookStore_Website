const crypto = require('crypto');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { validationResult} = require('express-validator/check');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const user = require('../models/user');

const transporter = nodemailer.createTransport(sendgridTransport({
    auth:{
        api_key: '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'
    }
}))

exports.getLogin = (req, res, next) => {
    let message = req.flash('error');
    if(message.length>0){
        message  = message[0]
    }else{
        message =null;
    }
    res.render('auth/login', {
      path: '/login',
      pageTitle: "Login",
      isAuthenticated : false,
      errorMessage: message,
      oldInput: {
        email:null,
        password:null}
    });
};

exports.getSignup = (req,res,next) =>{
    let message = req.flash('er');
    if(message.length>0){
        message  = message[0]
    }else{
        message =null;
    }
    res.render('auth/signup',{
        path:'/signup',
        pageTitle:'Signup',
        isAuthenticated: false,
        errorMessage:message,
        oldInput: {
            name:null,
            email:null,
            password:null,
            confirmpassword:null
        }
    })
}
  

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req)
      if(!errors.isEmpty()){
          console.log(errors.array())
          return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: "Login",
            isAuthenticated : false,
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email:email,
                password:password,
            }
        });
      }
    User.findOne({email:email})
      .then(user => {
          if(!user){
            req.flash('error','E-mail does not exists.')
            console.log('no user found');
            return res.redirect('/login');
          }
        bcrypt.compare(password, user.password)
     .then((doMatch)=>{
        if(doMatch){
            console.log('Logged In')
            req.session.isLoggedin = true;
            req.session.user = user;
            return req.session.save(err => {
            console.log(err);
            return res.redirect('/');
        });
            }     
            req.flash('error','Invalid Password')
            res.redirect('/login')
        })
        .catch(()=>{
            res.redirect('/login')
        })
        
      })
      .catch(err => console.log(err));
  };

  exports.postSignup = (req,res,next) =>{
      const name = req.body.name;
      const email = req.body.email;
      const password = req.body.password;
      const confirmpass = req.body.confirmpassword;
      const errors = validationResult(req)
      if(!errors.isEmpty()){
          console.log(errors.array())
          return res.status(422).render('auth/signup',{
            path:'/signup',
            pageTitle:'Signup',
            isAuthenticated: false,
            errorMessage: errors.array()[0].msg,
            oldInput: {
                name:name,
                email:email,
                password:password,
                confirmpassword: confirmpass
            }
        });
      }
      User.findOne({email:email})
      .then((userDoc)=>{
          if(userDoc){
              req.flash('er','Email already exists.');
              return res.redirect('/signup');
          }
          return bcrypt.hash(password, 12)
      .then((hpassword)=>{
        const user = new User({
            name:name,
            email:email,
            password:hpassword,
            cart:{items:[]}
        })
        return user.save();
      })
    
      .then(()=>{
        res.redirect('/login')
             return transporter.sendMail({
              to: email,
              from:'workwithmj27@gmail.com',
              subject:'Signup Successfull!!',
              html:'<h1>You successfully signed up!</h1>'
          })
      })
      .catch(err=>console.log(err));
    })
      .catch(err=>console.log(err))
  }

exports.postLogout = (req, res, next) => {
    req.session.destroy((err)=>{
        console.log('Logout')
        // console.log(err);
        res.redirect('/')
    });

};
  
exports.getReset = (req,res,next) =>{
    let message = req.flash('er');
    if(message.length>0){
        message  = message[0]
    }else{
        message =null;
    }
    res.render('auth/reset',{
        path:'/resetpass',
        pageTitle:'Reset',
        errorMessage: message
    });
}

exports.postReset = (req,res,next) =>{
    crypto.randomBytes(32,(err,buffer)=>{
        if(err){
            console.log(err);
            return res.redirect('/resetpass');
        }
        const token = buffer.toString('hex'); 
        User.findOne({email:req.body.email})
        .then(user=>{
            if(!user){
                req.flash('er','Email address does not exists.')
                return res.redirect('/resetpass');
            }
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000 ;
            return user.save();
        })
        .then(result=>{
                res.redirect('/')
                transporter.sendMail({
                to: req.body.email,
                from:'workwithmj27@gmail.com',
                subject:'Password Reset',
                html:`
                <p>Your Password Reset link is generated.</p>
                <p>Click <a href="http://localhost:3000/resetpass/${token}">here</a> to set a new password.</p>
                `
        })
    })
        .catch(err=>console.log(err))
    })
}

exports.getNewPass = (req,res,next) =>{
    const token = req.params.token;
    User.findOne({resetToken:token, resetTokenExpiration:{$gt: Date.now()}})
    .then(user=>
        res.render('auth/new-pass',{
            path:'/newpass',
            pageTitle:'New Password',
            userId: user._id.toString(),
            passToken:token
        }))
    .catch(err=>console.log(err))
    
}

exports.postNewpass = (req,res,next) =>{
    const newPassword = req.body.newPassword;
    const userId = req.body.userId;
    const passToken = req.body.passToken;
    let ruser;
    user.findOne({resetToken: passToken, resetTokenExpiration:{$gt: Date.now()}, _id :userId})
    .then(user=>{
        ruser = user;
        return bcrypt.hash(newPassword,12);
    })
    .then(hashpass=>{
        ruser.password = hashpass;
        ruser.resetToken = undefined;
        ruser.resetTokenExpiration = undefined;
        return ruser.save()
    })
    .then(result=>{
        res.redirect('/login')
    })
    .catch(err=>console.log(err))

}