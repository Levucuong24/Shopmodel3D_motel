import express from "express";
import cors from "cors";
import path from "path";
import routes from "./routes/index.js";
import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.resolve("uploads")));

app.use("/api", routes);

app.use(errorMiddleware);

export default app;
