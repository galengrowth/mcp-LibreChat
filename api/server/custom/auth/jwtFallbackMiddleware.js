const passport = require('passport');
const { isEnabled } = require('@librechat/api');

const authenticateJwtWithOpenIdFallback = (req, res, next, { optional } = {}) => {
  const setUserAndNext = (err, user) => {
    if (err) {
      return next(err);
    }
    if (user) {
      req.user = user;
    }
    return next();
  };

  const jwtAuth = optional
    ? passport.authenticate('jwt', { session: false }, setUserAndNext)
    : passport.authenticate('jwt', { session: false });

  if (!isEnabled(process.env.OPENID_REUSE_TOKENS)) {
    return jwtAuth(req, res, next);
  }

  return passport.authenticate('openidJwt', { session: false }, (err, user) => {
    if (err) {
      return next(err);
    }

    if (user) {
      req.user = user;
      return next();
    }

    return jwtAuth(req, res, next);
  })(req, res, next);
};

const optionalJwtAuth = (req, res, next) =>
  authenticateJwtWithOpenIdFallback(req, res, next, { optional: true });

const requireJwtAuth = (req, res, next) =>
  authenticateJwtWithOpenIdFallback(req, res, next, { optional: false });

module.exports = { optionalJwtAuth, requireJwtAuth };
