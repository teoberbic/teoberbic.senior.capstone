/**Express app: middleware, routes, views, static**/

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var brandsRouter = require('./routes/brands');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', usersRouter);

app.use(express.static('public'))



app.get('/users', (req, res) => {
  res.send('Hello World!')
})
app.post('/', (req, res) => {
  res.send('Got a POST request')
})
app.put('/user', (req, res) => {
  res.send('Got a PUT request at /user')
})
app.delete('/user', (req, res) => {
  res.send('Got a DELETE request at /user')
})




//mongoose setup

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');

// 1) middleware
app.use(express.json());

// 2) db connect
const { MONGODB_URI, DB_NAME } = process.env;
console.log('ENV path:', path.resolve(__dirname, '../../.env'));

console.log('Connecting to MongoDB at', MONGODB_URI, 'DB name:', DB_NAME);
if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI in .env');
  process.exit(1);
}
mongoose.set('strictQuery', true);
mongoose
  .connect(MONGODB_URI, { dbName: DB_NAME || 'sscd' })
  .then(() => console.log('Mongo connected:', mongoose.connection.name))
  .catch(err => { console.error('Mongo connect failed:', err.message); process.exit(1); });

// 3) routes
app.use('/', indexRouter);



// brands router
app.use('/brands', brandsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
