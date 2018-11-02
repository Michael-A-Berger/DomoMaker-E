const models = require('../models');
const Account = models.Account;

// loginPage()
const loginPage = (rq, rp) => {
  rp.render('login', { csrfToken: rq.csrfToken() });
};

// logout()
const logout = (rq, rp) => {
  rq.session.destroy();
  rp.redirect('/');
};

// login()
const login = (request, response) => {
  const rq = request;
  const rp = response;

  // Force casting the strings to cover security flaws
  const username = `${rq.body.username}`;
  const password = `${rq.body.pass}`;

  // Server-side error checking
  if (!username || !password) {
    return rp.status(400).json({ error: 'RAWR! All fields are required!' });
  }

  // Authenticating the login details
  return Account.AccountModel.authenticate(username, password, (err, account) => {
    if (err || !account) {
      return rp.status(401).json({ error: 'Wrong usernme or password' });
    }

    rq.session.account = Account.AccountModel.toAPI(account);

    return rp.json({ redirect: '/maker' });
  });
};

// signup()
const signup = (request, response) => {
  const rq = request;
  const rp = response;

  // Casting to strings to cover up some security flaws
  rq.body.username = `${rq.body.username}`;
  rq.body.pass = `${rq.body.pass}`;
  rq.body.pass2 = `${rq.body.pass2}`;

  // Server-side error checking
  if (!rq.body.username || !rq.body.pass || !rq.body.pass2) {
    return rp.status(400).json({ error: 'RAWR! All fields are required!' });
  }
  if (rq.body.pass !== rq.body.pass2) {
    return rp.status(400).json({ error: 'RAWR! Passwords do not match!' });
  }

  // Generating the password and salt
  return Account.AccountModel.generateHash(rq.body.pass, (salt, hash) => {
    const accountData = {
      username: rq.body.username,
      salt,
      password: hash,
    };

    // Creating the new account + saving it
    const newAccount = new Account.AccountModel(accountData);
    const savePromise = newAccount.save();

    // Handling when the account entry returns
    savePromise.then(() => {
      rq.session.account = Account.AccountModel.toAPI(newAccount);
      return rp.json({ redirect: '/maker' });
    });
    savePromise.catch((err) => {
      console.log(err);

      if (err.code === 11000) {
        return rp.status(400).json({ error: 'Username already in use.' });
      }

      return rp.status(400).json({ error: 'An unexpected error occurred.' });
    });
  });
};

// getToken()
const getToken = (req, resp) => {
  const rq = req;
  const rp = resp;

  const csrfJSON = {
    csrfToken: rq.csrfToken(),
  };

  rp.json(csrfJSON);
};

// Exports
module.exports = {
  loginPage,
  login,
  logout,
  signup,
  getToken,
};
