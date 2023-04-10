const button = document.querySelector("#checkbox");
const body = document.querySelector("body");
const modal = document.querySelector(".modal");
const cancelBtn = document.querySelector(".cancel-btn");
const okBtn = document.querySelector(".ok-btn");
const timer = document.querySelector(".timer");

function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function showModal() {
  modal.style.display = "initial";
}

function hideModal() {
  modal.style.display = "none";
}

cancelBtn.addEventListener("click", () => {
  hideModal();
  button.classList.remove("checked");
});

okBtn.addEventListener("click", (event) => {
  hideModal();
  delay(10000).then(() => {
    button.classList.add("checked");
  });
  fetch(`/start-alarm`, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      alarm: event.target.checked,
    }),
  });
  timer.style.display = "initial";
});

button.addEventListener("change", (event) => {
  if (event.target.checked) {
    showModal();
    button.classList.remove("checked");
  } else {
    hideModal();
    timer.style.display = "none";
  }
});

timer.style.display = "none";
let minutes = 0;
let seconds = 0;

const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");

setInterval(() => {
  seconds++;

  if (seconds === 60) {
    seconds = 0;
    minutes++;
  }

  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedSeconds = seconds.toString().padStart(2, "0");

  minutesEl.textContent = formattedMinutes;
  secondsEl.textContent = formattedSeconds;
}, 1000);
