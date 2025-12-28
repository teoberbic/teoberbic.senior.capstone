/**
 * entry point of backend
 * express app: 
 * middleware - error handling and logging
 * routes - setup routes to tell backend where to send requests
 * 
 * **/

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var brandsRouter = require('./routes/brands');

var app = express();

//mongoose setup

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');

// db connect
const { MONGODB_URI, DB_NAME } = process.env;
console.log('ENV path:', path.resolve(__dirname, '../../.env'));

console.log('Connecting to mongoDB at', MONGODB_URI, 'DB name:', DB_NAME);
if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI in .env');
  process.exit(1);
}
mongoose.set('strictQuery', true);
mongoose
  .connect(MONGODB_URI, { dbName: DB_NAME || 'sscd' }) // add a safeguard just in case of undefined DB_NAME
  .then(() => console.log('Mongo connected:', mongoose.connection.name))
  .catch(err => { console.error('Mongo connect failed:', err.message); process.exit(1); });




// middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// routes
app.use('/users', usersRouter);
app.use('/', indexRouter);
app.use('/brands', brandsRouter);




// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // return json error
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: req.app.get('env') === 'development' ? err : {}
  });
});

module.exports = app;
// Initialize cron jobs
require('./jobs/cron');
