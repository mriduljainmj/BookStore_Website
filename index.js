const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const mongoose  = require('mongoose');
const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req,res,next)=>{
    User.findById('605049f1af5b6fa148073099')
    .then((user)=>{
        req.user = user
        next();
    })
    .catch(Err=>console.log(Err))
});

app.use('/admin', adminRoutes);
app.use(shopRoutes); 

app.use(errorController.get404);

mongoose
.connect('mongodb+srv://manager-mridul:apple@123@cluster0.p7imh.mongodb.net/Project0?retryWrites=true&w=majority', {useNewUrlParser: true})

.then(()=>{
    User.findOne().then(user=>{
        if(!user){
            const user = new User({
                name:'Mridul',
                email:'mridul@gmail.com',
                cart:{
                    items: []
                }
            })
          user.save()
        }
    })
    app.listen(3000);
})
.catch(err=>console.log(err));

