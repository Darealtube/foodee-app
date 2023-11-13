var JwtStrategy = require("passport-jwt").Strategy;
var ExtractJwt = require("passport-jwt").ExtractJwt;
var User = require("./schemas/UserSchema");

// Extract the cookie header from the request so we'll be able to get the JWT Token
var cookieExtractor = (req) => {
  var token = null;
  if (req && req.cookies) {
    token = req.cookies["session"]; // Get the key "session" in the cookies.
  }
  return token;
};

// Setup the options of the Passport JWT Strategy
var opts = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: process.env.JWT_SECRET,
};

// This is where the authentication happens. It checks if the user is logged in or not.
const jwtStrategy = new JwtStrategy(opts, async function (jwt_payload, done) {
  try {
    const user = await User.findOne({ name: jwt_payload.name });
    if (user) return done(null, user);
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
});

module.exports = (passport) => {
  passport.use(jwtStrategy);
};
