var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
const qrcodeReader = require('qrcode-reader');
const pug = require('pug');
const multer = require('multer');
const Jimp = require("jimp");
const fs = require('fs')
const html5Qrcode = require('html5-qrcode');
const upload = multer({ dest: 'uploads/' }); // Configure storage
const port = 3000;
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

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
app.get('/', (req, res) => {
  res.render('index', { html5Qrcode });
});
app.post('/scan',upload.single('file'), (req, res) => {
  if (req.file) {
    const buffer = fs.readFileSync(req.file.path);
    Jimp.read(buffer, function (err, image) {
      if (err) {
          console.error(err);
      }
      // Creating an instance of qrcode-reader module
      let qrcode = new qrcodeReader();
      qrcode.callback = function (err, value) {
          if (err) {
              console.error(err);
          }
          // Printing the decrypted value
          console.log(value.result);
          res.json({ text: value.result })

      };
      // Decoding the QR code
      qrcode.decode(image.bitmap);
  });
  } else {
    res.status(400).json({ error: 'No file uploaded Sunsu'+req.file });
  }
});
app.post('/scanCam', (req, res) => {
  const qrResult = req.body.qrResult;
  if (qrResult) {
    res.json({ text: qrResult });
  } else {
    res.status(400).json({ error: 'No QR code scanned' });
  }
});
// app.listen(port, () => {
//   console.log(`Server listening on port ${port}`);
// });
module.exports = app;
