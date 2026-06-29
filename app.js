var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var hbs = require("hbs");

// Load DB + models at startup
require("./app_server/models/db");
require("./app_server/models/trips");

// MVC routers (customer-facing website)
var indexRouter = require("./app_server/routes/index");
var travelRouter = require("./app_server/routes/travel");

// Module 5: API routers (separation of concerns)
var apiRouter = require("./app_api/routes/index");

var app = express();

// view engine setup (use app_server/views)
app.set("views", path.join(__dirname, "app_server", "views"));
app.set("view engine", "hbs");

// Handlebars partials
hbs.registerPartials(path.join(__dirname, "app_server", "views", "partials"));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public"), { index: false }));

// Routes (MVC)
app.use("/", indexRouter);
app.use("/travel", travelRouter);


app.use("/api", apiRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
