const revealItems = document.querySelectorAll(".reveal");
const tiltItems = document.querySelectorAll("[data-tilt]");
const ticker = document.querySelector(".ticker");

if (ticker) {
  ticker.innerHTML += ticker.innerHTML;
}

const revealObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  }
}, { threshold: 0.16 });

for (const item of revealItems) {
  revealObserver.observe(item);
}

for (const item of tiltItems) {
  item.addEventListener("pointermove", (event) => {
    const rect = item.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 8;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * -8;
    item.style.setProperty("--tilt-x", `${y.toFixed(2)}deg`);
    item.style.setProperty("--tilt-y", `${x.toFixed(2)}deg`);
  });

  item.addEventListener("pointerleave", () => {
    item.style.setProperty("--tilt-x", "0deg");
    item.style.setProperty("--tilt-y", "0deg");
  });
}
