import express from "express";
import helmet from "helmet";
import cors from "cors";
import { publicRouter } from "../route/v1/public-api.js";
import { userRouter } from "../route/v1/api.js";
import { fileRouter } from "../route/v1/file-api.js";
import { errorMiddleware } from "../middleware/error-middleware.js";

export const app = express();

app.use(helmet());
app.use(express.json());
app.use(cors());

app.use('/api/v1', publicRouter);
app.use('/api/v1', userRouter);
app.use('/api/v1', fileRouter);

app.use(errorMiddleware);