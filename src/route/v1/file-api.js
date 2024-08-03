import express from 'express';
import fileController from "../../controller/file-controller.js";
import { authMiddleware } from "../../middleware/auth-middleware.js";

const fileRouter = new express.Router();
fileRouter.use(authMiddleware);

fileRouter.get('/files/:type/:filename', fileController.getFile);

export {
    fileRouter
}