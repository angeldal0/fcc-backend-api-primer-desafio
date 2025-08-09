const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

mongoose.connect(process.env.MONGO_URI);

app.use(bodyParser.urlencoded({extended: false}));

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// Primero hay que definir los esquemas
const ejercicioEsquema = new mongoose.Schema({
  description: { type: String, required: true},
  duration: { type: Number, required: true},
  date: { type: String, required: true}
})

const usuarioEsquema = new mongoose.Schema({
  username : { type: String, required: true},
  log : [ejercicioEsquema]
})

/*
Ejercicio:

{
  username: "fcc_test",
  description: "test",
  duration: 60,
  date: "Mon Jan 01 1990",
  _id: "5fb5853f734231456ccb3b05"
}

Usuario:

{
  username: "fcc_test",
  _id: "5fb5853f734231456ccb3b05"
}

Log:

{
  username: "fcc_test",
  count: 1,
  _id: "5fb5853f734231456ccb3b05",
  log: [{
    description: "test",
    duration: 60,
    date: "Mon Jan 01 1990",
  }]
}

*/

// Ahora el modelo
const Usuario = mongoose.model('Usuario', usuarioEsquema);

// Ahora los metodos CRUD del modelo
// Agregar un usuario a la base de datos
// endpoint para agregar usuario
app.post("/api/users", (req, res) => {
  const username = req.body.username;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  const newUser = new Usuario({ username: username });

  /* Mas o menos bien
  newUser.save(function(err, data) {
    if (err) {
      console.error(err);
      return;
    }

    res.json({username: newUser.username, _id: newUser._id});
  })*/

  // mejor
  newUser.save()
    .then(data => {
      res.json({ username: data.username, _id: data._id });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "Server error" });
  });
})

// endpoint para ver todos los usuarios
app.get("/api/users", async (req, res) => {
  try {
    const users = await Usuario.find({}, "username _id");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching users' });
  }
})

// endpoint para agregar ejercicios
app.post("/api/users/:_id/exercises", (req, res) => {
  // Obtenemos los datos del formulario
  const user_id = req.params._id; //Se hace así y no como el resto porque es diferente, el parametro está en la url
  const description = req.body.description;
  const duration = parseInt(req.body.duration);
  let date = req.body.date;

  if (!user_id) {
    return res.status(400).json({ error: "_id is required" });
  }
  if (!description) {
    return res.status(400).json({ error: "Description is required" });
  }
  if (!duration) {
    return res.status(400).json({ error: "Duration is required" });
  }
  if (!date) {
    date = new Date().toDateString();
  }

  /*res.json({
    _id: user_id,
    description: description,
    duration: duration,
    date: date
  })*/

  // Obtener el usuario por su id
  Usuario.findById(user_id)
  .then(user => {
    user.log.push({
      description: description,
      duration: duration,
      date: date
    })

  // lo actualizamos
  return user.save();
  })
  .then(updateUser => {
    res.json({
      _id: updateUser._id,
      username: updateUser.username,
      date: date,
      duration: duration,
      description: description
    })
  })
  .catch(err => {
    res.status(500).json({ error: err });
  })
})

// endpoint para obtener todos los logs de un usuario
app.get("/api/users/:_id/logs", (req, res) => {
  const user_id = req.params._id;
  let { from, to, limit } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: "_id is missing" });
  }

  from = from ? new Date(from) : new Date(0);
  to = to ? new Date(to) : new Date();

  if (isNaN(from.getTime()) || isNaN(to.getTime())) {
    return res.status(400).json({ error: "Invalid date format" });
  }

  limit = limit ? Number(limit) : 0;
  if (isNaN(limit) || limit < 0) limit = 0;

  Usuario.findById(user_id)
    .then(user => {
      if (!user) return res.status(404).json({ error: "User not found" });

      //Hay que filtrar logs desde aqui en js porque no es una coleccion aparte para hacer querys, se podria rehacer todo el modelo de datos
      let filteredLogs = user.log.filter(e => {
        const d = new Date(e.date);
        return d >= from && d <= to;
      });

      if (limit > 0) {
        filteredLogs = filteredLogs.slice(0, limit);
      }

      res.json({
        _id: user._id,
        username: user.username,
        count: filteredLogs.length,
        log: filteredLogs.map(({ description, duration, date }) => ({
          description,
          duration,
          date
        }))
      });
    })
    .catch(err => {
      res.status(500).json({ error: err.message });
    });
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
