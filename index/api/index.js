const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const errorhandler = require("errorhandler")
const fileUpload = require("express-fileupload")

const routes = require('./routes/index');
const dbindexitems = require('./routes/dbindexitems');
const proteins = require('./routes/proteins');
const species = require('./routes/species');
const genomes = require('./routes/genomes');
const systemicEffects = require('./routes/systemicEffects');
const venomSeq = require('./routes/venomSeq');
const outlinks = require('./routes/outlinks');
const semantic = require('./routes/semantic');

const app = express();

// MongoDB
mongoose.Promise = global.Promise;

app.use(fileUpload())

const bdd_location = process.env.NODE_ENV == 'test' ? 'mongodb://localhost:27017/venomkb-staging-test' : 'mongodb://localhost:27017/venomkb_format'
mongoose.connect(bdd_location).then(() => {
  console.log('connection to MongoDB succesful');
  mongoose.connection.db.collection("species").createIndex({ "name": "text" });
  mongoose.connection.db.collection("proteins").createIndex({ "name": "text" });
  mongoose.connection.db.collection("genomes").createIndex({ "name": "text" });
  mongoose.connection.db.collection("systemiceffects").createIndex({ "name": "text" });
  mongoose.connection.db.collection("venomseqs").createIndex({ "name": "text" });
}).catch((err) => console.error(err));

// Create Mongo text indexes

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, '../img', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({ limit: '100mb'}));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
app.use(cookieParser());
app.use(cors());

app.use('/', routes);
app.use('/dbindexitems', dbindexitems);
app.use('/proteins', proteins);
app.use('/species', species);
app.use('/genomes', genomes);
app.use('/systemic-effects', systemicEffects);
app.use('/venom-seq', venomSeq);
app.use('/outlinks', outlinks);
app.use('/semantic', semantic);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

module.exports = app;
