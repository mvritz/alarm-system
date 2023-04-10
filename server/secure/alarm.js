const button = document.querySelector('#checkbox');
const body = document.querySelector('body');

const socket = io();

window.onload = () => {
  button.disabled = true;
};

let timeoutId;
button.addEventListener('change', (event) => {
  console.log(event);
  if (window.confirm('Are you sure?')) {
    fetch(`/start-alarm`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        alarm: event.target.checked,
      }),
    });
  } else {
    button.checked = false;
  }
});

function applyRunningStyles() {
  button.checked = true;
  button.disabled = true;
  body.classList.add('alarm');
}

function applyStoppedStyles() {
  button.checked = false;
  button.disabled = false;
  body.classList.remove('alarm');
}

socket.on('init', ({ isAlarm }) => {
  isAlarm ? applyRunningStyles() : applyStoppedStyles();
});

socket.on('turnedOn', () => {
  applyRunningStyles();
});

socket.on('turnedOff', () => {
  applyStoppedStyles();
});
