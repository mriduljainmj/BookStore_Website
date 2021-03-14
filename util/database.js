const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (cb) =>{
MongoClient
.connect('mongodb+srv://manager-mridul:apple@123@cluster0.p7imh.mongodb.net/Project0?retryWrites=true&w=majority',{ useUnifiedTopology: true } )
.then((client)=>{
    console.log("Connected!!");
    _db = client.db();
    cb();
})
.catch(err=>console.log(err))

};

const getDb = ()=>{
    if(_db){
        return _db;
    }
    throw 'no db found'
};


exports.mongoConnect = mongoConnect;
exports.getDb = getDb;