'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const { DATABASE, PORT } = require('./config');

const app = express();

// Add middleware and .get, .post, .put and .delete endpoints
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Set CORS headers to enable cross-domain requests
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  next();
});
app.use(bodyParser.json());

/** CORE ENDPOINTS **/
app.get('/api/items', (req, res) => {
  knex.select(['id'])
    .from('items')
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Internal server error');
    });
});

app.post('/api/items', (req, res) => {
  res.status(201).location('PLACEHOLDER').json({ title: req.body.title });
});

app.get('/api/items/:id', (req, res) => {
  const { id } = req.params;
  knex
    .select(['id'])
    .from('items')
    .where('id', id)
    .then((results) => {
      const item = results[0];      
      res.json(item);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Internal server error');
    });
});

let server;
let knex;
function runServer(database = DATABASE, port = PORT) {
  return new Promise((resolve, reject) => {
    try {
      knex = require('knex')(database);
      server = app.listen(port, () => {
        console.info(`App listening on port ${server.address().port}`);
        resolve();
      });
    }
    catch (err) {
      console.error(`Can't start server: ${err}`);
      reject(err);
    }
  });
}

function closeServer() {
  return knex.destroy().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing servers');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer().catch(err => {
    console.error(`Can't start server: ${err}`);
    throw err;
  });
}

module.exports = { app, runServer, closeServer };