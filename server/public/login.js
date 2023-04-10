const form = document.getElementById('form');
const handleSubmit = (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const formProps = Object.fromEntries(formData);
  fetch('/login', {
    method: 'POST',
    body: JSON.stringify(formProps),
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json',
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.result == 'redirect') {
        window.location.replace(data.url);
      } else if (data.error) {
        if (!document.getElementById('error')) {
          const passwordField = document.getElementById('password-field');
          console.log(passwordField);
          passwordField.value = '';
          passwordField.placeholder = data.error;
          passwordField.style.background = '#ff5757';
          setTimeout(() => {
            passwordField.style.background = 'revert';
            passwordField.placeholder = 'password';
          }, 1500);
        }
      }
    });
};

form.addEventListener('submit', handleSubmit);
