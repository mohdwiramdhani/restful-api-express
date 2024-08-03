import express from "express";
import userController from "../../controller/user-controller.js";
import { loginRateLimiter, registerRateLimiter } from '../../config/rate-limit-config.js';

const publicRouter = new express.Router();

publicRouter.post('/users', registerRateLimiter, userController.register);
publicRouter.post('/users/login', loginRateLimiter, userController.login);
publicRouter.get('/test', (req, res) => {
    res.send("Hello, world");
});

export {
    publicRouter
}