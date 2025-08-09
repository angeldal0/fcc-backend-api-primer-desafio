// index.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

// Mi endpoint para la consulta "/api/:date?"
// Sin control de errores
app.get("/api/:date?", (req, res) => {
  if (req.params.date) {
    /*let str = req.params.date.split("-");
    let year = str[0];
    let month = str[1];
    let day = str[2];

    let date = new Date(year, month, day);*/
    let dateRes = new Date(req.params.date);
    if (dateRes){
      let unixRes = date.getTime();
      res.json({
        unix: unixRes,
        utc: dateRes
      })
    } else {
      res.json({error : "Invalid Date"});
    }
  } else {
    res.json({
      unix: new Date().now().getTime(),
      utc : new Date().now()
    })
  }
});


// Listen on port set in environment variable or default to 3000
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
