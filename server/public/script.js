const button = document.getElementById('button');

button.addEventListener('change', (e) => {
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
