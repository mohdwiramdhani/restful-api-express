import express from "express";
import userController from "../../controller/user-controller.js";

const publicRouter = new express.Router();
publicRouter.post('/users', userController.register);
publicRouter.post('/users/login', userController.login);
publicRouter.get('/test', (req, res) => {
    res.send("Hello, world");
});

export {
    publicRouter
}