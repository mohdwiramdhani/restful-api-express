import express from "express";
import helmet from "helmet";
import cors from "cors";
import { publicRouter } from "../route/public-api.js";
import { errorMiddleware } from "../middleware/error-middleware.js";
import { userRouter } from "../route/api.js";
import { fileRouter } from "../route/file-api.js";

export const app = express();

app.use(helmet());
app.use(express.json());
app.use(cors());

app.use(publicRouter);
app.use(userRouter);
app.use(fileRouter);

app.use(errorMiddleware);