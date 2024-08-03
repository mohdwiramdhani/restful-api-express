import express from "express";
import userController from "../../controller/user-controller.js";
import contactController from "../../controller/contact-controller.js";
import addressController from "../../controller/address-controller.js";
import { authMiddleware } from "../../middleware/auth-middleware.js";
import { multerMiddleware } from "../../middleware/multer-middleware.js";

const userRouter = new express.Router();
userRouter.use(authMiddleware);

// User API
userRouter.get('/users/current', userController.get);
userRouter.patch('/users/current', userController.update);

// Contact API
userRouter.post('/contacts',
    multerMiddleware([
        { name: 'photo', maxCount: 1 },
        { name: 'certificate', maxCount: 1 }
    ]),
    contactController.create
);
userRouter.get('/contacts/:contactId', contactController.get);
userRouter.put('/contacts/:contactId',
    multerMiddleware([
        { name: 'photo', maxCount: 1 },
        { name: 'certificate', maxCount: 1 }
    ]),
    contactController.update
);
userRouter.delete('/contacts/:contactId', contactController.remove);
userRouter.get('/contacts', contactController.search);

// Address API
userRouter.post('/contacts/:contactId/addresses',
    multerMiddleware([
        { name: 'location', maxCount: 2 }
    ]),
    addressController.create
);
userRouter.get('/contacts/:contactId/addresses/:addressId', addressController.get);
userRouter.put('/contacts/:contactId/addresses/:addressId',
    multerMiddleware([
        { name: 'location', maxCount: 2 }
    ]),
    addressController.update
);
userRouter.delete('/contacts/:contactId/addresses/:addressId', addressController.remove);
userRouter.get('/contacts/:contactId/addresses', addressController.list);
userRouter.get('/contacts/:contactId/export', addressController.exportToExcel);

export {
    userRouter
}