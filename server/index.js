require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const path = require('path');
const pool = require('./db');
const bcrypt = require('bcryptjs');
const http = require('http');
const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');
const { startAlarm, stopAlarm, isAuth, isAdmin, alarm } = require('./utils');
const { DURATION, PORT } = require('./constants');
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));
app.use(cors({ credentials: true }));
app.use(express.urlencoded({ extended: true }));
const io = new Server(server);
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

app.use('/secure', isAuth, express.static(path.join(__dirname, '/secure')));

let timeoutId;
let intervalId;
let currentDuration = DURATION;

function handleTick() {
  io.emit('tick', currentDuration);
  currentDuration -= 1000;
}

function reset() {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  if (intervalId) {
    clearInterval(intervalId);
    currentDuration = DURATION;
  }
}

app.get('/', isAuth, (req, res) => {
  res.sendFile(__dirname + '/secure/alarm.html');
});

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/public/login.html');
});

app.get('/register', isAuth, isAdmin, (req, res) => {
  res.sendFile(__dirname + '/secure/register.html');
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

app.post('/register', isAuth, isAdmin, async (req, res) => {
  console.log(req.body);
  const user = { name: req.body.name, password: req.body.password };
  const salt = await bcrypt.genSalt();
  user.password = await bcrypt.hash(user.password, salt);
  await pool
    .query(
      'INSERT INTO accounts(username,password) VALUES($1,$2) RETURNING user_id;',
      [user.name, user.password]
    )
    .then((result) => {
      res.redirect('/login');
    })
    .catch((err) => res.send(err.message));
  res.status(201).send();
});

app.post('/start-alarm', isAuth, async (req, res) => {
  if (req.body.alarm) {
//    const result = await pool.query(
 //     'SELECT user_id FROM accounts WHERE username = $1;',
  //    [req.session.user.username]
   // );
   // const userId = result.rows[0].user_id;
    //console.log(typeof userId, userId);
    reset();
    try {
console.log('try')
      startAlarm(io);
      timeoutId = setTimeout(() => stopAlarm(io), DURATION);
//      await pool.query('INSERT INTO alarmexecutions(user_id) VALUES($1)', [
 //       Number(userId),
  //    ]);

      handleTick();
      intervalId = setInterval(handleTick, 1000);
    } catch (err) {
      console.log(err.message);
    }
  } else {
    reset();
    stopAlarm(io);
  }

  res.sendStatus(200);
});

app.get('/*', (req, res) => {
  res.redirect('/login');
});

io.on('connection', (socket) => {
  socket.emit('init', { isAlarm: alarm.running });
});

server.listen(PORT, () => {
  console.log('listening on port ' + PORT);
});
