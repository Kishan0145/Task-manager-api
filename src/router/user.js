const experss = require("express");
const router = new experss.Router();
const User = require("../models/user")
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");
const Task = require("../models/tasks")
const multer = require("multer");
const sharp = require("sharp");
const email =require("../Email/email")

router.post('/users', async (req, res) => {
    const user = new User(req.body)
    try {
        const token = await user.generateToken();
        await user.save();
        email.welcomeEmail(user.email,user.name);
        res.status(201).send({ user, token });
    } catch (e) {
        res.status(400).send(e);
    }
})
router.post("/users/login", async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateToken();
        res.send({ user, token });
    } catch (e) {
        res.status(400).send(e);
    }
});

router.post("/users/logOut", auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((elem) => {
            return elem.token != req.token;
        })
        await req.user.save();
        res.send("Logout");
    }catch(e){
        res.status(401).send();
    }
});

router.post("/users/logOutAll",auth,async (req,res)=>{
    try{
        req.user.tokens =[];
        await req.user.save();
        res.send("You have been logged out from all the devices ");   
    }catch(e){
        res.status(401).send();
    }
})

router.get("/users/me", auth, async (req, res) => {
    res.send({
        name : req.user.name,
        email : req.user.email,
        age : req.user.age
    });
})
router.get("/users/:id", async (req, res) => {
    const _id = req.params.id
    try {
        const user = await User.findById(_id)
        if (!user) {
            res.status(500).send();
        }
        else {
            res.status(200).send(user);
        }
    } catch (e) {
        res.status(400).send(e);
    }
})
router.patch("/users/me",auth, async (req, res) => {
    try{
        const user = await User.findOneAndUpdate({email : req.user.email },{
            name : req.body.name,
            email :req.body.email,
            password:await bcrypt.hash(req.body.password,8),
        },{new:true});
        res.send(user);
    }catch(e){
        res.status(401).send(e);
    }
})

router.delete("/users/me",auth, async (req, res) => {
    try{
        email.DeleteEmail(req.user.email,req.user.name);
        await req.user.remove();
        const tasks = await Task.deleteMany({owner:req.user._id});
        console.log(tasks);
        res.send(req.user);
    }catch(e){
        res.status(401).send(e);
    }

});

const avatar = multer({
    limits:{
        fileSize:1000000,
    },
    fileFilter(req,file,cb){
        const allowExtensions = [".jpg",".jpeg",".png"]
        const isMatch = allowExtensions.some((elem)=>{
            return file.originalname.endsWith(elem)
        })
        if(!isMatch){
            cb(new Error("Please upload a jpg/jpeg/png file"))
        }
        else{
            cb(undefined,true);
        }
    }
})

router.post("/users/me/avatar",auth, avatar.single("avatar"),async (req, res) => {
    try{
        req.user.avatar = await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer();
        await req.user.save();
        res.send("profile uploaded");
    }catch(e){
        res.status(500).send(e);
    }
},(error,req,res,next)=>{
    res.status(500).send({error:error.message})
});

router.delete("/users/me/avatar",auth,async (req,res)=>{
    try{
        req.user.avatar = undefined;
        await req.user.save();
        res.send("Deleted")
    }catch(e){
        res.status(500).send(e);
    }
})

// router.get("/users/me/avatar",auth,async (req,res)=>{
//     try{
//         res.send(req.user.avatar)
//         // res.set('Content-Type', 'image/jpg')
//         res.send(user.avatar);
//     }catch(e){
//         res.status(404).send(e);
//     }
// })
router.get('/users/:id/avatar', async (req, res) => {
    try {
    const user = await User.findById(req.params.id)
    if (!user || !user.avatar) {
    throw new Error()
    }
    res.set('Content-Type', 'image/jpg')
    res.send(user.avatar)
    } catch (e) {
    res.status(404).send()
    }
   })
module.exports = router;