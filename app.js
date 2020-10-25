const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const passport = require("passport");
const session = require("express-session");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const RedisStore = require("connect-redis");
const cors = require("cors");

const app = express();

const models = require("./models");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(methodOverride("_method"));
// session secret
app.use(
  session({
    secret: "kerbaumejus",
    cookie: {
      maxAge: 3600000,
      expires: 3600000, // one day
    },
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());
app.use(cors());

// passport
app.use(passport.initialize());
app.use(passport.session());

// Load passport strategies
require("./config/passport.js")(passport, models.User);

app.use((req, res, next) => {
  // res.locals.url = req.originalUrl;
  res.locals.current_url = req.path;
  next();
});

// Routes
const authRoute = require("./routes/auth.routes.js")(app, passport);
const adminRouter = require("./routes/admin.routes");
const karyawanRouter = require("./routes/karyawan.routes");
const operatorRouter = require("./routes/operator.routes");
const satpamRouter = require("./routes/satpam.routes");
const apiRouter = require("./routes/api.routes");
const errorRouter = require("./routes/error.routes");

app.use("/admin", adminRouter);
app.use("/karyawan", karyawanRouter);
app.use("/operator", operatorRouter);
app.use("/satpam", satpamRouter);
app.use("/api", apiRouter);
app.use("/error", errorRouter);

// app.use(function (req, res, next) {
//   res.locals.success_msg = req.flash('success_msg');
//   res.locals.error_msg = req.flash('error_msg');
//   res.locals.error = req.flash('error');
//   next();
// })

module.exports = app;
