//load bcrypt
const bCrypt = require("bcryptjs");

module.exports = (passport, user) => {
  let User = user;
  const LocalStrategy = require("passport-local").Strategy;

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser((id, done) => {
    User.findByPk(id).then((user) => {
      if (user) {
        done(null, user.get());
      } else {
        done(user.errors, null);
      }
    });
  });

  //LOCAL SIGNIN
  passport.use(
    "local-signin",
    new LocalStrategy(
      {
        // by default, local strategy uses username and password, we will override with email
        usernameField: "username",
        passwordField: "password",
        passReqToCallback: true, // allows us to pass back the entire request to the callback
      },

      async function (req, username, password, done) {
        let User = user;
        try {
          var criteria =
            username.indexOf("@") === -1
              ? { username: username }
              : { email: username };
          const userFinded = await User.findOne({
            where: criteria,
          });
          if (!userFinded) {
            return done(
              null,
              false,
              req.flash("error_msg", "Login failure. User is not found")
            );
          }

          const isMatch = await bCrypt.compareSync(
            password,
            userFinded.password
          );
          if (!isMatch) {
            return done(
              null,
              false,
              req.flash("error_msg", "Login failure. Password is not correct")
            );
          } else {
            return done(null, userFinded);
          }
        } catch (error) {
          console.log(error);
        }
      }
    )
  );
};
