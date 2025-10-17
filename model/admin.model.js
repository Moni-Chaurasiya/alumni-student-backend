const mongoose = require('mongoose');

const adminSchema =  mongoose.Schema({

    email: {
     type:String,
     required:true,
     unique:true
    },
    password: {
     type:String,
     required:true
    },
    role:{
     type:String,
     default:"admin"
    }
}
)

const admin= mongoose.model('Admin',adminSchema);

module.exports=admin;