require('dotenv').config();
const express = require('express');
const cors = require('cors');
let bodyParser = require("body-parser");
const dns = require('dns');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

class Pareja{
    constructor(original_url, short_url) {
      this.original_url = original_url;
      this.short_url = short_url;
    }
}

let diccionario = {
  inicial : 0
}

app.use("/api/shorturl", bodyParser.urlencoded({extended: false}));

// Mi endpoint
let short_url = 1;
app.post("/api/shorturl", (req, res) => {
  const url = req.body.url;
  let hostname;

  try {
    hostname = new URL(url).hostname;
  } catch {
    return res.json({ error: 'invalid url' });
  }

  dns.lookup(hostname , (err, adrress, family) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    if(isNaN(diccionario[req.body.url])){
      diccionario[short_url] = req.body.url;
      diccionario[req.body.url] = short_url++;
    }

    res.json({original_url : req.body.url, short_url : diccionario[req.body.url]});
  })

})

// en la ruta "/:" los : hace que sea un parametro, sin los dos puntos es algo que está en la ruta
// ? hace que sea opcional
app.get("/api/shorturl/:surl?", (req, res, next) => {
  res.redirect(diccionario[parseInt(req.params.surl)]);
  next();
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
