const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique : true,
        required: true,
        trim: true,
        lowercase: true,
        uniqueCaseInsensitive: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid');
            }
        }
    },
    password: {
        type : String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"');
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a positive number');
            }
        }
    },
    tokens:[{token:{
        type :String,
        required :true
    }}],
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref: 'Task',
      }],
    avatar:{
        type:Buffer,
    }
    
},{
    timestamps:true,
});

// Middelare

userSchema.methods.generateToken = async function(){
    console.log("running");
    const user = this; 
    const token = jwt.sign({_id:user._id.toString() },process.env.TOKEN_SECRET,{expiresIn : "7 days"});
    user.tokens = user.tokens.concat({token:token })
    // console.log(user.tokens);
    await user.save();
    return token;
}

userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email: email });
    if (!user) {
        throw new Error("Unable to logIn");
    }
    const isMatch = await bcrypt.compare(password , user.password);
    if(!isMatch){
        throw new Error("Unable to logIn");
    }
    return user;

}
// userSchema.statics.findByCredentials = async (email, password) => {
//     const user = await User.findOne({ email })
//     if (!user) {
//     throw new Error('Unable to login')
//     }
//     const isMatch = await bcrypt.compare(password, user.password)
//     if (!isMatch) {
//     throw new Error('Unable to login')
//     }
//     return user
//    }

const User = mongoose.model('User', userSchema);


module.exports = User