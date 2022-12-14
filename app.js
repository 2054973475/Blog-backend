var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var blogClassifyRouter = require("./routes/blogClassify");
const blogArticleRouter = require("./routes/blogArticle");
const blogReception = require("./routes/blogReception");
const blogLinks = require("./routes/blogLinks");
const carousel = require("./routes/carousel");
const util = require("./routes/util");
const leavingmessage = require("./routes/leavingmessage");
const dashboard = require("./routes/dashboard") 
var app = express();
app.use(cors());
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json({ limit: 1024 * 1024 * 10, type: "application/json" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: 1024 * 1024 * 10,
    type: "application/x-www-form-urlencoded",
  })
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/user", usersRouter);
app.use("/blogClassify", blogClassifyRouter);
app.use("/blogArticle", blogArticleRouter);
app.use("/blogReception", blogReception);
app.use("/blogLinks", blogLinks);
app.use("/carousel", carousel);
app.use("/util", util);
app.use("/leavingmessage", leavingmessage);
app.use("/dashboard", dashboard);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
