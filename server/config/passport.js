const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const User = require("../Models").userModel;

module.exports = (passport) => {
  let opts = {};
  // 從使用者req的標頭檔中取出 JWT
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt");
  opts.secretOrKey = process.env.PASSPORT_SECRET;
  passport.use(
    new JwtStrategy(opts, function (jwt_payload, done) {
      User.findOne({ _id: jwt_payload._id }, (err, user) => {
        if (err) {
          return done(err, false);
        }
        if (user) {
          // 找到使用者
          done(null, user);
        } else {
          // 找不到使用者
          done(null, false);
        }
      });
    })
  );
};
