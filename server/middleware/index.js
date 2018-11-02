// requiresLogin()
const requiresLogin = (rq, rp, next) => {
  if (!rq.session.account) {
    return rp.redirect('/');
  }
  return next();
};

// requiresLogout()
const requiresLogout = (rq, rp, next) => {
  if (rq.session.account) {
    return rp.redirect('/maker');
  }
  return next();
};

// requiresSecure()
const requiresSecure = (rq, rp, next) => {
  if (rq.headers['x-forwarded-proto'] !== 'https') {
    return rp.redirect(`https://${rq.hostname}${rq.url}`);
  }
  return next();
};

// bypassSecure()
const bypassSecure = (rq, rp, next) => {
  next();
};

// Setting up the default exports
module.exports = {
  requiresLogin,
  requiresLogout,
  requiresSecure,
};

// IF this server is NOT deployed in a production environment...
if (process.env.NODE_ENV !== 'production') {
  module.exports.requiresSecure = bypassSecure;
}
