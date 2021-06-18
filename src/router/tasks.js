const experss = require("express");
const router = new experss.Router();
const Task = require("../models/tasks");
const auth = require("../middleware/auth");
const User = require("../models/user");

router.post("/tasks", auth, async (req, res) => {
    const task = new Task({ ...req.body, owner: req.user._id });
    try {
        await task.save();
        req.user.tasks = req.user.tasks.concat(task._id);
        await req.user.save();
        res.status(201).send(task);
    } catch (e) {
        res.status(400).send(e);
    }
});

router.get("/tasks/me",auth, async (req, res) => {
    try {
        const user = await User.findOne({email:req.user.email})
        const match = {}
        if (req.query.completed) {
            match.completed = JSON.parse(req.query.completed); 
           }
        const tasks= await user.populate({
            path:'tasks',
            match:match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
            }
        }).execPopulate()
        res.status(200).send(tasks.tasks)
    } catch (e) {
    res.status(400).send(e);

}
});

router.get("/tasks/:id",auth, async (req, res) => {
    console.log(req.user._id);
    const _id = req.params.id;
    const task = await Task.findOne({_id,owner:req.user._id});
    try {
        if (!task) {
            res.status(500).send("Invalid request");
        }
        else {
            res.status(200).send(task);
        }
    } catch (e) {
        res.status(400).send();
    }
});

router.patch("/tasks/:id",auth, async (req, res) => {
    const _id = req.params.id;
    const tasks = await Task.findOneAndUpdate({_id,owner:req.user._id}, req.body, { new: true });
    try {
        res.send(tasks);
    } catch (e) {
        res.status(404).send(e);
    }
});

router.delete("/tasks/:id", async (req, res) => {
    const _id = req.params.id;
    try {
        const task = await Task.findOneAndDelete({_id,owner:req.user._id});
        res.send(task);
    } catch (e) {
        res.status(404).send(e);
    }
});

module.exports = router;