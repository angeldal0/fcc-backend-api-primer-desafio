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
    let dateRes;
    let date_string = req.params.date;

    if (/^\d+$/.test(date_string)) {
      dateRes = new Date(Number(date_string)); // ó parseInt(date_string, 10)
    } else {
      dateRes = new Date(date_string);
    }

    if (!isNaN(dateRes.getTime())) {

      let unixRes = dateRes.getTime();
      res.json({
        unix: unixRes,
        utc: dateRes.toUTCString()
      })
    } else {
      res.json({error : "Invalid Date"});
    }

  } else {
    res.json({
      unix: new Date().getTime(),
      utc : new Date().toUTCString()
    })
  }
});


// Listen on port set in environment variable or default to 3000
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
