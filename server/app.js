// Importing libraries
const path = require('path');
const express = require('express');
const compression = require('compression');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const expressHandlebars = require('express-handlebars');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const url = require('url');
const csurf = require('csurf');

const port = process.env.PORT || process.env.NODE_PORT || 3000;
const dbURL = process.env.MONGODB_URI || 'mongodb://localhost/mxb3145_DomoMaker';

// Connecting to the MongoDB instance
mongoose.connect(dbURL, (err) => {
  if (err) {
    console.log('Could not connect to database');
    throw err;
  }
});

// Getting the Redis password and username
let redisURL = {
  hostnme: 'loclhost',
  port: 6379,
};

let redisPASS;

if (process.env.REDISCLOUD_URL) {
  redisURL = url.parse(process.env.REDISCLOUD_URL);
  redisPASS = redisURL.auth.split(':')[1];
}

// Defining the current Express app
const app = express();
app.use('/assets', express.static(path.resolve(`${__dirname}/../hosted/`)));
app.use(favicon(`${__dirname}/../hosted/img/favicon.png`));
app.use(compression());
app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(session({
  key: 'sessionid',
  store: new RedisStore({
    host: redisURL.hostname,
    port: redisURL.port,
    pass: redisPASS,
  }),
  secret: 'Domo Arigato',
  resave: true,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
  },
}));
app.engine('handlebars', expressHandlebars({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.disable('x-powered-by');
app.use(cookieParser());

// Preventing CSRF session hijacking
app.use(csurf());
app.use((err, rq, rp, next) => {
  if (err.code !== 'EBADCSRFTOKEN') return next(err);

  console.log('Missing CSRF token');
  return false;
});

// Setting the Express app resource routes
const router = require('./router.js');
router(app);

// Starting the Express app server
app.listen(port, (err) => {
  if (err) throw err;

  console.log(`Listening on port ${port}...`);
});
