const jwt =require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req,res,next)=>{
    try{
        const token = req.header("Authorization").replace("Bearer ","");
        const decode = jwt.verify(token,"thisIsAVeryImportantTopic");
        const user =  await User.findOne({_id : decode._id,"tokens.token" : token});
        if(!user){
            throw new Error("Authentication failed");
        }
        req.token =token;
        req.user = user;
    }catch(e){
        res.status(401).send({error :  "Please Authenticate"});
    }
    next();
}
module.exports = auth;