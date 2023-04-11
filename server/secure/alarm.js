const button = document.querySelector('#checkbox');
const body = document.querySelector('body');
const modal = document.querySelector('.modal');
const cancelBtn = document.querySelector('.cancel-btn');
const okBtn = document.querySelector('.ok-btn');
const timer = document.querySelector('.timer');

const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');

let minutes = 0;
let seconds = 0;

const socket = io();

window.onload = () => {
  timer.style.display = 'none';
};

function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function showModal() {
  modal.style.display = 'initial';
}

function hideModal() {
  modal.style.display = 'none';
}

function applyRunningStyles() {
  button.checked = true;
  body.classList.add('alarm');
  timer.style.display = 'initial';
}

function applyStoppedStyles() {
  button.checked = false;
  button.disabled = false;
  body.classList.remove('alarm');
  hideModal();
  timer.style.display = 'none';
  minutes = 0;
  seconds = 0;
}

cancelBtn.addEventListener('click', () => {
  hideModal();
  button.checked = false;
});

okBtn.addEventListener('click', (event) => {
  hideModal();
  fetch(`/start-alarm`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      alarm: true,
    }),
  });
});

button.addEventListener('change', (event) => {
  if (event.target.checked) {
    showModal();
  } else {
    fetch(`/start-alarm`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        alarm: false,
      }),
    });
  }
  button.checked = false;
});

socket.on('init', ({ isAlarm }) => {
  isAlarm ? applyRunningStyles() : applyStoppedStyles();
});

socket.on('turnedOn', () => {
  applyRunningStyles();
});

socket.on('turnedOff', () => {
  console.log('off');
  applyStoppedStyles();
});

socket.on('tick', (duration) => {
  const formattedSeconds = Math.floor(duration / 1000)
    .toString()
    .padStart(2, '0');
  secondsEl.textContent = formattedSeconds;
});
