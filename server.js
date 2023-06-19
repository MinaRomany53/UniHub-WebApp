const mongoose = require("mongoose");
const app = require("./app");

const http = require("http");
const socketio = require("socket.io");
const WebSockets = require("./Utils/webSockets");

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

// 🟢 Connect to Hosted Database from Atlas Cloud
mongoose.set("strictQuery", true); // strict schemas & store in DB only what specified in the model
mongoose
  .connect(DB)
  .then(() => console.log("Database connection successful ✅"))
  .catch((err) => {
    console.error("Database connection error ❌");
    next(err);
  });

// app.listen(process.env.PORT, () => {
//   console.log(` http://localhost:5000/api/v1/items`);
// });
/** Create HTTP server. */
const server = http.createServer(app);

/** Listen on provided port, on all network interfaces. */
server.listen(process.env.PORT);
/** Create socket connection */
global.io = socketio();
global.io.listen(server);
global.io.on("connection", WebSockets.connection);
/** Event listener for HTTP server "listening" event. */
server.on("listening", () => {
  console.log(`Listening on port:: http://localhost:${process.env.PORT}/`);
});
