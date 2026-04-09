import "dotenv/config";
import http from "http";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { initSocket } from "./src/sockets/index.js";
import { startRentalExpiryMonitor } from "./src/utils/rental.js";

await connectDB();

const server = http.createServer(app);
initSocket(server);
startRentalExpiryMonitor();

server.listen(process.env.PORT, () => {
  console.log("Server running on port " + process.env.PORT);
});
