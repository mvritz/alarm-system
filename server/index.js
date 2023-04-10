require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const fs = require('fs');
const path = require('path');
const pool = require('./db');
const bcrypt = require('bcryptjs');
const http = require('http');
const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));
app.use(cors({ credentials: true }));
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3000;

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new pgSession({ pool, createTableIfMissing: true }),
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 12,
    },
  })
);

const isAuth = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
};

app.use('/secure', isAuth, express.static(path.join(__dirname, '/secure')));

app.get('/', isAuth, (req, res) => {
  res.sendFile(__dirname + '/secure/alarm.html');
});

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/public/login.html');
});

app.get('/alarm', isAuth, (req, res) => {
  res.sendFile(__dirname + '/secure/alarm.html');
});

app.post('/login', async (req, res) => {
  const result = await pool.query('SELECT * FROM accounts WHERE username=$1', [
    req.body.name,
  ]);
  const user = result.rows[0];
  if (user == null) {
    return res.status(400).send({ error: 'Wrong password or username' });
  }
  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      req.session.user = user;
      console.log(`successfully logged in user ${user.username}`);
      res.status(200).send({ result: 'redirect', url: '/alarm' });
    } else {
      return res
        .status(400)
        .send({ error: "User doesn't exist or password is wrong" });
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// app.post('/users/register', async (req, res) => {
//   console.log(req.body);
//   const user = { name: req.body.name, password: req.body.password };
//   const salt = await bcrypt.genSalt();
//   user.password = await bcrypt.hash(user.password, salt);
//   await pool
//     .query(
//       'INSERT INTO accounts(username,password) VALUES($1,$2) RETURNING user_id;',
//       [user.name, user.password]
//     )
//     .then((result) => {
//       res.json(result.rows[0]);
//     })
//     .catch((err) => res.send(err.message));
//   res.status(201).send();
// });
let timeoutId;
let isAlarm = false;
// rpio.open(17, rpio.OUTPUT, rpio.LOW);
app.post('/start-alarm', isAuth, (req, res) => {
  const data = JSON.stringify(req.body);
  // fs.writeFile('alarm.json', data, 'utf8', () => {
  //   return;
  // });

  if (req.body.alarm) {
    try {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      // rpio.write(4, rpio.HIGH);
      console.log('turned on');
      io.emit('turnedOn');
      isAlarm = true;
      timeoutId = setTimeout(() => {
        // rpio.write(4, rpio.LOW)
        console.log('turned off');
        io.emit('turnedOff');
        isAlarm = false;
      }, 8000);
    } catch (err) {
      console.log(err.message);
    }
  } else {
    clearTimeout(timeoutId);
    // rpio.write(4, rpio.LOW)
    console.log('turned off');
  }

  res.sendStatus(200);
});

app.get('/*', (req, res) => {
  res.redirect('/login');
});

io.on('connection', (socket) => {
  console.log('connected');
  socket.emit('init', { isAlarm });
});

server.listen(PORT, () => {
  console.log('listening on port ' + PORT);
});
