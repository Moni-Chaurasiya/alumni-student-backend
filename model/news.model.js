const mongoose= required('mongoose');

const newsSchema= new mongoose.Schema({
    title:{
        type: String,
        required:true
    },
    content:{
        type:String,
        required:true
    },
    category:{
        type:String,
        enum :['announcement','successStory','research'],
        reuired:true,
        default:'announcement'
    },
    imageFile:{
        type:String,
        default:null
    },
    publishedAt:{
        type:Date,
        default:Date.now
    },
    isPublished:{
        type:Boolean,
        default:true
    }
    
},{Timestamps:true});

model.exports= mongoose.model('News',newsSchema);