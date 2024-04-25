import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { findUserById } from "../gateway/user";

const secret = process.env.SECRET;

interface Opts {
  jwtFromRequest: string;
  secretOrKey: string;
}
const PP = (passport) => {
  const opts: Opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("JWT"),
    secretOrKey: secret,
  };
  passport.use(
    new JwtStrategy(opts, async function (jwtPayload, done) {
      try {
        const u = await findUserById(String(jwtPayload.id));

        if (u) {
          done(null, u);
        } else {
          done(null, false);
        }
      } catch (e) {
        done(e, false);
      }
    })
  );
};

export default PP;
