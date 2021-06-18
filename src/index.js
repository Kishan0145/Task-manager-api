const express = require('express');
require('./db/mongoose');
const app = express();
const port = process.env.PORT
const userRouter = require("./router/user");
const tasksRouter = require("./router/tasks");

app.use(express.json());
app.use(userRouter);
app.use(tasksRouter);

app.listen(port, () => {
    console.log('Server is up on port ' + port);
});