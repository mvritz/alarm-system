const button = document.querySelector('#checkbox');
const body = document.querySelector('body');

let timeoutId;
button.addEventListener('change', (event) => {
  console.log(event);
  if (window.confirm('Are you sure?')) {
    console.log(event);
    if (event.target.checked) {
      body.classList.add('alarm');
      event.target.disabled = true;
      timeoutId = setTimeout(() => {
        event.target.checked = false;
        event.target.disabled = false;
      }, 8000);
    } else {
      clearTimeout(timeoutId);
      body.classList.remove('alarm');
      modal.style.display = 'none';
    }

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
    event.target.checked = false;
  }
});
