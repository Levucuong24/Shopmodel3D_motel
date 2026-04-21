import express from "express";
import cors from "cors";
import path from "path";
import routes from "./modules/index.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import { auditLogger } from "./middlewares/audit.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.resolve("uploads")));

// Attach the audit logger
app.use(auditLogger);

app.use("/api", routes);

app.use(errorMiddleware);

export default app;
