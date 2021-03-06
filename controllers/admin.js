const Product = require('../models/product');
const { validationResult} = require('express-validator/check');


exports.getAddProduct = (req, res, next) => {
  
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing:false,
    haserror:false
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const errors = validationResult(req)
  if(!errors.isEmpty()){
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/edit-product',
      editing: false,
      haserror:true,
      product: {
      title:title,
      imageUrl:imageUrl,
      price:price,
      description:description
      },
     })
  }
  const product = new Product({
    title: title,
    price:price,
    description:description,
    imageUrl:imageUrl,
    userId: req.user._id
  });
  product.save()
  .then(()=>{
    console.log('Product Created');
    res.redirect('/admin/products');
  })
  .catch(err=>console.log(err))
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if(!editMode){
    return res.redirect('/')
  }
  const prodId = req.params.productId;
  Product.findById(prodId) //for mongoose
  // Product.findByPk(prodId) //for sequelize 
  .then((product) =>{
    if(!product){
      return res.redirect('/')
    }
    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: true,
      product:product,
      haserror:false
      
     })
    })
    .catch(err=>console.log(err))
};

exports.postEditProduct = (req,res,next) =>{
  const prodId = req.body.productId;
  updatedTitle = req.body.title;
  updatedImageUrl = req.body.imageUrl;
  updatedPrice = req.body.price;
  updatedDescription = req.body.description;
 
  Product.findById(prodId).then(product=>{
    if(product.userId.toString() !== req.user._id.toString()){
      return res.redirect('/');
    }
    product.title = updatedTitle;
    product.price = updatedPrice;
    product.description = updatedDescription;
    product.imageUrl = updatedImageUrl;
      return product.save().then(()=>{
        res.redirect('/admin/products');
    })
  })
  
  .catch(err=>{console.log(err)})
};

exports.getProducts = (req, res, next) => {
  Product.find({userId:req.user._id})
  .populate('userId',"name")
  .then((products) => {
    // console.log(products)
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products',
      
    })
  })
    .catch(err=>console.log(err))
};


exports.postDeleteProduct = (req,res,next) =>{
  const prodId = req.body.productId;
  Product.deleteOne({_id:prodId,userId:req.user._id})
  .then(()=>{
    res.redirect('/admin/products');
  })
  .catch(err=>console.log(err));
};