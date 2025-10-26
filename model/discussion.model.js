const mongoose=required('mongoose');

const discussionSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    content:{
        type:String,
        required:true
    },
    comments:[{
        userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        },
        text:{
            type:String,
            required:true
        }
    }]
},{timestamps:true});

module.exports=mongoose.model('Discussion',discussionSchema);