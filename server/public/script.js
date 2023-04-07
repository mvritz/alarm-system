const button = document.querySelector('#checkbox');
const body = document.querySelector('body');
const modal = document.querySelector('.modal');

button.addEventListener('change', (event) => {
  if (event.target.checked) {
    body.classList.add('alarm');
    modal.style.display = 'initial';
  } else {
    body.classList.remove('alarm');
    modal.style.display = 'none';
  }

  fetch(`/start-alarm`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      alarm: e.target.checked,
    }),
  });
});
