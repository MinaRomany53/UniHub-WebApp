const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const compression = require("compression");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");

const dotenv = require("dotenv").config({ path: "./config.env" }); // Get all env var in this file & save it
const ApiErrors = require("./Utils/apiErrors");

const usersRouter = require("./Routes/usersRoutes");
const itemsRouter = require("./Routes/itemsRoutes");
const chatRoomsRouter = require("./Routes/chatRoomsRoutes");
const viewsRouter = require("./Routes/viewsRoutes");

const app = express();

// BuiltIn Middleware - For parsing application/json
app.use(express.json());
app.use(cookieParser());

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "Views"));

// BuiltIn Middleware - To serve static files such as images, CSS files, and Js files
app.use(express.static(path.join(__dirname, "Public")));

// Third Party Middleware - Logging Http Requests
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// Third Party Middleware - Implemetning CORS
const corsOptions = {
  origin: "http://localhost:5000",
  credentials: true, //access-control-allow-credentials:true
  origin: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
// app.options("*", cors());

// Third Party Middleware - Set a Couple of security HTTP Headers to secure this APP
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

// Third Party Middleware - Limiting Requests for each IP
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1hour in ms
  max: 400, // the limit is 400 Request per hour for each user
  message: "Your are Reached the Maximun Requests per hour, try again later",
});
app.use("/api", limiter);

// Third Party Middleware  - Data Sanitization
app.use(mongoSanitize()); // Against NoSql query injection
app.use(xss()); // Against XSS (Cross Site Scripting Attacks)

// Third Party Middleware - Preventing Parameter Pollution
app.use(hpp());

// Third Party Middleware - Compress all responses
app.use(compression());

// Application Level Middleware (My Code)
app.use((req, res, next) => {
  const date = new Date().toISOString();
  req.date = date;
  next();
});

// Router-Level Middleware
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/items", itemsRouter);
app.use("/api/v1/chatRooms", chatRoomsRouter);
app.use("/", viewsRouter);

// Handling Unhandled Routes
app.all("*", (req, res, next) => {
  next(new ApiErrors(404, `Can't find ${req.originalUrl} in this server!`)); // next(err)
});

// Error-Handling Middleware - Handling All Errors in the App
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  err.message = err.message || "Something Wrong happen";

  if (process.env.NODE_ENV === "development") {
    if (req.originalUrl.startsWith("/api")) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        error: err,
        stack: err.stack,
      });
    } else {
      res.status(err.statusCode).render("error", {
        message: err.message,
      });
    }
  } else if (process.env.NODE_ENV === "production") {
    if (err.isOperational) {
      if (req.originalUrl.startsWith("/api")) {
        res.status(err.statusCode).json({
          status: err.status,
          message: err.message,
        });
      } else {
        res.status(err.statusCode).render("error", {
          message: "Please Try Again Later",
        });
      }
    } else {
      if (req.originalUrl.startsWith("/api")) {
        console.error("Error🔥❌", err);
        res.status(500).json({
          status: err.status,
          message: "Something Wrong happen",
        });
      } else {
        res.status(err.statusCode).render("error", {
          message: "Please Try Again Later",
        });
      }
    }
  }
});

module.exports = app;
