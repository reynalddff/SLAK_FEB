const passport = require("./../config/passport");
require("express-async-errors");
exports.login = async (req, res, next) => {
  passport.authenticate("local-signin", function (err, user, info) {
    if (user) {
      console.log(req.user);
      return res.send({
        msg: `Login success`,
        user: req.user,
      });
    }
  })(req, res, next);
};

exports.logout = async (req, res) => {
  req.logout();
  res.send({
    msg: "Logout success",
  });
};
