import express from "express";
import helmet from "helmet";
import cors from "cors";
import { publicRouter } from "../route/public-api.js";
import { errorMiddleware } from "../middleware/error-middleware.js";
import { userRouter } from "../route/api.js";

export const web = express();

web.use(helmet());
web.use(express.json());
web.use(cors());

web.use(publicRouter);
web.use(userRouter);

web.use(errorMiddleware);