const express = require('express');
const fs = require('fs');
const sqlite = require('sql.js');

const filebuffer = fs.readFileSync('db/users.sqlite3');

const db = new sqlite.Database(filebuffer);

const app = express();

app.set('port', process.env.PORT || 3001);

// Express only serves static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
}

const COLUMNS = ['department', 'failureRate'];

function reduceToArray(r){
  return r.values.reduce(function(a, b) {return a.concat(b);},[])
}

function createTotalHistogram(){
  resolution = 1000
  const r = db.exec(
    `select department, failureRate from users`,
  )

  var histogram = {};
  for (var i = 0; i <= resolution; i++) {
    histogram[i] = {}
  }

  var values = r[0].values
  for(var i = 0; i < values.length; i++){
    const v = Math.round(values[i][1]*resolution)
    values[i][1] = v
    histogram[v][values[i][0]] = (histogram[v][values[i][0]] | 0) + 1 
  }
  return histogram
}
const totalHistogram = createTotalHistogram()


function createHistogram(users, resolution){
  var histogram = {};
  for (var i = 0; i <= resolution; i++) {
    histogram[i] = 0
  }
  const roundUsers = users.map(x => Math.round(x*resolution))
  roundUsers.forEach(function(x) { histogram[x] += 1; });
  
  //find max value 
  var arr = Object.keys( histogram ).map(function ( key ) { return histogram[key]; });
  var max = Math.max.apply( null, arr );
  
  Object.keys(histogram).map(function(key, index) {
     histogram[key] = histogram[key]/max;
  });
  return histogram;
}

const processData = require('./processData');

app.get('/api/users', (req, res) => {
  // WARNING: Not for production use! The following statement
  // is not protected against SQL injections.

  // department as url parameter
  const dep = req.query.dep
  const resolution = req.query.resolution

  console.log("getting users for " + dep)
  const r = db.exec(
    `select failureRate from users WHERE department='${dep}'`,
  );
  //console.log("his",createHistogram(reduceToArray(r[0]), 100))
  if (r[0]) {
    //res.json( createHistogram(reduceToArray(r[0]), resolution) )
    res.json( createHistogram(reduceToArray(r[0]), resolution) )
  } else {
    res.json([]);
  }
});

app.get('/api/departments', (req, res) => {
  // WARNING: Not for production use! The following statement
  // is not protected against SQL injections.
  console.log("getting deps")
  const r = db.exec(`select DISTINCT department from users`,);
  if (r[0]) {
    res.json( reduceToArray(r[0]) )
    //res.json(processData(r[0], ['department']));
  } else {
    res.json([]);
  }
});

app.listen(app.get('port'), () => {
  console.log(`Find the server at: http://localhost:${app.get('port')}/`); // eslint-disable-line no-console
});
