import "dotenv/config";
import http from "http";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { initSocket } from "./src/sockets/index.js";

connectDB();

const server = http.createServer(app);
initSocket(server);

server.listen(process.env.PORT, () => {
  console.log("Server running on port " + process.env.PORT);
});