const shell = require('shelljs');

let alarm = {
  running: false,
};

function startAlarm(io) {
  shell.exec('./start-alarm.sh',{async:true});
  io.emit('turnedOn');
  alarm.running = true;
  console.log('turned on');
}

function stopAlarm(io) {
  shell.exec('./stop-alarm.sh',{async:true});
  io.emit('turnedOff');
  alarm.running = false;
  console.log('turned off');
}

function isAuth(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
}

function isAdmin(req, res, next) {
  if (req.session.user.username === 'admin') {
    next();
  } else {
    res.redirect('./login');
  }
}

module.exports = {
  startAlarm,
  stopAlarm,
  isAuth,
  isAdmin,
  alarm,
};
